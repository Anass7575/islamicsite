from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PrayerLog(Base):
    __tablename__ = "prayer_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prayer_name = Column(String, nullable=False)  # Fajr, Dhuhr, Asr, Maghrib, Isha
    prayer_time = Column(DateTime(timezone=True), nullable=False)
    prayed_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="prayer_logs")