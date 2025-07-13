#!/usr/bin/env python3
"""
Import ALL hadiths from sunnah.com API - Complete import script
This will import all ~34,000 hadiths across all 6 major collections
"""

import sys
import os
from pathlib import Path
import requests
import time
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithCollection, HadithBook
import logging

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hadith_import.log'),
        logging.StreamHandler()
    ]
)

class ComprehensiveHadithImporter:
    def __init__(self):
        self.base_url = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1"
        self.collections_info = {
            "bukhari": {
                "name": "Sahih al-Bukhari",
                "total_hadiths": 7563,
                "books": 97
            },
            "muslim": {
                "name": "Sahih Muslim", 
                "total_hadiths": 7453,
                "books": 56
            },
            "abudawud": {
                "name": "Sunan Abu Dawud",
                "total_hadiths": 5274,
                "books": 43
            },
            "tirmidhi": {
                "name": "Jami' at-Tirmidhi",
                "total_hadiths": 3956,
                "books": 49
            },
            "nasai": {
                "name": "Sunan an-Nasa'i",
                "total_hadiths": 5761,
                "books": 51
            },
            "ibnmajah": {
                "name": "Sunan Ibn Majah",
                "total_hadiths": 4341,
                "books": 37
            }
        }
        self.retry_count = 3
        self.retry_delay = 2
        self.batch_size = 100
        self.request_delay = 0.5  # Delay between API requests
        
    def fetch_hadith_with_retry(self, collection: str, number: int):
        """Fetch a hadith with retry logic"""
        for attempt in range(self.retry_count):
            try:
                # Fetch Arabic version
                arabic_url = f"{self.base_url}/editions/ara-{collection}/{number}.json"
                arabic_resp = requests.get(arabic_url, timeout=30)
                
                if arabic_resp.status_code == 404:
                    logger.warning(f"Hadith {collection}:{number} not found")
                    return None
                    
                if arabic_resp.status_code != 200:
                    raise Exception(f"API returned status {arabic_resp.status_code}")
                
                arabic_data = arabic_resp.json()
                
                # Fetch English version
                english_url = f"{self.base_url}/editions/eng-{collection}/{number}.json"
                english_resp = requests.get(english_url, timeout=30)
                
                english_data = None
                if english_resp.status_code == 200:
                    english_data = english_resp.json()
                
                return {
                    "arabic": arabic_data,
                    "english": english_data
                }
                
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout fetching {collection}:{number}, attempt {attempt + 1}")
                if attempt < self.retry_count - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    
            except Exception as e:
                logger.error(f"Error fetching {collection}:{number}: {str(e)}")
                if attempt < self.retry_count - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    
        return None
    
    def extract_hadith_data(self, hadith_data, collection_id: int, book_id: int, hadith_number: int):
        """Extract and structure hadith data"""
        if not hadith_data or not hadith_data.get("arabic"):
            return None
            
        try:
            arabic = hadith_data["arabic"]["hadiths"][0]
            english = None
            if hadith_data.get("english") and hadith_data["english"].get("hadiths"):
                english = hadith_data["english"]["hadiths"][0]
            
            # Extract text
            arabic_text = arabic.get("text", "")
            english_text = ""
            if english:
                english_text = english.get("text", "")
            
            # Extract narrator chain
            narrator_chain = ""
            arabic_narrator_chain = ""
            
            # Try to extract from grades or metadata
            if "grades" in arabic:
                arabic_narrator_chain = ", ".join([g.get("name", "") for g in arabic["grades"] if g.get("name")])
            
            if english and "grades" in english:
                narrator_chain = ", ".join([g.get("name", "") for g in english["grades"] if g.get("name")])
            
            # Extract grade
            grade = "unknown"
            grade_text = "Unknown"
            
            if english and "grades" in english:
                for g in english["grades"]:
                    grade_str = g.get("grade", "").lower()
                    if "sahih" in grade_str or "authentic" in grade_str:
                        grade = "sahih"
                        grade_text = "Sahih (Authentic)"
                        break
                    elif "hasan" in grade_str or "good" in grade_str:
                        grade = "hasan"
                        grade_text = "Hasan (Good)"
                        break
                    elif "da'if" in grade_str or "weak" in grade_str:
                        grade = "da'if"
                        grade_text = "Da'if (Weak)"
                        break
            
            # Build reference
            reference = f"Hadith {hadith_number}"
            if arabic.get("reference"):
                ref = arabic["reference"]
                if isinstance(ref, dict):
                    book_num = ref.get("book", "")
                    hadith_num = ref.get("hadith", "")
                    reference = f"Book {book_num}, Hadith {hadith_num}"
            
            return {
                "collection_id": collection_id,
                "book_id": book_id,
                "hadith_number": hadith_number,
                "arabic_text": arabic_text,
                "english_text": english_text,
                "narrator_chain": narrator_chain or "Unknown",
                "arabic_narrator_chain": arabic_narrator_chain or narrator_chain or "Unknown",
                "grade": grade,
                "grade_text": grade_text,
                "reference": reference,
                "categories": []  # Will be populated later
            }
            
        except Exception as e:
            logger.error(f"Error extracting hadith data: {str(e)}")
            return None
    
    def import_collection(self, collection_id: str):
        """Import all hadiths for a collection"""
        db: Session = SessionLocal()
        
        try:
            # Get collection from database
            collection = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            
            if not collection:
                logger.error(f"Collection {collection_id} not found in database")
                return
            
            collection_info = self.collections_info[collection_id]
            total_hadiths = collection_info["total_hadiths"]
            
            logger.info(f"Starting import for {collection.name}")
            logger.info(f"Total hadiths to import: {total_hadiths}")
            
            # Get or create default book (Book 1)
            default_book = db.query(HadithBook).filter(
                HadithBook.collection_id == collection.id,
                HadithBook.book_number == 1
            ).first()
            
            if not default_book:
                default_book = HadithBook(
                    collection_id=collection.id,
                    book_number=1,
                    name="Default Book",
                    arabic_name="الكتاب الافتراضي",
                    hadith_count=0
                )
                db.add(default_book)
                db.commit()
            
            imported = 0
            skipped = 0
            errors = 0
            batch = []
            
            # Check existing hadiths
            existing_numbers = set(
                db.query(Hadith.hadith_number)
                .filter(Hadith.collection_id == collection.id)
                .all()
            )
            existing_numbers = {num[0] for num in existing_numbers}
            
            logger.info(f"Found {len(existing_numbers)} existing hadiths")
            
            # Import hadiths
            for hadith_num in range(1, total_hadiths + 1):
                # Skip if already exists
                if hadith_num in existing_numbers:
                    skipped += 1
                    continue
                
                # Fetch hadith
                hadith_data = self.fetch_hadith_with_retry(collection_id, hadith_num)
                
                if not hadith_data:
                    errors += 1
                    continue
                
                # Extract data
                hadith_info = self.extract_hadith_data(
                    hadith_data, 
                    collection.id, 
                    default_book.id, 
                    hadith_num
                )
                
                if not hadith_info:
                    errors += 1
                    continue
                
                # Create hadith object
                new_hadith = Hadith(**hadith_info)
                batch.append(new_hadith)
                
                # Commit in batches
                if len(batch) >= self.batch_size:
                    try:
                        db.bulk_save_objects(batch)
                        db.commit()
                        imported += len(batch)
                        batch = []
                        
                        logger.info(f"Progress: {imported + skipped}/{total_hadiths} "
                                  f"(imported: {imported}, skipped: {skipped}, errors: {errors})")
                    except Exception as e:
                        logger.error(f"Error committing batch: {str(e)}")
                        db.rollback()
                        batch = []
                
                # Rate limiting
                time.sleep(self.request_delay)
            
            # Commit remaining batch
            if batch:
                try:
                    db.bulk_save_objects(batch)
                    db.commit()
                    imported += len(batch)
                except Exception as e:
                    logger.error(f"Error committing final batch: {str(e)}")
                    db.rollback()
            
            # Update collection hadith count
            collection.total_hadiths = imported + len(existing_numbers)
            db.commit()
            
            logger.info(f"Completed {collection.name}: "
                       f"Imported: {imported}, Skipped: {skipped}, Errors: {errors}")
            
            # Save progress
            self.save_progress(collection_id, imported, skipped, errors)
            
        except Exception as e:
            logger.error(f"Fatal error importing {collection_id}: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    def save_progress(self, collection_id: str, imported: int, skipped: int, errors: int):
        """Save import progress to file"""
        progress_file = "import_progress.json"
        
        try:
            if os.path.exists(progress_file):
                with open(progress_file, 'r') as f:
                    progress = json.load(f)
            else:
                progress = {}
            
            progress[collection_id] = {
                "imported": imported,
                "skipped": skipped,
                "errors": errors,
                "timestamp": datetime.now().isoformat()
            }
            
            with open(progress_file, 'w') as f:
                json.dump(progress, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving progress: {str(e)}")
    
    def import_all_collections(self):
        """Import all collections"""
        logger.info("="*50)
        logger.info("Starting complete hadith import")
        logger.info(f"Collections to import: {list(self.collections_info.keys())}")
        logger.info("="*50)
        
        start_time = time.time()
        
        for collection_id in self.collections_info.keys():
            try:
                self.import_collection(collection_id)
                time.sleep(5)  # Pause between collections
            except Exception as e:
                logger.error(f"Failed to import {collection_id}: {str(e)}")
        
        elapsed_time = time.time() - start_time
        logger.info("="*50)
        logger.info(f"Import completed in {elapsed_time/60:.2f} minutes")
        logger.info("="*50)

def main():
    """Main entry point"""
    importer = ComprehensiveHadithImporter()
    
    # Check if specific collection requested
    if len(sys.argv) > 1:
        collection = sys.argv[1]
        if collection in importer.collections_info:
            logger.info(f"Importing single collection: {collection}")
            importer.import_collection(collection)
        else:
            logger.error(f"Unknown collection: {collection}")
            logger.info(f"Available collections: {list(importer.collections_info.keys())}")
    else:
        # Import all collections
        importer.import_all_collections()

if __name__ == "__main__":
    main()