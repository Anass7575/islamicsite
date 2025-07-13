"""User repository with specialized queries."""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime, timedelta

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for user-specific database operations."""
    
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.db.query(User).filter(
            User.email == email
        ).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(
            User.username == username
        ).first()
    
    def get_by_email_or_username(
        self,
        email: str,
        username: str
    ) -> Optional[User]:
        """Get user by email OR username (for checking duplicates)."""
        return self.db.query(User).filter(
            or_(User.email == email, User.username == username)
        ).first()
    
    def create_user(self, user_in: UserCreate) -> User:
        """Create a new user with hashed password."""
        hashed_password = get_password_hash(user_in.password)
        
        user_data = user_in.dict(exclude={"password"})
        user_data["hashed_password"] = hashed_password
        
        return self.create(obj_in=user_data)
    
    def update_user(
        self,
        user: User,
        user_update: UserUpdate
    ) -> User:
        """Update user information."""
        update_data = user_update.dict(exclude_unset=True)
        
        # Handle password update separately
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        return self.update(db_obj=user, obj_in=update_data)
    
    def authenticate(
        self,
        email_or_username: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user by email/username and password."""
        # Try to find user by email first, then username
        user = self.get_by_email(email_or_username)
        if not user:
            user = self.get_by_username(email_or_username)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def get_active_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get all active users."""
        return self.get_multi(
            skip=skip,
            limit=limit,
            filters=[User.is_active == True]
        )
    
    def get_superusers(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get all superusers."""
        return self.get_multi(
            skip=skip,
            limit=limit,
            filters=[User.is_superuser == True]
        )
    
    def get_users_by_role(
        self,
        role: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get users by role."""
        return self.get_multi(
            skip=skip,
            limit=limit,
            filters=[User.role == role]
        )
    
    def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Search users by name, email, or username."""
        search_filter = or_(
            User.full_name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%"),
            User.username.ilike(f"%{query}%")
        )
        
        return self.get_multi(
            skip=skip,
            limit=limit,
            filters=[search_filter]
        )
    
    def get_recent_users(
        self,
        days: int = 7,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get users created in the last N days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return self.get_multi(
            skip=skip,
            limit=limit,
            filters=[User.created_at >= cutoff_date]
        )
    
    def update_last_login(self, user: User) -> User:
        """Update user's last login timestamp."""
        return self.update(
            db_obj=user,
            obj_in={"last_login": datetime.utcnow()}
        )
    
    def activate_user(self, user: User) -> User:
        """Activate a user account."""
        return self.update(
            db_obj=user,
            obj_in={"is_active": True}
        )
    
    def deactivate_user(self, user: User) -> User:
        """Deactivate a user account."""
        return self.update(
            db_obj=user,
            obj_in={"is_active": False}
        )
    
    def count_by_role(self, role: str) -> int:
        """Count users by role."""
        return self.count(filters=[User.role == role])
    
    def count_active_users(self) -> int:
        """Count active users."""
        return self.count(filters=[User.is_active == True])