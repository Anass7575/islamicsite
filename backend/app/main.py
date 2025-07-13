from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base, engine
from app.middleware.compression import get_compression_middleware
from app.middleware.cache import CacheMiddleware, get_redis_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Al-Hidaya API...")
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize Redis connection for caching
    app.state.redis = await get_redis_client()
    logger.info("Redis cache initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Al-Hidaya API...")
    await app.state.redis.close()

# Create FastAPI app
app = FastAPI(
    title="Al-Hidaya API",
    description="Comprehensive Islamic Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Add compression middleware
app.add_middleware(
    get_compression_middleware(
        minimum_size=1000,  # Compress responses larger than 1KB
        gzip_level=6,       # Balanced compression level
        brotli_quality=4,   # Fast brotli compression
        exclude_paths=["/health", "/metrics", "/docs", "/redoc", "/openapi.json", "/api/hadith", "/api/quran"]
    )
)

# Add cache middleware after initialization
@app.on_event("startup")
async def add_cache_middleware():
    """Add cache middleware after Redis is initialized."""
    app.add_middleware(
        CacheMiddleware,
        redis_client=app.state.redis,
        default_ttl=300,  # 5 minutes default
        cache_prefix="api_cache:",
        exclude_paths=["/health", "/metrics", "/docs", "/redoc", "/openapi.json", "/auth", "/api/auth"],
        include_query_params=True
    )

@app.get("/")
async def root():
    return {
        "message": "Welcome to Al-Hidaya API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "al-hidaya-api"
    }

# Validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "message": "Invalid input data"
        }
    )

# Include API router
app.include_router(api_router, prefix="/api")