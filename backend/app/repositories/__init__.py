"""Repository pattern implementations for data access."""

from .base import BaseRepository
from .user_repository import UserRepository

__all__ = ['BaseRepository', 'UserRepository']