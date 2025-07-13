from fastapi import APIRouter
from app.api.endpoints import auth, users, favorites, prayers, zakat, stats, bookmarks
from app.api.v1.endpoints import hadith
from app.api.v1.api import api_v1_router
from app.api import quran

api_router = APIRouter()

# Original endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
api_router.include_router(prayers.router, prefix="/prayer-logs", tags=["prayers"])
api_router.include_router(zakat.router, prefix="/zakat", tags=["zakat"])
api_router.include_router(stats.router, prefix="/stats", tags=["statistics"])
api_router.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
api_router.include_router(hadith.router, prefix="/hadith", tags=["hadith"])
api_router.include_router(quran.router, prefix="/quran", tags=["quran"])

# V1 API routes
api_router.include_router(api_v1_router, prefix="/v1")