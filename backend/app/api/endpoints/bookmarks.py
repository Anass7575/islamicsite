from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user
from app.db import get_db
from app.models import User, Bookmark
from app.schemas.bookmark import BookmarkCreate, BookmarkResponse

router = APIRouter()

@router.post("/", response_model=BookmarkResponse)
def create_bookmark(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    bookmark_in: BookmarkCreate
) -> Any:
    """Create a new bookmark"""
    # Check if bookmark already exists
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.type == bookmark_in.type,
        Bookmark.surah_number == bookmark_in.surah_number,
        Bookmark.ayah_number == bookmark_in.ayah_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Bookmark already exists"
        )
    
    bookmark = Bookmark(
        **bookmark_in.dict(),
        user_id=current_user.id
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    return bookmark

@router.get("/", response_model=List[BookmarkResponse])
def get_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    type: str = None,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get user's bookmarks"""
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    
    if type:
        query = query.filter(Bookmark.type == type)
    
    bookmarks = query.order_by(Bookmark.created_at.desc()).offset(skip).limit(limit).all()
    
    return bookmarks

@router.delete("/{bookmark_id}")
def delete_bookmark(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    bookmark_id: int
) -> Any:
    """Delete a bookmark"""
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == current_user.id
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=404,
            detail="Bookmark not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark deleted successfully"}