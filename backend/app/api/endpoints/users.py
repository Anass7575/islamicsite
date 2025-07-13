from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user
from app.db import get_db
from app.models import User
from app.schemas import UserResponse

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get current user profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    full_name: str = None
) -> Any:
    """Update user profile"""
    if full_name:
        current_user.full_name = full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user