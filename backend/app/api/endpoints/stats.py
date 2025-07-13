from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from app.db import get_db
from app.models import User, FavoriteVerse, PrayerLog, ZakatCalculation

router = APIRouter()

@router.get("/")
def get_platform_stats(
    db: Session = Depends(get_db)
) -> Any:
    """Get global platform statistics"""
    # Total users
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Total prayers logged
    total_prayers = db.query(PrayerLog).count()
    
    # Total verses saved
    total_verses_saved = db.query(FavoriteVerse).count()
    
    # Total zakat calculated
    total_zakat = db.query(func.sum(ZakatCalculation.zakat_amount)).scalar() or 0
    
    # Active users today
    today = datetime.utcnow().date()
    active_today = db.query(PrayerLog.user_id).filter(
        func.date(PrayerLog.prayed_at) == today
    ).distinct().count()
    
    return {
        "total_users": total_users,
        "total_prayers_logged": total_prayers,
        "total_verses_saved": total_verses_saved,
        "total_zakat_calculated": total_zakat,
        "active_users_today": active_today,
        "platform_health": "operational"
    }

@router.get("/overview")
def get_stats_overview(
    db: Session = Depends(get_db)
) -> Any:
    """Get platform statistics overview"""
    # This is an alias for the main stats endpoint
    return get_platform_stats(db)

@router.get("/diagnostics")
def get_diagnostics(
    db: Session = Depends(get_db)
) -> Any:
    """Get comprehensive system diagnostics"""
    from app.models import Hadith, HadithCollection
    from app.core.security import pwd_context
    import bcrypt
    
    # Content metrics
    hadith_count = db.query(Hadith).count()
    collection_count = db.query(HadithCollection).count()
    
    # Test authentication
    try:
        test_hash = pwd_context.hash("test")
        auth_status = "✅ Operational"
        bcrypt_version = bcrypt.__version__ if hasattr(bcrypt, '__version__') else "Unknown"
    except Exception as e:
        auth_status = f"❌ Error: {str(e)}"
        bcrypt_version = "Error"
    
    # Test Arabic search
    arabic_search_test = db.query(Hadith).filter(
        Hadith.arabic_text.ilike('%العلم%')
    ).count()
    
    english_search_test = db.query(Hadith).filter(
        Hadith.english_text.ilike('%knowledge%')
    ).count()
    
    # Calculate import progress
    expected_hadiths = 40000
    import_progress = (hadith_count / expected_hadiths * 100) if expected_hadiths > 0 else 0
    
    return {
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "diagnostics": {
            "content": {
                "hadiths": hadith_count,
                "collections": collection_count,
                "expected_hadiths": expected_hadiths,
                "import_progress": f"{import_progress:.1f}%",
                "import_complete": hadith_count >= expected_hadiths
            },
            "authentication": {
                "status": auth_status,
                "bcrypt_version": bcrypt_version,
                "password_hashing_working": auth_status == "✅ Operational"
            },
            "search": {
                "arabic_search_working": arabic_search_test > 0,
                "arabic_results_for_ilm": arabic_search_test,
                "english_search_working": english_search_test > 0,
                "english_results_for_knowledge": english_search_test
            },
            "database": {
                "connection": "✅ Connected",
                "total_tables": len(db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).fetchall())
            }
        },
        "recommendations": [
            f"⚠️ Import more hadiths ({hadith_count}/{expected_hadiths})" if hadith_count < expected_hadiths else "✅ Content complete",
            "✅ Authentication working" if auth_status == "✅ Operational" else "❌ Fix authentication",
            "✅ Arabic search working" if arabic_search_test > 0 else "⚠️ Improve Arabic search indexing",
            "✅ Database healthy" if hadith_count > 0 else "❌ Database empty"
        ]
    }