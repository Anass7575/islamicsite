from fastapi import APIRouter
from app.api.v1.endpoints import quran, prayer_times, hadith_search

api_v1_router = APIRouter()

# Include v1 endpoints
api_v1_router.include_router(quran.router, prefix="/quran", tags=["quran"])
api_v1_router.include_router(prayer_times.router, prefix="/prayer-times", tags=["prayer-times"])
api_v1_router.include_router(hadith_search.router, prefix="/hadith", tags=["hadith-search"])