"""
Configuration for Hadith API integration
"""

import os
from typing import Dict, List

# Sunnah.com API configuration
SUNNAH_API_CONFIG = {
    "base_url": "https://api.sunnah.com/v1",
    "api_key": os.getenv("SUNNAH_API_KEY", "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk"),
    "timeout": 30,
    "rate_limit_delay": 1,  # seconds between requests
    "retry_delay": 5,  # seconds to wait on error
    "max_retries": 3,
    "batch_size": 100  # hadiths per request
}

# Collection configuration with exact API names
HADITH_COLLECTIONS = {
    "bukhari": {
        "api_name": "bukhari",
        "name": "Sahih al-Bukhari",
        "arabic_name": "صحيح البخاري",
        "total_books": 97,
        "total_hadiths": 7563
    },
    "muslim": {
        "api_name": "muslim", 
        "name": "Sahih Muslim",
        "arabic_name": "صحيح مسلم",
        "total_books": 56,
        "total_hadiths": 7453
    },
    "abudawud": {
        "api_name": "abudawud",
        "name": "Sunan Abu Dawud", 
        "arabic_name": "سنن أبي داود",
        "total_books": 43,
        "total_hadiths": 5274
    },
    "tirmidhi": {
        "api_name": "tirmidhi",
        "name": "Jami' at-Tirmidhi",
        "arabic_name": "جامع الترمذي", 
        "total_books": 49,
        "total_hadiths": 3956
    },
    "nasai": {
        "api_name": "nasai",
        "name": "Sunan an-Nasa'i",
        "arabic_name": "سنن النسائي",
        "total_books": 51,
        "total_hadiths": 5758
    },
    "ibnmajah": {
        "api_name": "ibnmajah",
        "name": "Sunan Ibn Majah",
        "arabic_name": "سنن ابن ماجه",
        "total_books": 37,
        "total_hadiths": 4341
    }
}

# Grade classifications
HADITH_GRADES = {
    # Authentic grades
    "sahih": ["Sahih", "Sahih li ghairih", "Sahih Isnaad", "Sahih - Authentic"],
    
    # Good grades
    "hasan": ["Hasan", "Hasan Sahih", "Hasan li ghairih", "Hasan - Good"],
    
    # Weak grades
    "da'if": ["Da'if", "Daif", "Weak", "Da'if - Weak", "Munkar", "Shadh"],
    
    # Fabricated grades
    "mawdu'": ["Mawdu'", "Maudu", "Batil", "Fabricated", "Mawdu' - Fabricated"]
}

# Category keywords for automatic categorization
CATEGORY_KEYWORDS = {
    "faith": [
        "faith", "belief", "iman", "tawhid", "allah", "prophet",
        "angels", "books", "messengers", "qadr", "resurrection"
    ],
    "prayer": [
        "prayer", "salah", "salat", "pray", "mosque", "wudu", 
        "ablution", "qiblah", "rak'ah", "sujud", "prostration"
    ],
    "fasting": [
        "fast", "fasting", "ramadan", "sawm", "siyam", "iftar", 
        "suhur", "i'tikaf", "laylat al-qadr"
    ],
    "zakat": [
        "zakat", "charity", "sadaqah", "poor", "needy", "wealth",
        "alms", "giving", "donation"
    ],
    "hajj": [
        "hajj", "pilgrimage", "umrah", "mecca", "kaaba", "ihram",
        "tawaf", "sa'i", "mina", "arafat", "muzdalifah"
    ],
    "ethics": [
        "character", "manner", "behavior", "ethics", "moral", "kindness",
        "honesty", "truthful", "patience", "forgiveness", "mercy"
    ],
    "family": [
        "marriage", "wife", "husband", "children", "family", "parent",
        "divorce", "nikah", "mahr", "custody"
    ],
    "business": [
        "trade", "business", "transaction", "buy", "sell", "commerce",
        "riba", "interest", "contract", "debt", "loan"
    ],
    "knowledge": [
        "knowledge", "learn", "teach", "scholar", "wisdom", "study",
        "ilm", "education", "understanding"
    ],
    "dua": [
        "supplication", "dua", "prayer", "invocation", "dhikr",
        "remembrance", "tasbih", "istighfar"
    ]
}

# API endpoints
SUNNAH_API_ENDPOINTS = {
    "collections": "/collections",
    "collection_books": "/collections/{collection}/books",
    "book_hadiths": "/collections/{collection}/books/{book}/hadiths",
    "hadith": "/collections/{collection}/hadiths/{number}",
    "random": "/hadiths/random"
}