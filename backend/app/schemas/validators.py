"""
Input validation schemas with security considerations
"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List
import re
from datetime import datetime

# Regex patterns for validation
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{3,20}$')
NAME_PATTERN = re.compile(r'^[a-zA-Z\s\-\.\']{2,50}$')
PHONE_PATTERN = re.compile(r'^\+?[1-9]\d{1,14}$')

class UserCreateValidator(BaseModel):
    """Enhanced user creation validation"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('username')
    def validate_username(cls, v):
        if not USERNAME_PATTERN.match(v):
            raise ValueError('Username must contain only letters, numbers, underscores, and hyphens')
        # Check for reserved usernames
        reserved = ['admin', 'root', 'api', 'auth', 'login', 'logout', 'register']
        if v.lower() in reserved:
            raise ValueError('This username is reserved')
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not NAME_PATTERN.match(v):
            raise ValueError('Name contains invalid characters')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class PrayerTimeRequestValidator(BaseModel):
    """Validate prayer time requests"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[datetime] = None
    method: int = Field(default=2, ge=0, le=15)
    
    @validator('date')
    def validate_date(cls, v):
        if v and v > datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
            # Allow future dates for planning
            pass
        return v

class QuranRequestValidator(BaseModel):
    """Validate Quran API requests"""
    surah: int = Field(..., ge=1, le=114)
    ayah: Optional[int] = Field(None, ge=1)
    edition: str = Field(default="quran-simple")
    
    @validator('edition')
    def validate_edition(cls, v):
        # Whitelist of allowed editions to prevent injection
        allowed_editions = [
            "quran-simple", "quran-uthmani", "en.sahih", "en.pickthall",
            "fr.hamidullah", "ar.muyassar", "tr.ates", "id.indonesian"
        ]
        if v not in allowed_editions:
            raise ValueError('Invalid edition specified')
        return v

class HadithRequestValidator(BaseModel):
    """Validate Hadith requests"""
    collection: str = Field(..., min_length=1, max_length=50)
    book_number: Optional[int] = Field(None, ge=1)
    hadith_number: Optional[int] = Field(None, ge=1)
    
    @validator('collection')
    def validate_collection(cls, v):
        allowed_collections = [
            "bukhari", "muslim", "tirmidhi", "abudawud", 
            "nasai", "ibnmajah", "malik", "ahmad"
        ]
        if v.lower() not in allowed_collections:
            raise ValueError('Invalid hadith collection')
        return v.lower()

class ZakatCalculationValidator(BaseModel):
    """Validate Zakat calculation inputs"""
    cash: float = Field(default=0, ge=0)
    gold_weight: float = Field(default=0, ge=0)
    silver_weight: float = Field(default=0, ge=0)
    investments: float = Field(default=0, ge=0)
    debts: float = Field(default=0, ge=0)
    
    @validator('cash', 'investments', 'debts')
    def validate_amounts(cls, v):
        # Prevent unrealistic amounts that might indicate attacks
        if v > 1e12:  # 1 trillion
            raise ValueError('Amount exceeds maximum allowed value')
        return round(v, 2)

class SearchQueryValidator(BaseModel):
    """Validate search queries"""
    query: str = Field(..., min_length=1, max_length=200)
    type: str = Field(default="all")
    page: int = Field(default=1, ge=1, le=100)
    limit: int = Field(default=20, ge=1, le=100)
    
    @validator('query')
    def sanitize_query(cls, v):
        # Remove potential SQL/NoSQL injection attempts
        dangerous_chars = ['$', '{', '}', ';', '--', '/*', '*/', 'exec', 'union']
        cleaned = v
        for char in dangerous_chars:
            cleaned = cleaned.replace(char, '')
        return cleaned.strip()
    
    @validator('type')
    def validate_search_type(cls, v):
        allowed_types = ['all', 'quran', 'hadith', 'articles', 'videos']
        if v not in allowed_types:
            raise ValueError('Invalid search type')
        return v

class ContactMessageValidator(BaseModel):
    """Validate contact form messages"""
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=100)
    message: str = Field(..., min_length=10, max_length=1000)
    
    @validator('name')
    def validate_name(cls, v):
        if not NAME_PATTERN.match(v):
            raise ValueError('Name contains invalid characters')
        return v.strip()
    
    @validator('subject', 'message')
    def sanitize_text(cls, v):
        # Basic XSS prevention
        return v.replace('<', '&lt;').replace('>', '&gt;').strip()