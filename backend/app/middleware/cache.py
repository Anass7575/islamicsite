"""
Middleware de cache pour optimiser les performances API avec Redis
"""
import json
import hashlib
from typing import Optional, Callable, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response as StarletteResponse
import redis.asyncio as redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class CacheMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour cacher automatiquement les réponses GET dans Redis.
    """
    
    def __init__(
        self,
        app,
        redis_client: redis.Redis,
        default_ttl: int = 300,  # 5 minutes par défaut
        cache_prefix: str = "api_cache:",
        exclude_paths: list[str] = None,
        include_query_params: bool = True
    ):
        super().__init__(app)
        self.redis_client = redis_client
        self.default_ttl = default_ttl
        self.cache_prefix = cache_prefix
        self.exclude_paths = exclude_paths or [
            "/health",
            "/metrics",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/auth",
        ]
        self.include_query_params = include_query_params
        
        # Configuration du cache par endpoint
        self.cache_config = {
            # Endpoints avec cache long
            "/hadith/collections": 3600,  # 1 heure
            "/hadith/categories": 3600,
            "/quran/surahs": 3600,
            "/quran/juzs": 3600,
            
            # Endpoints avec cache moyen
            "/hadith/daily": 1800,  # 30 minutes
            "/prayer-times": 900,   # 15 minutes
            
            # Endpoints avec cache court
            "/hadith/search": 300,  # 5 minutes
            "/quran/search": 300,
        }
    
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        # Ne cacher que les requêtes GET
        if request.method != "GET":
            return await call_next(request)
        
        # Vérifier si le path est exclu
        path = request.url.path
        if any(path.startswith(excluded) for excluded in self.exclude_paths):
            return await call_next(request)
        
        # Vérifier si l'utilisateur est authentifié (ne pas cacher les réponses personnalisées)
        if request.headers.get("authorization"):
            return await call_next(request)
        
        # Générer la clé de cache
        cache_key = self._generate_cache_key(request)
        
        # Essayer de récupérer depuis le cache
        try:
            cached_response = await self.redis_client.get(cache_key)
            if cached_response:
                logger.info(f"Cache hit for {path}")
                
                # Parser la réponse cachée
                cached_data = json.loads(cached_response)
                
                # Créer la réponse
                return Response(
                    content=cached_data["content"],
                    status_code=cached_data["status_code"],
                    headers={
                        **cached_data["headers"],
                        "X-Cache": "HIT",
                        "X-Cache-Key": cache_key,
                    },
                    media_type=cached_data.get("media_type", "application/json")
                )
        except Exception as e:
            logger.error(f"Cache error: {e}")
        
        # Si pas de cache, appeler l'endpoint
        response = await call_next(request)
        
        # Ne cacher que les réponses réussies (2xx)
        if 200 <= response.status_code < 300:
            await self._cache_response(cache_key, path, response)
        
        # Ajouter les headers de cache
        response.headers["X-Cache"] = "MISS"
        response.headers["X-Cache-Key"] = cache_key
        
        return response
    
    def _generate_cache_key(self, request: Request) -> str:
        """Générer une clé de cache unique pour la requête."""
        parts = [
            self.cache_prefix,
            request.url.path,
        ]
        
        # Inclure les query params si configuré
        if self.include_query_params and request.url.query:
            # Trier les params pour consistance
            sorted_params = sorted(request.url.query.split("&"))
            parts.append("?" + "&".join(sorted_params))
        
        # Inclure certains headers importants
        accept_language = request.headers.get("accept-language", "en")
        parts.append(f"lang:{accept_language[:2]}")
        
        # Créer un hash pour éviter les clés trop longues
        key_string = ":".join(parts)
        if len(key_string) > 200:
            # Hash les parties longues
            hash_part = hashlib.md5(key_string.encode()).hexdigest()[:16]
            key_string = f"{self.cache_prefix}{request.url.path}:{hash_part}"
        
        return key_string
    
    async def _cache_response(
        self,
        cache_key: str,
        path: str,
        response: StarletteResponse
    ) -> None:
        """Cacher la réponse dans Redis."""
        try:
            # Lire le body de la réponse
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            # Recréer le body_iterator
            async def body_iterator():
                yield body
            
            response.body_iterator = body_iterator()
            
            # Déterminer le TTL
            ttl = self.default_ttl
            for pattern, config_ttl in self.cache_config.items():
                if path.startswith(pattern):
                    ttl = config_ttl
                    break
            
            # Préparer les données à cacher
            cache_data = {
                "content": body.decode("utf-8") if body else "",
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "media_type": response.media_type,
            }
            
            # Supprimer les headers qui ne doivent pas être cachés
            headers_to_remove = ["set-cookie", "x-cache", "x-cache-key"]
            for header in headers_to_remove:
                cache_data["headers"].pop(header, None)
            
            # Cacher dans Redis
            await self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(cache_data)
            )
            
            logger.info(f"Cached response for {path} with TTL {ttl}s")
            
        except Exception as e:
            logger.error(f"Failed to cache response: {e}")


def cache_key_wrapper(
    prefix: str = "",
    ttl: int = 300,
    include_args: bool = True
) -> Callable:
    """
    Décorateur pour cacher les résultats de fonctions dans Redis.
    
    Usage:
        @cache_key_wrapper(prefix="hadith", ttl=600)
        async def get_hadith_by_id(hadith_id: int):
            ...
    """
    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs) -> Any:
            # Construire la clé de cache
            key_parts = [prefix or func.__name__]
            
            if include_args:
                # Inclure les arguments dans la clé
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
            
            cache_key = ":".join(key_parts)
            
            # Essayer de récupérer depuis le cache
            redis_client = await get_redis_client()
            cached = await redis_client.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            # Sinon, exécuter la fonction
            result = await func(*args, **kwargs)
            
            # Cacher le résultat
            await redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result, default=str)
            )
            
            return result
        
        return wrapper
    return decorator


async def get_redis_client() -> redis.Redis:
    """Obtenir une instance du client Redis."""
    return redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )


async def invalidate_cache_pattern(pattern: str) -> int:
    """
    Invalider toutes les clés de cache correspondant à un pattern.
    
    Args:
        pattern: Pattern Redis (ex: "api_cache:hadith*")
        
    Returns:
        Nombre de clés supprimées
    """
    redis_client = await get_redis_client()
    keys = await redis_client.keys(pattern)
    
    if keys:
        return await redis_client.delete(*keys)
    
    return 0


async def get_cache_stats() -> dict:
    """Obtenir les statistiques du cache."""
    redis_client = await get_redis_client()
    
    # Compter les clés par type
    api_cache_keys = await redis_client.keys("api_cache:*")
    
    # Calculer la taille totale
    total_size = 0
    for key in api_cache_keys[:100]:  # Échantillon pour éviter de bloquer
        try:
            value = await redis_client.get(key)
            if value:
                total_size += len(value)
        except:
            pass
    
    # Infos Redis
    info = await redis_client.info()
    
    return {
        "total_keys": len(api_cache_keys),
        "estimated_size_mb": round(total_size / 1024 / 1024, 2),
        "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1), 1) * 100,
        "memory_used_mb": round(info.get("used_memory", 0) / 1024 / 1024, 2),
        "evicted_keys": info.get("evicted_keys", 0),
    }