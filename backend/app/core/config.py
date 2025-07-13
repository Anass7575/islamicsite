from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Al-Hidaya Platform"
    APP_VERSION: str = os.getenv("API_VERSION", "v1")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379")
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "")
    if not SECRET_KEY:
        raise ValueError(
            "JWT_SECRET environment variable is required. "
            "Please set it to a secure random string (32+ characters)."
        )
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    cors_origins: str = os.getenv("CORS_ORIGINS", "")
    if cors_origins:
        BACKEND_CORS_ORIGINS = [origin.strip() for origin in cors_origins.split(",")]
    else:
        # Default for development only
        if ENVIRONMENT == "development":
            BACKEND_CORS_ORIGINS = [
                "http://localhost:3000",
                "http://localhost:3003",
                "http://frontend:3000"
            ]
    
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    RATE_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "600"))
    
    # API Keys (for external services)
    ALADHAN_API_URL: str = "https://api.aladhan.com/v1"
    ALQURAN_API_URL: str = "https://api.alquran.cloud/v1"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()