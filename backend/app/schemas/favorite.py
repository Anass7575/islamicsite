from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FavoriteVerseBase(BaseModel):
    verse_number: int
    surah_number: int
    surah_name: str
    surah_name_arabic: Optional[str] = None
    verse_arabic: str
    verse_translation: Optional[str] = None
    verse_transliteration: Optional[str] = None

class FavoriteVerseCreate(FavoriteVerseBase):
    pass

class FavoriteVerseResponse(FavoriteVerseBase):
    id: int
    user_id: int
    saved_at: datetime
    
    class Config:
        from_attributes = True