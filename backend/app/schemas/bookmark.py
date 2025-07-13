from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookmarkBase(BaseModel):
    type: str  # 'quran', 'hadith', etc.
    surah_number: Optional[int] = None
    ayah_number: Optional[int] = None
    hadith_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

class BookmarkCreate(BookmarkBase):
    pass

class BookmarkResponse(BookmarkBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True