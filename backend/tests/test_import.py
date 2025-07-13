#!/usr/bin/env python3
"""
Quick test script to import first 100 hadiths from Bukhari
"""

import asyncio
import logging
import sys
import os

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.hadith_import import import_hadiths
from app.db import SessionLocal
from app.models import Hadith, HadithCollection

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def test_import():
    """Test importing 100 hadiths from Bukhari."""
    print("="*60)
    print("HADITH IMPORT TEST")
    print("="*60)
    print("\nThis will import the first 100 hadiths from Sahih Bukhari")
    print("to test the import functionality.\n")
    
    # Check current status
    db = SessionLocal()
    try:
        bukhari = db.query(HadithCollection).filter(
            HadithCollection.collection_id == "bukhari"
        ).first()
        
        if bukhari:
            existing_count = db.query(Hadith).filter(
                Hadith.collection_id == bukhari.id
            ).count()
            print(f"Current hadiths in Bukhari: {existing_count}")
        else:
            print("Bukhari collection not found in database!")
            return
    finally:
        db.close()
    
    print("\nStarting import...\n")
    
    try:
        # Import 100 hadiths
        await import_hadiths("bukhari", limit=100)
        
        # Check results
        db = SessionLocal()
        try:
            bukhari = db.query(HadithCollection).filter(
                HadithCollection.collection_id == "bukhari"
            ).first()
            
            new_count = db.query(Hadith).filter(
                Hadith.collection_id == bukhari.id
            ).count()
            
            print(f"\n{'='*60}")
            print("IMPORT COMPLETE")
            print(f"{'='*60}")
            print(f"Total hadiths in Bukhari: {new_count}")
            
            # Show sample hadith
            sample = db.query(Hadith).filter(
                Hadith.collection_id == bukhari.id
            ).first()
            
            if sample:
                print(f"\nSample hadith:")
                print(f"Reference: {sample.reference}")
                print(f"Grade: {sample.grade_text}")
                print(f"Arabic: {sample.arabic_text[:100]}...")
                print(f"English: {sample.english_text[:100]}...")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        logging.exception("Import failed")

if __name__ == "__main__":
    asyncio.run(test_import())