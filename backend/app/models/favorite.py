from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class FavoriteVerse(Base):
    __tablename__ = "favorite_verses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verse_number = Column(Integer, nullable=False)
    surah_number = Column(Integer, nullable=False)
    surah_name = Column(String, nullable=False)
    surah_name_arabic = Column(String)
    verse_arabic = Column(Text, nullable=False)
    verse_translation = Column(Text)
    verse_transliteration = Column(Text)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="favorite_verses")