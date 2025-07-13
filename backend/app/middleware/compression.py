"""
Middleware de compression pour optimiser les réponses API
"""
import gzip
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import StreamingResponse
try:
    import brotli
    HAS_BROTLI = True
except ImportError:
    HAS_BROTLI = False
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.datastructures import Headers, MutableHeaders
import io


class CompressionMiddleware:
    """
    Middleware pour compresser automatiquement les réponses avec gzip ou brotli
    selon les préférences du client (Accept-Encoding header).
    """
    
    def __init__(
        self,
        app: ASGIApp,
        minimum_size: int = 1000,
        gzip_level: int = 6,
        brotli_quality: int = 4,
        brotli_mode: int = 1,  # 0=generic, 1=text, 2=font
        exclude_paths: list[str] = None
    ):
        self.app = app
        self.minimum_size = minimum_size
        self.gzip_level = gzip_level
        self.brotli_quality = brotli_quality
        self.brotli_mode = brotli_mode
        self.exclude_paths = exclude_paths or ['/health', '/metrics', '/openapi.json']
    
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Vérifier si le path est exclu
        path = scope.get("path", "")
        # Check if any excluded path is contained in the current path
        for excluded in self.exclude_paths:
            if excluded in path:
                await self.app(scope, receive, send)
                return
        
        # Parser Accept-Encoding header
        headers = Headers(scope=scope)
        accept_encoding = headers.get("accept-encoding", "")
        
        # Déterminer le meilleur encodage disponible
        encodings = [enc.strip() for enc in accept_encoding.lower().split(",")]
        
        use_brotli = "br" in encodings
        use_gzip = "gzip" in encodings
        
        if not use_brotli and not use_gzip:
            await self.app(scope, receive, send)
            return
        
        # Intercepter la réponse
        initial_message = {}
        body_parts = []
        
        async def wrapped_send(message) -> None:
            nonlocal initial_message, body_parts
            
            if message["type"] == "http.response.start":
                initial_message = message
            elif message["type"] == "http.response.body":
                body_parts.append(message.get("body", b""))
                
                if not message.get("more_body", False):
                    # Assembler le body complet
                    full_body = b"".join(body_parts)
                    
                    # Vérifier la taille minimale
                    if len(full_body) < self.minimum_size:
                        await send(initial_message)
                        await send({
                            "type": "http.response.body",
                            "body": full_body,
                            "more_body": False
                        })
                        return
                    
                    # Vérifier le Content-Type
                    headers = MutableHeaders(scope={"headers": initial_message["headers"]})
                    content_type = headers.get("content-type", "")
                    
                    # Ne pas compresser les images, vidéos, etc.
                    skip_types = ["image/", "video/", "audio/", "application/zip", "application/gzip"]
                    if any(content_type.startswith(skip) for skip in skip_types):
                        await send(initial_message)
                        await send({
                            "type": "http.response.body",
                            "body": full_body,
                            "more_body": False
                        })
                        return
                    
                    # Compresser le body
                    compressed_body = None
                    encoding = None
                    
                    if use_brotli and HAS_BROTLI:
                        try:
                            compressed_body = brotli.compress(
                                full_body,
                                quality=self.brotli_quality,
                                mode=self.brotli_mode
                            )
                            encoding = "br"
                        except Exception:
                            pass
                    
                    if not compressed_body and use_gzip:
                        try:
                            compressed_body = gzip.compress(full_body, compresslevel=self.gzip_level)
                            encoding = "gzip"
                        except Exception:
                            pass
                    
                    # Si la compression a réussi et réduit la taille
                    if compressed_body and len(compressed_body) < len(full_body) * 0.9:
                        headers["content-encoding"] = encoding
                        headers["vary"] = "Accept-Encoding"
                        # Remove content-length header manually
                        new_headers = []
                        for name, value in initial_message["headers"]:
                            if name.lower() != b"content-length":
                                new_headers.append((name, value))
                        initial_message["headers"] = new_headers
                        
                        # Envoyer la réponse compressée
                        await send(initial_message)
                        await send({
                            "type": "http.response.body",
                            "body": compressed_body,
                            "more_body": False
                        })
                    else:
                        # Envoyer la réponse non compressée
                        await send(initial_message)
                        await send({
                            "type": "http.response.body",
                            "body": full_body,
                            "more_body": False
                        })
            else:
                await send(message)
        
        await self.app(scope, receive, wrapped_send)


def get_compression_middleware(
    minimum_size: int = 1000,
    gzip_level: int = 6,
    brotli_quality: int = 4,
    exclude_paths: list[str] = None
) -> Callable:
    """
    Factory function pour créer le middleware de compression.
    
    Args:
        minimum_size: Taille minimale en octets pour activer la compression
        gzip_level: Niveau de compression gzip (1-9)
        brotli_quality: Qualité de compression brotli (0-11)
        exclude_paths: Chemins à exclure de la compression
        
    Returns:
        Middleware configuré
    """
    def compression_middleware(app: ASGIApp) -> CompressionMiddleware:
        return CompressionMiddleware(
            app,
            minimum_size=minimum_size,
            gzip_level=gzip_level,
            brotli_quality=brotli_quality,
            exclude_paths=exclude_paths
        )
    
    return compression_middleware