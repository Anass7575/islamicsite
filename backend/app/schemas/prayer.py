from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PrayerLogBase(BaseModel):
    prayer_name: str  # Fajr, Dhuhr, Asr, Maghrib, Isha
    prayer_time: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None

class PrayerLogCreate(PrayerLogBase):
    pass

class PrayerLogResponse(PrayerLogBase):
    id: int
    user_id: int
    prayed_at: datetime
    
    class Config:
        from_attributes = True

class PrayerStats(BaseModel):
    total_prayers: int
    prayers_today: int
    prayers_this_week: int
    prayers_this_month: int
    most_consistent_prayer: str
    completion_rate: float