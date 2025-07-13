"""
Performance monitoring and metrics collection
"""
from prometheus_client import Counter, Histogram, Gauge, Info
from functools import wraps
import time
import psutil
import asyncio
from typing import Dict, Any, Callable
from datetime import datetime
from app.core.config import settings

# Prometheus metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

active_users = Gauge(
    'active_users_total',
    'Number of active users'
)

database_connections = Gauge(
    'database_connections_active',
    'Active database connections'
)

cache_hits = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cache_misses_total',
    'Total cache misses',
    ['cache_type']
)

prayer_logs_created = Counter(
    'prayer_logs_created_total',
    'Total prayer logs created',
    ['prayer_name']
)

api_errors = Counter(
    'api_errors_total',
    'Total API errors',
    ['endpoint', 'error_type']
)

# System metrics
system_info = Info('system', 'System information')
cpu_usage = Gauge('system_cpu_usage_percent', 'CPU usage percentage')
memory_usage = Gauge('system_memory_usage_percent', 'Memory usage percentage')
disk_usage = Gauge('system_disk_usage_percent', 'Disk usage percentage')

# Custom business metrics
quran_verses_read = Counter(
    'quran_verses_read_total',
    'Total Quran verses read',
    ['surah_number', 'edition']
)

hadith_viewed = Counter(
    'hadith_viewed_total',
    'Total Hadith viewed',
    ['collection']
)

zakat_calculations = Counter(
    'zakat_calculations_total',
    'Total Zakat calculations performed'
)

# Decorators for metric collection
def track_request_metrics(func: Callable) -> Callable:
    """Track HTTP request metrics"""
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        endpoint = kwargs.get('request').url.path if 'request' in kwargs else 'unknown'
        method = kwargs.get('request').method if 'request' in kwargs else 'unknown'
        
        try:
            result = await func(*args, **kwargs)
            status = getattr(result, 'status_code', 200)
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=status
            ).inc()
            return result
        except Exception as e:
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=500
            ).inc()
            api_errors.labels(
                endpoint=endpoint,
                error_type=type(e).__name__
            ).inc()
            raise
        finally:
            duration = time.time() - start_time
            http_request_duration_seconds.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        endpoint = kwargs.get('request').url.path if 'request' in kwargs else 'unknown'
        method = kwargs.get('request').method if 'request' in kwargs else 'unknown'
        
        try:
            result = func(*args, **kwargs)
            status = getattr(result, 'status_code', 200)
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=status
            ).inc()
            return result
        except Exception as e:
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=500
            ).inc()
            api_errors.labels(
                endpoint=endpoint,
                error_type=type(e).__name__
            ).inc()
            raise
        finally:
            duration = time.time() - start_time
            http_request_duration_seconds.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

def track_cache_metrics(cache_type: str):
    """Track cache hit/miss metrics"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            if result is not None:
                cache_hits.labels(cache_type=cache_type).inc()
            else:
                cache_misses.labels(cache_type=cache_type).inc()
            return result
        return wrapper
    return decorator

# System metrics collector
class SystemMetricsCollector:
    """Collect system-level metrics"""
    
    @staticmethod
    async def collect_metrics():
        """Collect system metrics periodically"""
        while True:
            try:
                # CPU usage
                cpu_percent = psutil.cpu_percent(interval=1)
                cpu_usage.set(cpu_percent)
                
                # Memory usage
                memory = psutil.virtual_memory()
                memory_usage.set(memory.percent)
                
                # Disk usage
                disk = psutil.disk_usage('/')
                disk_usage.set(disk.percent)
                
                # System info
                system_info.info({
                    'platform': psutil.LINUX if hasattr(psutil, 'LINUX') else 'unknown',
                    'python_version': psutil.Process().exe(),
                    'boot_time': str(datetime.fromtimestamp(psutil.boot_time()))
                })
                
                # Database connections (example)
                # This would connect to your database pool
                # db_pool = get_db_pool()
                # database_connections.set(db_pool.size())
                
            except Exception as e:
                print(f"Error collecting system metrics: {e}")
            
            # Collect every 30 seconds
            await asyncio.sleep(30)

# Application metrics
class AppMetrics:
    """Application-specific metrics"""
    
    @staticmethod
    def track_prayer_log(prayer_name: str):
        """Track prayer log creation"""
        prayer_logs_created.labels(prayer_name=prayer_name).inc()
    
    @staticmethod
    def track_quran_read(surah_number: int, edition: str):
        """Track Quran verse reading"""
        quran_verses_read.labels(
            surah_number=str(surah_number),
            edition=edition
        ).inc()
    
    @staticmethod
    def track_hadith_view(collection: str):
        """Track Hadith viewing"""
        hadith_viewed.labels(collection=collection).inc()
    
    @staticmethod
    def track_zakat_calculation():
        """Track Zakat calculation"""
        zakat_calculations.inc()
    
    @staticmethod
    def update_active_users(count: int):
        """Update active users count"""
        active_users.set(count)

# Performance profiler
class PerformanceProfiler:
    """Profile code execution for optimization"""
    
    def __init__(self, name: str):
        self.name = name
        self.start_time = None
        self.metrics: Dict[str, Any] = {}
    
    def __enter__(self):
        self.start_time = time.time()
        self.metrics['memory_before'] = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        self.metrics['duration'] = duration
        self.metrics['memory_after'] = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        self.metrics['memory_used'] = self.metrics['memory_after'] - self.metrics['memory_before']
        
        if settings.DEBUG:
            print(f"Performance Profile - {self.name}:")
            print(f"  Duration: {duration:.3f}s")
            print(f"  Memory used: {self.metrics['memory_used']:.2f}MB")
    
    def add_metric(self, key: str, value: Any):
        """Add custom metric"""
        self.metrics[key] = value
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all collected metrics"""
        return self.metrics

# Health check metrics
class HealthMetrics:
    """Service health metrics"""
    
    @staticmethod
    async def check_database_health() -> Dict[str, Any]:
        """Check database health"""
        from app.db import get_db
        
        try:
            start = time.time()
            db = next(get_db())
            result = db.execute("SELECT 1").scalar()
            latency = (time.time() - start) * 1000  # ms
            
            return {
                "status": "healthy" if result == 1 else "unhealthy",
                "latency_ms": round(latency, 2)
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    @staticmethod
    async def check_redis_health() -> Dict[str, Any]:
        """Check Redis health"""
        from app.core.cache import redis_client
        
        try:
            start = time.time()
            redis_client.ping()
            latency = (time.time() - start) * 1000  # ms
            
            info = redis_client.info()
            return {
                "status": "healthy",
                "latency_ms": round(latency, 2),
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory_human", "N/A")
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    @staticmethod
    async def check_external_apis() -> Dict[str, Any]:
        """Check external API health"""
        import aiohttp
        
        apis = {
            "aladhan": "https://api.aladhan.com/v1/currentTime",
            "alquran": "https://api.alquran.cloud/v1/meta"
        }
        
        results = {}
        
        async with aiohttp.ClientSession() as session:
            for name, url in apis.items():
                try:
                    start = time.time()
                    async with session.get(url, timeout=5) as response:
                        latency = (time.time() - start) * 1000  # ms
                        results[name] = {
                            "status": "healthy" if response.status == 200 else "unhealthy",
                            "latency_ms": round(latency, 2),
                            "status_code": response.status
                        }
                except Exception as e:
                    results[name] = {
                        "status": "unhealthy",
                        "error": str(e)
                    }
        
        return results

# Initialize metrics endpoint
def create_metrics_endpoint():
    """Create Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi import Response
    
    async def metrics_endpoint():
        metrics = generate_latest()
        return Response(content=metrics, media_type=CONTENT_TYPE_LATEST)
    
    return metrics_endpoint