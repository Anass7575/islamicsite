from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.api.deps import get_current_active_user
from app.db import get_db
from app.models import User, PrayerLog
from app.schemas import PrayerLogCreate, PrayerLogResponse, PrayerStats

router = APIRouter()

@router.post("/", response_model=PrayerLogResponse)
def log_prayer(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    prayer_in: PrayerLogCreate
) -> Any:
    """Log a completed prayer"""
    prayer_log = PrayerLog(
        **prayer_in.dict(),
        user_id=current_user.id
    )
    db.add(prayer_log)
    db.commit()
    db.refresh(prayer_log)
    
    return prayer_log

@router.get("/", response_model=List[PrayerLogResponse])
def get_prayer_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get user's prayer logs"""
    prayers = db.query(PrayerLog).filter(
        PrayerLog.user_id == current_user.id
    ).order_by(PrayerLog.prayed_at.desc()).offset(skip).limit(limit).all()
    
    return prayers

@router.get("/stats", response_model=PrayerStats)
def get_prayer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get user's prayer statistics"""
    now = datetime.utcnow()
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total prayers
    total_prayers = db.query(PrayerLog).filter(
        PrayerLog.user_id == current_user.id
    ).count()
    
    # Prayers today
    prayers_today = db.query(PrayerLog).filter(
        PrayerLog.user_id == current_user.id,
        func.date(PrayerLog.prayed_at) == today
    ).count()
    
    # Prayers this week
    prayers_this_week = db.query(PrayerLog).filter(
        PrayerLog.user_id == current_user.id,
        PrayerLog.prayed_at >= week_ago
    ).count()
    
    # Prayers this month
    prayers_this_month = db.query(PrayerLog).filter(
        PrayerLog.user_id == current_user.id,
        PrayerLog.prayed_at >= month_ago
    ).count()
    
    # Most consistent prayer
    most_consistent = db.query(
        PrayerLog.prayer_name,
        func.count(PrayerLog.id).label('count')
    ).filter(
        PrayerLog.user_id == current_user.id
    ).group_by(PrayerLog.prayer_name).order_by(func.count(PrayerLog.id).desc()).first()
    
    most_consistent_prayer = most_consistent[0] if most_consistent else "None"
    
    # Calculate completion rate (assuming 5 prayers/day for the last 30 days)
    expected_prayers = 5 * 30  # 150 prayers in 30 days
    completion_rate = (prayers_this_month / expected_prayers * 100) if expected_prayers > 0 else 0
    
    return PrayerStats(
        total_prayers=total_prayers,
        prayers_today=prayers_today,
        prayers_this_week=prayers_this_week,
        prayers_this_month=prayers_this_month,
        most_consistent_prayer=most_consistent_prayer,
        completion_rate=min(completion_rate, 100)  # Cap at 100%
    )