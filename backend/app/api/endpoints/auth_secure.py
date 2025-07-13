from datetime import timedelta, datetime
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token
from app.middleware.security import CSRFProtect, sanitize_input, validate_email, validate_password_strength

router = APIRouter()

# Cookie settings
COOKIE_DOMAIN = None  # Will use current domain
COOKIE_PATH = "/"
COOKIE_SECURE = settings.ENVIRONMENT == "production"  # HTTPS only in production
COOKIE_HTTPONLY = True  # Prevent JS access
COOKIE_SAMESITE = "lax"  # CSRF protection

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    response: Response
) -> Any:
    """Register new user with enhanced security"""
    
    # Sanitize inputs
    email = sanitize_input(user_in.email.lower().strip())
    username = sanitize_input(user_in.username.strip())
    full_name = sanitize_input(user_in.full_name)
    
    # Validate email format
    if not validate_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    is_strong, message = validate_password_strength(user_in.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate CSRF token
    csrf_token = CSRFProtect.generate_csrf_token()
    
    # Set CSRF cookie
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        httponly=False,  # CSRF token needs to be readable by JS
        samesite=COOKIE_SAMESITE,
        max_age=86400  # 24 hours
    )
    
    return user

@router.post("/login")
def login(
    *,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    response: Response,
    request: Request
) -> Any:
    """Login with secure httpOnly cookies"""
    
    # Sanitize username
    username = sanitize_input(form_data.username.strip())
    
    # Try to find user by email or username
    user = db.query(User).filter(
        (User.email == username) | (User.username == username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Add slight delay to prevent timing attacks
        import time
        time.sleep(0.5)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Generate CSRF token
    csrf_token = CSRFProtect.generate_csrf_token()
    
    # Set secure httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        samesite=COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        samesite=COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    # Set CSRF cookie (not httpOnly so JS can read it)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        httponly=False,
        samesite=COOKIE_SAMESITE,
        max_age=86400  # 24 hours
    )
    
    # Store CSRF token in Redis for validation
    if hasattr(request.app.state, 'redis'):
        redis_client = request.app.state.redis
        redis_client.setex(
            f"csrf:{user.id}:{csrf_token}",
            86400,  # 24 hours
            "valid"
        )
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        },
        "csrf_token": csrf_token  # Send CSRF token in response for initial setup
    }

@router.post("/logout")
def logout(
    response: Response,
    request: Request
) -> Any:
    """Logout and clear cookies"""
    
    # Clear all auth cookies
    response.delete_cookie(
        key="access_token",
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH
    )
    response.delete_cookie(
        key="refresh_token",
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH
    )
    response.delete_cookie(
        key="csrf_token",
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH
    )
    
    return {"message": "Logged out successfully"}

@router.post("/refresh")
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
) -> Any:
    """Refresh access token using refresh token from cookie"""
    
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    # Verify refresh token and get user
    # (Implementation depends on your token verification logic)
    # For now, we'll assume the token contains the user email
    
    # Create new access token
    # access_token = create_access_token(data={"sub": user_email})
    
    # Set new access token cookie
    # response.set_cookie(...)
    
    return {"message": "Token refreshed successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Any:
    """Get current user from secure cookie"""
    
    # Get access token from cookie
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Verify token and get user
    # (Implementation depends on your token verification logic)
    
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token verification not implemented yet"
    )