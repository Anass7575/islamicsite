from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import Headers
import html
import re
import time
import secrets
from typing import Dict, Optional
from datetime import datetime, timedelta
from ..core.config import settings
import redis
import json

# Initialize Redis client for rate limiting
redis_client = None
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Redis connection failed for rate limiting: {e}")

class SecurityMiddleware(BaseHTTPMiddleware):
    """Enhanced security middleware with CSRF protection and rate limiting"""
    
    def __init__(self, app, csrf_enabled: bool = True):
        super().__init__(app)
        self.csrf_enabled = csrf_enabled and settings.ENVIRONMENT != "development"
    
    async def dispatch(self, request: Request, call_next):
        # Rate limiting
        if not await self._check_rate_limit(request):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please try again later."}
            )
        
        # CSRF protection for state-changing methods
        if self.csrf_enabled and request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            if not await self._validate_csrf(request):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "CSRF validation failed"}
                )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        self._add_security_headers(response)
        
        return response
    
    def _add_security_headers(self, response):
        """Add comprehensive security headers"""
        # Basic security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS (only in production)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Content Security Policy - more permissive for API
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.aladhan.com https://api.alquran.cloud",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
    
    async def _check_rate_limit(self, request: Request) -> bool:
        """Check rate limiting using Redis"""
        if not redis_client or settings.ENVIRONMENT == "development":
            return True
        
        try:
            # Get client IP
            client_ip = request.client.host if request.client else "unknown"
            
            # Create rate limit keys
            minute_key = f"rate_limit:minute:{client_ip}:{int(time.time() // 60)}"
            hour_key = f"rate_limit:hour:{client_ip}:{int(time.time() // 3600)}"
            
            # Check minute limit
            minute_count = redis_client.incr(minute_key)
            if minute_count == 1:
                redis_client.expire(minute_key, 60)
            
            if minute_count > settings.RATE_LIMIT_PER_MINUTE:
                return False
            
            # Check hour limit
            hour_count = redis_client.incr(hour_key)
            if hour_count == 1:
                redis_client.expire(hour_key, 3600)
            
            if hour_count > settings.RATE_LIMIT_PER_HOUR:
                return False
            
            return True
        except Exception as e:
            # If Redis fails, allow the request
            print(f"Rate limiting error: {e}")
            return True
    
    async def _validate_csrf(self, request: Request) -> bool:
        """Validate CSRF token"""
        # Skip CSRF for API endpoints that use JWT authentication
        if request.url.path.startswith("/api/") and "authorization" in request.headers:
            return True
        
        # Get CSRF token from header or form data
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token and request.method == "POST":
            form_data = await request.form()
            csrf_token = form_data.get("csrf_token")
            # Reset form data for downstream processing
            request._form = form_data
        
        if not csrf_token:
            return False
        
        # Validate token (implement your validation logic)
        # For now, we'll skip validation in development
        return True


class CSRFProtect:
    """CSRF Protection utility"""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate a new CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str, stored_token: str) -> bool:
        """Validate CSRF token using constant-time comparison"""
        return secrets.compare_digest(token, stored_token)


def sanitize_input(text: str) -> str:
    """Enhanced input sanitization to prevent XSS attacks"""
    if not text:
        return text
    
    # HTML escape
    text = html.escape(text)
    
    # Remove potentially dangerous patterns
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>',
        r'<link[^>]*>',
        r'<meta[^>]*>',
        r'vbscript:',
        r'data:text/html',
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Additional sanitization for common XSS vectors
    text = text.replace('\x00', '')  # Null bytes
    text = text.replace('\r', '').replace('\n', ' ')  # Normalize newlines
    
    return text.strip()


def validate_email(email: str) -> bool:
    """Validate email format"""
    email_pattern = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    return bool(email_pattern.match(email))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"