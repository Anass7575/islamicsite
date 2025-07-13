"""Refactored user endpoints using repository pattern."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.user import User, UserCreate, UserUpdate
from app.repositories import UserRepository
from app.core.security import get_current_user, get_current_active_superuser


router = APIRouter()


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_superuser)
) -> User:
    """
    Create new user (superuser only).
    """
    user_repo = UserRepository(db)
    
    # Check if user already exists
    if user_repo.get_by_email_or_username(user_in.email, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    user = user_repo.create_user(user_in)
    return user


@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_superuser)
) -> List[User]:
    """
    Retrieve users with filtering options (superuser only).
    """
    user_repo = UserRepository(db)
    
    if search:
        users = user_repo.search_users(search, skip=skip, limit=limit)
    elif role:
        users = user_repo.get_users_by_role(role, skip=skip, limit=limit)
    elif is_active is not None:
        if is_active:
            users = user_repo.get_active_users(skip=skip, limit=limit)
        else:
            # Get inactive users
            filters = [User.is_active == False]
            users = user_repo.get_multi(skip=skip, limit=limit, filters=filters)
    else:
        users = user_repo.get_multi(skip=skip, limit=limit)
    
    return users


@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Update current user.
    """
    user_repo = UserRepository(db)
    
    # Prevent users from making themselves superuser
    if user_update.is_superuser is not None:
        user_update.is_superuser = current_user.is_superuser
    
    user = user_repo.update_user(current_user, user_update)
    return user


@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get a specific user by id.
    """
    user_repo = UserRepository(db)
    user = user_repo.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Non-superusers can only see their own profile
    if not current_user.is_superuser and user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_superuser)
) -> User:
    """
    Update a user (superuser only).
    """
    user_repo = UserRepository(db)
    user = user_repo.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = user_repo.update_user(user, user_update)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(get_current_active_superuser)
) -> None:
    """
    Delete a user (superuser only).
    """
    user_repo = UserRepository(db)
    user = user_repo.delete(id=user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


@router.post("/{user_id}/activate", response_model=User)
def activate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(get_current_active_superuser)
) -> User:
    """
    Activate a user account (superuser only).
    """
    user_repo = UserRepository(db)
    user = user_repo.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )
    
    user = user_repo.activate_user(user)
    return user


@router.post("/{user_id}/deactivate", response_model=User)
def deactivate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(get_current_active_superuser)
) -> User:
    """
    Deactivate a user account (superuser only).
    """
    user_repo = UserRepository(db)
    user = user_repo.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already inactive"
        )
    
    # Prevent deactivating yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = user_repo.deactivate_user(user)
    return user


@router.get("/stats/summary")
def get_user_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_active_superuser)
) -> dict:
    """
    Get user statistics (superuser only).
    """
    user_repo = UserRepository(db)
    
    return {
        "total_users": user_repo.count(),
        "active_users": user_repo.count_active_users(),
        "superusers": user_repo.count(filters=[User.is_superuser == True]),
        "recent_users": len(user_repo.get_recent_users(days=7)),
        "by_role": {
            "admin": user_repo.count_by_role("admin"),
            "user": user_repo.count_by_role("user"),
            "guest": user_repo.count_by_role("guest")
        }
    }