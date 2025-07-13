#!/usr/bin/env python3
"""
Update hadith counts for all books after import
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithBook, HadithCollection
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def update_book_counts():
    """Update hadith count for each book"""
    db: Session = SessionLocal()
    
    try:
        # Get all books
        books = db.query(HadithBook).all()
        
        for book in books:
            # Count hadiths in this book
            hadith_count = db.query(func.count(Hadith.id)).filter(
                Hadith.book_id == book.id
            ).scalar()
            
            # Update count
            book.hadith_count = hadith_count
            logger.info(f"Updated {book.name} (ID: {book.id}): {hadith_count} hadiths")
        
        # Also update collection totals
        collections = db.query(HadithCollection).all()
        
        for collection in collections:
            total_count = db.query(func.count(Hadith.id)).filter(
                Hadith.collection_id == collection.id
            ).scalar()
            
            collection.total_hadiths = total_count
            logger.info(f"Updated {collection.name}: {total_count} total hadiths")
        
        db.commit()
        logger.info("Book counts updated successfully")
        
    except Exception as e:
        logger.error(f"Error updating counts: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_book_counts()