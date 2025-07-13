from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class HadithCollection(Base):
    __tablename__ = "hadith_collections"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    arabic_name = Column(String(200), nullable=False)
    author = Column(String(200), nullable=False)
    author_arabic = Column(String(200), nullable=False)
    description = Column(Text)
    total_hadiths = Column(Integer, default=0)
    books = Column(Integer, default=0)
    authenticity = Column(String(20))  # sahih, hasan, mixed
    
    # Relationships
    hadiths = relationship("Hadith", back_populates="collection")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class HadithBook(Base):
    __tablename__ = "hadith_books"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("hadith_collections.id"))
    book_number = Column(Integer, nullable=False)
    name = Column(String(200), nullable=False)
    arabic_name = Column(String(200))
    hadith_count = Column(Integer, default=0)
    
    # Relationships
    collection = relationship("HadithCollection")
    hadiths = relationship("Hadith", back_populates="book")
    
    # Unique constraint
    __table_args__ = (
        Index('ix_hadith_book_collection_number', 'collection_id', 'book_number', unique=True),
    )


class Hadith(Base):
    __tablename__ = "hadiths"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("hadith_collections.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("hadith_books.id"), nullable=False)
    hadith_number = Column(Integer, nullable=False)
    arabic_text = Column(Text, nullable=False)
    english_text = Column(Text)
    french_text = Column(Text)
    narrator_chain = Column(Text)
    arabic_narrator_chain = Column(Text)
    grade = Column(String(20))  # sahih, hasan, da'if, mawdu'
    grade_text = Column(String(100))
    reference = Column(String(200))
    categories = Column(JSONB, default=list)  # Array of category IDs
    
    # Search optimization
    search_vector = Column(Text)  # For full-text search
    
    # Relationships
    collection = relationship("HadithCollection", back_populates="hadiths")
    book = relationship("HadithBook", back_populates="hadiths")
    notes = relationship("HadithNote", back_populates="hadith")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes for performance
    __table_args__ = (
        Index('ix_hadith_collection_number', 'collection_id', 'hadith_number'),
        Index('ix_hadith_book_number', 'book_id', 'hadith_number'),
        Index('ix_hadith_grade', 'grade'),
    )


class HadithCategory(Base):
    __tablename__ = "hadith_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    arabic_name = Column(String(100), nullable=False)
    icon = Column(String(10))
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("hadith_categories.id"), nullable=True)
    
    # Self-referential relationship for subcategories
    parent = relationship("HadithCategory", remote_side=[id], back_populates="subcategories")
    subcategories = relationship("HadithCategory", back_populates="parent", overlaps="parent")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class HadithNote(Base):
    __tablename__ = "hadith_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hadith_id = Column(Integer, ForeignKey("hadiths.id"), nullable=False)
    note_text = Column(Text, nullable=False)
    is_private = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User")
    hadith = relationship("Hadith", back_populates="notes")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Unique constraint - one note per user per hadith
    __table_args__ = (
        Index('ix_hadith_note_user_hadith', 'user_id', 'hadith_id', unique=True),
    )