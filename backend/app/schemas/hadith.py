from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# HadithCollection schemas
class HadithCollectionBase(BaseModel):
    collection_id: str
    name: str
    arabic_name: str
    author: str
    author_arabic: str
    description: Optional[str] = None
    total_hadiths: int = 0
    books: int = 0
    authenticity: Optional[str] = None


class HadithCollectionCreate(HadithCollectionBase):
    pass


class HadithCollectionUpdate(BaseModel):
    description: Optional[str] = None
    total_hadiths: Optional[int] = None
    books: Optional[int] = None


class HadithCollection(HadithCollectionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# HadithBook schemas
class HadithBookBase(BaseModel):
    collection_id: int
    book_number: int
    name: str
    arabic_name: Optional[str] = None
    hadith_count: int = 0


class HadithBookCreate(HadithBookBase):
    pass


class HadithBook(HadithBookBase):
    id: int
    
    class Config:
        from_attributes = True


# Hadith schemas
class HadithBase(BaseModel):
    collection_id: int
    book_id: int
    hadith_number: int
    arabic_text: str
    english_text: Optional[str] = None
    french_text: Optional[str] = None
    narrator_chain: Optional[str] = None
    arabic_narrator_chain: Optional[str] = None
    grade: Optional[str] = None
    grade_text: Optional[str] = None
    reference: Optional[str] = None
    categories: List[str] = []


class HadithCreate(HadithBase):
    pass


class HadithUpdate(BaseModel):
    english_text: Optional[str] = None
    french_text: Optional[str] = None
    grade: Optional[str] = None
    grade_text: Optional[str] = None
    categories: Optional[List[str]] = None


class Hadith(HadithBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class HadithWithCollection(Hadith):
    collection: HadithCollection
    book: HadithBook
    
    class Config:
        from_attributes = True


# HadithCategory schemas
class HadithCategoryBase(BaseModel):
    category_id: str
    name: str
    arabic_name: str
    icon: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None


class HadithCategoryCreate(HadithCategoryBase):
    pass


class HadithCategory(HadithCategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    subcategories: List['HadithCategory'] = []
    
    class Config:
        from_attributes = True


# HadithNote schemas
class HadithNoteBase(BaseModel):
    note_text: str
    is_private: bool = True


class HadithNoteCreate(HadithNoteBase):
    pass


class HadithNoteUpdate(BaseModel):
    note_text: Optional[str] = None
    is_private: Optional[bool] = None


class HadithNote(HadithNoteBase):
    id: int
    user_id: int
    hadith_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Response models
class HadithSearchResult(BaseModel):
    results: List[HadithWithCollection]
    total: int
    page: int
    pages: int
    
    class Config:
        from_attributes = True


class PaginatedHadiths(BaseModel):
    hadiths: List[Hadith]
    total: int
    page: int
    per_page: int
    pages: int
    
    class Config:
        from_attributes = True