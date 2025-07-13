"""
Database query optimization utilities
"""
from typing import List, Optional, Any, Dict
from sqlalchemy.orm import Session, Query, selectinload, joinedload, contains_eager
from sqlalchemy import and_, or_, func, select
from sqlalchemy.sql import text
from app.models import User, PrayerLog, Bookmark, FavoriteVerse, ZakatCalculation
from app.core.cache import cached, cache
import logging

logger = logging.getLogger(__name__)

class QueryOptimizer:
    """Optimize database queries with eager loading and batch operations"""
    
    @staticmethod
    def get_user_with_relations(db: Session, user_id: int) -> Optional[User]:
        """Get user with all related data in single query"""
        return db.query(User).options(
            selectinload(User.favorite_verses),
            selectinload(User.prayer_logs),
            selectinload(User.bookmarks),
            selectinload(User.zakat_calculations)
        ).filter(User.id == user_id).first()
    
    @staticmethod
    def get_users_batch(db: Session, user_ids: List[int]) -> List[User]:
        """Get multiple users in single query"""
        return db.query(User).filter(
            User.id.in_(user_ids)
        ).all()
    
    @staticmethod
    def get_user_prayer_stats(db: Session, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get prayer statistics with optimized query"""
        from datetime import datetime, timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Single query to get all prayer counts
        prayer_stats = db.query(
            PrayerLog.prayer_name,
            func.count(PrayerLog.id).label('count')
        ).filter(
            and_(
                PrayerLog.user_id == user_id,
                PrayerLog.prayer_date >= start_date
            )
        ).group_by(PrayerLog.prayer_name).all()
        
        # Convert to dict
        stats = {prayer: count for prayer, count in prayer_stats}
        
        # Get streak information
        streak_query = text("""
            WITH prayer_dates AS (
                SELECT DISTINCT DATE(prayer_date) as prayer_day
                FROM prayer_logs
                WHERE user_id = :user_id
                AND prayer_date >= :start_date
                ORDER BY prayer_day DESC
            ),
            date_groups AS (
                SELECT 
                    prayer_day,
                    prayer_day - INTERVAL (ROW_NUMBER() OVER (ORDER BY prayer_day)) DAY as grp
                FROM prayer_dates
            )
            SELECT 
                COUNT(*) as streak_length,
                MIN(prayer_day) as streak_start,
                MAX(prayer_day) as streak_end
            FROM date_groups
            GROUP BY grp
            ORDER BY streak_end DESC
            LIMIT 1
        """)
        
        streak_result = db.execute(
            streak_query,
            {"user_id": user_id, "start_date": start_date}
        ).first()
        
        return {
            "prayer_counts": stats,
            "total_prayers": sum(stats.values()),
            "current_streak": streak_result[0] if streak_result else 0,
            "period_days": days
        }
    
    @staticmethod
    def batch_create(db: Session, model_class: Any, items: List[Dict]) -> List[Any]:
        """Batch create multiple records efficiently"""
        if not items:
            return []
        
        # Use bulk_insert_mappings for better performance
        db.bulk_insert_mappings(model_class, items)
        db.commit()
        
        # Return created items (note: they won't have IDs if using bulk insert)
        return items
    
    @staticmethod
    def batch_update(db: Session, model_class: Any, updates: List[Dict]) -> int:
        """Batch update multiple records
        updates: List of dicts with 'id' and fields to update
        """
        if not updates:
            return 0
        
        # Use bulk_update_mappings
        db.bulk_update_mappings(model_class, updates)
        db.commit()
        
        return len(updates)

class PaginationOptimizer:
    """Optimize paginated queries"""
    
    @staticmethod
    def paginate_query(
        query: Query,
        page: int = 1,
        per_page: int = 20,
        max_per_page: int = 100
    ) -> Dict[str, Any]:
        """Efficiently paginate query results"""
        # Limit per_page to max
        per_page = min(per_page, max_per_page)
        
        # Get total count (cached)
        total = query.count()
        
        # Calculate pagination
        total_pages = (total + per_page - 1) // per_page
        offset = (page - 1) * per_page
        
        # Get items for current page
        items = query.offset(offset).limit(per_page).all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    
    @staticmethod
    def cursor_paginate(
        db: Session,
        model_class: Any,
        cursor_field: str = "id",
        cursor_value: Optional[Any] = None,
        limit: int = 20,
        direction: str = "next"
    ) -> Dict[str, Any]:
        """Cursor-based pagination for better performance on large datasets"""
        query = db.query(model_class)
        
        # Apply cursor filter
        if cursor_value is not None:
            cursor_attr = getattr(model_class, cursor_field)
            if direction == "next":
                query = query.filter(cursor_attr > cursor_value)
            else:
                query = query.filter(cursor_attr < cursor_value)
                query = query.order_by(cursor_attr.desc())
        
        # Get items
        items = query.limit(limit + 1).all()
        
        # Check if there are more items
        has_more = len(items) > limit
        if has_more:
            items = items[:-1]
        
        # Reverse items if going backwards
        if direction == "prev":
            items.reverse()
        
        # Get cursors
        next_cursor = getattr(items[-1], cursor_field) if items else None
        prev_cursor = getattr(items[0], cursor_field) if items else None
        
        return {
            "items": items,
            "cursors": {
                "next": next_cursor,
                "prev": prev_cursor
            },
            "has_next": has_more if direction == "next" else bool(prev_cursor),
            "has_prev": bool(prev_cursor) if direction == "next" else has_more
        }

# Query result caching decorators
def cache_query_result(ttl: int = 300, prefix: str = "query"):
    """Cache database query results"""
    from functools import wraps
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute query and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Optimized repository pattern
class OptimizedRepository:
    """Base repository with optimization features"""
    
    def __init__(self, db: Session, model_class: Any):
        self.db = db
        self.model_class = model_class
    
    @cache_query_result(ttl=300)
    def get_by_id(self, id: int, load_relations: List[str] = None):
        """Get entity by ID with optional eager loading"""
        query = self.db.query(self.model_class)
        
        # Add eager loading if specified
        if load_relations:
            for relation in load_relations:
                query = query.options(selectinload(getattr(self.model_class, relation)))
        
        return query.filter(self.model_class.id == id).first()
    
    def get_many(
        self,
        filters: Dict[str, Any] = None,
        order_by: str = None,
        limit: int = None,
        offset: int = None,
        load_relations: List[str] = None
    ):
        """Get multiple entities with filters and options"""
        query = self.db.query(self.model_class)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.filter(getattr(self.model_class, field) == value)
        
        # Add eager loading
        if load_relations:
            for relation in load_relations:
                query = query.options(selectinload(getattr(self.model_class, relation)))
        
        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                query = query.order_by(getattr(self.model_class, order_by[1:]).desc())
            else:
                query = query.order_by(getattr(self.model_class, order_by))
        
        # Apply pagination
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def count(self, filters: Dict[str, Any] = None) -> int:
        """Count entities with filters"""
        query = self.db.query(func.count(self.model_class.id))
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model_class, field):
                    query = query.filter(getattr(self.model_class, field) == value)
        
        return query.scalar()
    
    def exists(self, **kwargs) -> bool:
        """Check if entity exists"""
        return self.db.query(
            self.db.query(self.model_class).filter_by(**kwargs).exists()
        ).scalar()
    
    def bulk_create(self, items: List[Dict]) -> None:
        """Efficiently create multiple entities"""
        self.db.bulk_insert_mappings(self.model_class, items)
        self.db.commit()
    
    def bulk_update(self, updates: List[Dict]) -> None:
        """Efficiently update multiple entities"""
        self.db.bulk_update_mappings(self.model_class, updates)
        self.db.commit()