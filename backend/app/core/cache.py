"""
Redis caching utilities for performance optimization
"""
import json
import redis
from typing import Optional, Any, Callable, Union
from datetime import timedelta
from functools import wraps
import hashlib
from app.core.config import settings

# Initialize Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class CacheManager:
    """Centralized cache management"""
    
    def __init__(self, client: redis.Redis):
        self.client = client
        self.default_ttl = 3600  # 1 hour default
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL"""
        try:
            ttl = ttl or self.default_ttl
            return self.client.setex(
                key,
                ttl,
                json.dumps(value, default=str)
            )
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            return bool(self.client.exists(key))
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False

# Global cache instance
cache = CacheManager(redis_client)

# Cache key generators
def generate_cache_key(*args, prefix: str = "") -> str:
    """Generate consistent cache key from arguments"""
    key_parts = [str(arg) for arg in args]
    key_string = ":".join(key_parts)
    
    # Hash long keys to prevent Redis key length issues
    if len(key_string) > 200:
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"{prefix}:{key_hash}" if prefix else key_hash
    
    return f"{prefix}:{key_string}" if prefix else key_string

# Cache decorators
def cached(
    ttl: Union[int, timedelta] = 3600,
    prefix: str = "",
    key_func: Optional[Callable] = None
):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                func_name = f"{func.__module__}.{func.__name__}"
                args_key = generate_cache_key(*args, *sorted(kwargs.items()))
                cache_key = f"{prefix}:{func_name}:{args_key}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            # Convert timedelta to seconds
            cache_ttl = ttl.total_seconds() if isinstance(ttl, timedelta) else ttl
            cache.set(cache_key, result, int(cache_ttl))
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                func_name = f"{func.__module__}.{func.__name__}"
                args_key = generate_cache_key(*args, *sorted(kwargs.items()))
                cache_key = f"{prefix}:{func_name}:{args_key}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            
            # Convert timedelta to seconds
            cache_ttl = ttl.total_seconds() if isinstance(ttl, timedelta) else ttl
            cache.set(cache_key, result, int(cache_ttl))
            
            return result
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Specific cache utilities
class QuranCache:
    """Quran-specific caching"""
    
    @staticmethod
    def cache_surah(surah_number: int, edition: str, data: dict, ttl: int = 86400):
        """Cache surah data (24 hours)"""
        key = f"quran:surah:{surah_number}:{edition}"
        return cache.set(key, data, ttl)
    
    @staticmethod
    def get_surah(surah_number: int, edition: str) -> Optional[dict]:
        """Get cached surah data"""
        key = f"quran:surah:{surah_number}:{edition}"
        return cache.get(key)
    
    @staticmethod
    def cache_verse(surah: int, ayah: int, edition: str, data: dict, ttl: int = 86400):
        """Cache verse data"""
        key = f"quran:verse:{surah}:{ayah}:{edition}"
        return cache.set(key, data, ttl)
    
    @staticmethod
    def invalidate_surah(surah_number: int):
        """Invalidate all cached data for a surah"""
        pattern = f"quran:*:{surah_number}:*"
        return cache.delete_pattern(pattern)

class PrayerCache:
    """Prayer times caching"""
    
    @staticmethod
    def cache_times(lat: float, lng: float, date: str, data: dict, ttl: int = 3600):
        """Cache prayer times (1 hour)"""
        # Round coordinates to 2 decimal places for better cache hits
        lat_rounded = round(lat, 2)
        lng_rounded = round(lng, 2)
        key = f"prayer:times:{lat_rounded}:{lng_rounded}:{date}"
        return cache.set(key, data, ttl)
    
    @staticmethod
    def get_times(lat: float, lng: float, date: str) -> Optional[dict]:
        """Get cached prayer times"""
        lat_rounded = round(lat, 2)
        lng_rounded = round(lng, 2)
        key = f"prayer:times:{lat_rounded}:{lng_rounded}:{date}"
        return cache.get(key)

class UserCache:
    """User-specific caching"""
    
    @staticmethod
    def cache_user(user_id: int, data: dict, ttl: int = 300):
        """Cache user data (5 minutes)"""
        key = f"user:data:{user_id}"
        return cache.set(key, data, ttl)
    
    @staticmethod
    def get_user(user_id: int) -> Optional[dict]:
        """Get cached user data"""
        key = f"user:data:{user_id}"
        return cache.get(key)
    
    @staticmethod
    def invalidate_user(user_id: int):
        """Invalidate user cache"""
        patterns = [
            f"user:data:{user_id}",
            f"user:favorites:{user_id}",
            f"user:bookmarks:{user_id}",
            f"user:history:{user_id}:*"
        ]
        total_deleted = 0
        for pattern in patterns:
            total_deleted += cache.delete_pattern(pattern)
        return total_deleted

# Cache warming utilities
async def warm_cache():
    """Pre-populate cache with frequently accessed data"""
    from app.services.quran_service import get_popular_surahs
    from app.services.hadith_service import get_popular_collections
    
    # Warm popular Quran surahs
    popular_surahs = [1, 2, 36, 67, 112, 114]  # Al-Fatiha, Al-Baqarah, Ya-Sin, etc.
    editions = ['quran-simple', 'en.sahih', 'ar.muyassar']
    
    for surah in popular_surahs:
        for edition in editions:
            # This would call your actual API
            # await get_surah_data(surah, edition)
            pass
    
    print("Cache warming completed")

# Cache statistics
def get_cache_stats() -> dict:
    """Get cache statistics"""
    try:
        info = redis_client.info()
        return {
            "used_memory": info.get("used_memory_human", "N/A"),
            "connected_clients": info.get("connected_clients", 0),
            "total_commands_processed": info.get("total_commands_processed", 0),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "hit_rate": round(
                info.get("keyspace_hits", 0) / 
                (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1)) * 100, 
                2
            ) if info.get("keyspace_hits", 0) > 0 else 0
        }
    except Exception as e:
        print(f"Error getting cache stats: {e}")
        return {}