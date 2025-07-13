#!/usr/bin/env python3
"""Initialize hadith collections in the database"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from app.models import HadithCollection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Collection data
COLLECTIONS = [
    {
        "collection_id": "bukhari",
        "name": "Sahih al-Bukhari",
        "arabic_name": "صحيح البخاري",
        "author": "Imam Bukhari",
        "author_arabic": "الإمام البخاري",
        "description": "The most authentic collection of Hadith",
        "authenticity": "sahih",
        "total_hadiths": 7563,
        "books": 97
    },
    {
        "collection_id": "muslim",
        "name": "Sahih Muslim",
        "arabic_name": "صحيح مسلم",
        "author": "Imam Muslim",
        "author_arabic": "الإمام مسلم",
        "description": "The second most authentic collection of Hadith",
        "authenticity": "sahih",
        "total_hadiths": 7500,
        "books": 56
    },
    {
        "collection_id": "abudawud",
        "name": "Sunan Abu Dawud",
        "arabic_name": "سنن أبي داود",
        "author": "Imam Abu Dawud",
        "author_arabic": "الإمام أبو داود",
        "description": "One of the six major hadith collections",
        "authenticity": "mixed",
        "total_hadiths": 5274,
        "books": 43
    },
    {
        "collection_id": "tirmidhi",
        "name": "Jami' at-Tirmidhi",
        "arabic_name": "جامع الترمذي",
        "author": "Imam Tirmidhi",
        "author_arabic": "الإمام الترمذي",
        "description": "Contains hadiths with their authenticity grades",
        "authenticity": "mixed",
        "total_hadiths": 3956,
        "books": 49
    },
    {
        "collection_id": "nasai",
        "name": "Sunan an-Nasa'i",
        "arabic_name": "سنن النسائي",
        "author": "Imam Nasa'i",
        "author_arabic": "الإمام النسائي",
        "description": "Known for its careful selection of hadiths",
        "authenticity": "mixed",
        "total_hadiths": 5761,
        "books": 51
    },
    {
        "collection_id": "ibnmajah",
        "name": "Sunan Ibn Majah",
        "arabic_name": "سنن ابن ماجه",
        "author": "Imam Ibn Majah",
        "author_arabic": "الإمام ابن ماجه",
        "description": "The sixth book of the six major hadith collections",
        "authenticity": "mixed",
        "total_hadiths": 4341,
        "books": 37
    }
]

def init_collections():
    """Initialize hadith collections"""
    db = SessionLocal()
    
    try:
        for collection_data in COLLECTIONS:
            # Check if collection already exists
            existing = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_data["collection_id"]
            ).first()
            
            if existing:
                logger.info(f"Collection {collection_data['name']} already exists, skipping...")
                continue
            
            # Create new collection
            collection = HadithCollection(**collection_data)
            db.add(collection)
            logger.info(f"Created collection: {collection_data['name']}")
        
        db.commit()
        logger.info("All collections initialized successfully!")
        
        # Show summary
        total = db.query(HadithCollection).count()
        logger.info(f"Total collections in database: {total}")
        
    except Exception as e:
        logger.error(f"Error initializing collections: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_collections()