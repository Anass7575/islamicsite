#!/usr/bin/env python3
"""
Generate secure secrets for production deployment
"""

import secrets
import string
import sys
from pathlib import Path

def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def generate_jwt_secret(length: int = 64) -> str:
    """Generate a secure JWT secret"""
    return secrets.token_urlsafe(length)

def generate_env_file():
    """Generate a secure .env file"""
    
    # Generate secrets
    postgres_password = generate_secure_password(20)
    jwt_secret = generate_jwt_secret(32)
    
    env_content = f"""# Generated secure configuration
# Created at: {datetime.now().isoformat()}

# Database Configuration
POSTGRES_USER=alhidaya
POSTGRES_PASSWORD={postgres_password}
POSTGRES_DB=alhidaya_db
DATABASE_URL=postgresql://alhidaya:{postgres_password}@postgres:5432/alhidaya_db

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security Configuration
JWT_SECRET={jwt_secret}
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
DEBUG=false
ENVIRONMENT=production
API_VERSION=v1

# CORS Configuration (update with your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=600

# Email Configuration (update with your SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Monitoring (optional)
SENTRY_DSN=
"""

    # Check if .env already exists
    env_path = Path(__file__).parent.parent / '.env.production'
    if env_path.exists():
        print("Warning: .env.production already exists!")
        response = input("Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            return
    
    # Write the file
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    # Set restrictive permissions (Unix-like systems only)
    try:
        import os
        os.chmod(env_path, 0o600)  # Read/write for owner only
    except:
        pass
    
    print(f"✅ Generated secure .env.production file")
    print(f"📝 Postgres Password: {postgres_password}")
    print(f"🔐 JWT Secret: {jwt_secret[:20]}...")
    print("\n⚠️  IMPORTANT:")
    print("1. Save these credentials securely")
    print("2. Update CORS_ORIGINS with your actual domain")
    print("3. Configure email settings for password reset")
    print("4. Never commit this file to version control")

if __name__ == "__main__":
    from datetime import datetime
    
    print("🔐 Al-Hidaya Security Configuration Generator")
    print("=" * 50)
    
    generate_env_file()