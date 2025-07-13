"""Base repository with common database operations."""

from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, and_

from app.db.base_class import Base


ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get(self, id: Any) -> Optional[ModelType]:
        """Get a single record by ID."""
        try:
            return self.db.query(self.model).filter(
                self.model.id == id
            ).first()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[List] = None
    ) -> List[ModelType]:
        """Get multiple records with optional filtering."""
        try:
            query = self.db.query(self.model)
            
            if filters:
                query = query.filter(*filters)
            
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def create(self, *, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        try:
            db_obj = self.model(**obj_in)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def update(
        self,
        *,
        db_obj: ModelType,
        obj_in: Dict[str, Any]
    ) -> ModelType:
        """Update an existing record."""
        try:
            for field, value in obj_in.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def delete(self, *, id: Any) -> Optional[ModelType]:
        """Delete a record by ID."""
        try:
            obj = self.get(id)
            if obj:
                self.db.delete(obj)
                self.db.commit()
            return obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def exists(self, **kwargs) -> bool:
        """Check if a record exists with given criteria."""
        try:
            filters = [
                getattr(self.model, key) == value
                for key, value in kwargs.items()
                if hasattr(self.model, key)
            ]
            
            return self.db.query(self.model).filter(
                and_(*filters)
            ).first() is not None
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    def count(self, filters: Optional[List] = None) -> int:
        """Count records with optional filtering."""
        try:
            query = self.db.query(self.model)
            
            if filters:
                query = query.filter(*filters)
            
            return query.count()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e