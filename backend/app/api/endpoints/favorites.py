from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user
from app.db import get_db
from app.models import User, FavoriteVerse
from app.schemas import FavoriteVerseCreate, FavoriteVerseResponse

router = APIRouter()

@router.post("/verses", response_model=FavoriteVerseResponse)
def save_favorite_verse(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    verse_in: FavoriteVerseCreate
) -> Any:
    """Save a favorite verse"""
    # Check if already favorited
    existing = db.query(FavoriteVerse).filter(
        FavoriteVerse.user_id == current_user.id,
        FavoriteVerse.verse_number == verse_in.verse_number,
        FavoriteVerse.surah_number == verse_in.surah_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Verse already in favorites"
        )
    
    favorite = FavoriteVerse(
        **verse_in.dict(),
        user_id=current_user.id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    return favorite

@router.get("/verses", response_model=List[FavoriteVerseResponse])
def get_favorite_verses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get user's favorite verses"""
    favorites = db.query(FavoriteVerse).filter(
        FavoriteVerse.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return favorites

@router.delete("/verses/{verse_id}")
def delete_favorite_verse(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    verse_id: int
) -> Any:
    """Remove verse from favorites"""
    favorite = db.query(FavoriteVerse).filter(
        FavoriteVerse.id == verse_id,
        FavoriteVerse.user_id == current_user.id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Favorite removed successfully"}