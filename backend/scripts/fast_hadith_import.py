#!/usr/bin/env python3
"""
Fast and robust hadith importer with parallel processing and error handling
"""
import os
import sys
import time
import json
import logging
import asyncio
import aiohttp
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Set
import threading

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from app.models import Hadith, HadithCollection, HadithBook

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fast_hadith_import.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FastHadithImporter:
    def __init__(self):
        self.base_url = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1"
        self.collections_info = {
            "bukhari": {"name": "Sahih al-Bukhari", "total_hadiths": 7563},
            "muslim": {"name": "Sahih Muslim", "total_hadiths": 7500},
            "abudawud": {"name": "Sunan Abu Dawud", "total_hadiths": 5274},
            "tirmidhi": {"name": "Jami' at-Tirmidhi", "total_hadiths": 3956},
            "nasai": {"name": "Sunan an-Nasa'i", "total_hadiths": 5761},
            "ibnmajah": {"name": "Sunan Ibn Majah", "total_hadiths": 4341}
        }
        
        # Performance settings
        self.max_workers = 10  # Number of parallel workers
        self.batch_size = 500  # Larger batch size
        self.max_retries = 3
        self.timeout = 30
        self.rate_limit = 0.1  # Smaller delay between requests
        
        # Database connection
        self.engine = create_engine(
            os.getenv('DATABASE_URL'),
            poolclass=NullPool,  # Disable connection pooling for parallel processing
            echo=False
        )
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Thread-safe counters
        self.lock = threading.Lock()
        self.stats = {
            'imported': 0,
            'skipped': 0,
            'errors': 0,
            'total_processed': 0
        }
        
    async def fetch_hadith_async(self, session: aiohttp.ClientSession, collection: str, number: int) -> Optional[Dict]:
        """Fetch a single hadith asynchronously"""
        try:
            # Fetch Arabic version
            arabic_url = f"{self.base_url}/editions/ara-{collection}/{number}.json"
            async with session.get(arabic_url, timeout=self.timeout) as resp:
                if resp.status == 404:
                    return None
                if resp.status != 200:
                    raise Exception(f"API returned status {resp.status}")
                arabic_data = await resp.json()
            
            # Fetch English version
            english_url = f"{self.base_url}/editions/eng-{collection}/{number}.json"
            async with session.get(english_url, timeout=self.timeout) as resp:
                if resp.status == 200:
                    english_data = await resp.json()
                else:
                    english_data = None
            
            return {
                'arabic': arabic_data,
                'english': english_data,
                'number': number
            }
            
        except asyncio.TimeoutError:
            logger.warning(f"Timeout fetching {collection}:{number}")
            return None
        except Exception as e:
            logger.error(f"Error fetching {collection}:{number}: {str(e)}")
            return None
    
    async def fetch_hadiths_batch_async(self, collection: str, numbers: List[int]) -> List[Dict]:
        """Fetch multiple hadiths concurrently"""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for number in numbers:
                # Add small delay to respect rate limit
                await asyncio.sleep(self.rate_limit)
                task = self.fetch_hadith_async(session, collection, number)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            return [r for r in results if r is not None]
    
    def process_hadith_batch(self, collection_id: str, collection_db_id: int, book_db_id: int, hadith_batch: List[Dict]) -> Dict:
        """Process and save a batch of hadiths"""
        db = self.SessionLocal()
        imported = 0
        errors = 0
        
        try:
            hadith_objects = []
            
            for hadith_data in hadith_batch:
                try:
                    hadith_info = self.extract_hadith_data(
                        hadith_data, 
                        collection_db_id, 
                        book_db_id, 
                        hadith_data['number']
                    )
                    
                    if hadith_info:
                        hadith_objects.append(Hadith(**hadith_info))
                    else:
                        errors += 1
                        
                except Exception as e:
                    logger.error(f"Error processing hadith {hadith_data['number']}: {str(e)}")
                    errors += 1
            
            # Bulk insert
            if hadith_objects:
                db.bulk_save_objects(hadith_objects)
                db.commit()
                imported = len(hadith_objects)
                
        except Exception as e:
            logger.error(f"Error saving batch: {str(e)}")
            db.rollback()
            errors = len(hadith_batch)
        finally:
            db.close()
        
        # Update stats thread-safely
        with self.lock:
            self.stats['imported'] += imported
            self.stats['errors'] += errors
            self.stats['total_processed'] += len(hadith_batch)
        
        return {'imported': imported, 'errors': errors}
    
    def extract_hadith_data(self, hadith_data: Dict, collection_id: int, book_id: int, hadith_number: int) -> Optional[Dict]:
        """Extract hadith data from API response"""
        try:
            arabic_hadith = hadith_data.get('arabic', {}).get('hadith', [{}])[0]
            english_hadith = hadith_data.get('english', {}).get('hadith', [{}])[0] if hadith_data.get('english') else {}
            
            # Extract text
            arabic_text = arabic_hadith.get('body', '')
            english_text = english_hadith.get('body', '')
            
            # Extract narrator chain
            arabic_chain = arabic_hadith.get('narrator', '')
            english_chain = english_hadith.get('narrator', '')
            
            # Extract grade
            grades = arabic_hadith.get('grades', [])
            grade = grades[0].get('grade', 'unknown') if grades else 'unknown'
            grade_text = grades[0].get('graded_by', '') if grades else ''
            
            # Build reference
            reference = f"Hadith {hadith_number}"
            
            return {
                'collection_id': collection_id,
                'book_id': book_id,
                'hadith_number': hadith_number,
                'arabic_text': arabic_text,
                'english_text': english_text,
                'french_text': None,  # To be added later
                'narrator_chain': english_chain or arabic_chain,
                'arabic_narrator_chain': arabic_chain,
                'grade': grade.lower() if grade else None,
                'grade_text': grade_text,
                'categories': [],
                'reference': reference
            }
            
        except Exception as e:
            logger.error(f"Error extracting hadith data: {str(e)}")
            return None
    
    def import_collection(self, collection_id: str):
        """Import a single collection using parallel processing"""
        db = self.SessionLocal()
        
        try:
            # Get or create collection
            collection = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            
            if not collection:
                collection_info = self.collections_info[collection_id]
                collection = HadithCollection(
                    collection_id=collection_id,
                    name=collection_info['name']
                )
                db.add(collection)
                db.commit()
                db.refresh(collection)
            
            # Get default book
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
                db.refresh(default_book)
            
            # Get existing hadith numbers
            existing_numbers = set(
                row[0] for row in db.query(Hadith.hadith_number)
                .filter(Hadith.collection_id == collection.id)
                .all()
            )
            
            total_hadiths = self.collections_info[collection_id]['total_hadiths']
            logger.info(f"Starting import for {collection.name}")
            logger.info(f"Total hadiths to import: {total_hadiths}")
            logger.info(f"Found {len(existing_numbers)} existing hadiths")
            
            # Reset stats for this collection
            with self.lock:
                self.stats['skipped'] = len(existing_numbers)
            
            # Get list of hadiths to import
            hadiths_to_import = [
                num for num in range(1, total_hadiths + 1) 
                if num not in existing_numbers
            ]
            
            if not hadiths_to_import:
                logger.info(f"All hadiths already imported for {collection.name}")
                return
            
            # Process in batches
            batch_size = 50  # Number of hadiths to fetch at once
            total_batches = (len(hadiths_to_import) + batch_size - 1) // batch_size
            
            logger.info(f"Processing {len(hadiths_to_import)} hadiths in {total_batches} batches")
            
            for i in range(0, len(hadiths_to_import), batch_size):
                batch_numbers = hadiths_to_import[i:i + batch_size]
                
                # Fetch hadiths asynchronously
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                hadith_batch = loop.run_until_complete(
                    self.fetch_hadiths_batch_async(collection_id, batch_numbers)
                )
                loop.close()
                
                # Process and save batch
                if hadith_batch:
                    self.process_hadith_batch(
                        collection_id, 
                        collection.id, 
                        default_book.id, 
                        hadith_batch
                    )
                
                # Log progress
                with self.lock:
                    total_processed = self.stats['total_processed'] + self.stats['skipped']
                    logger.info(
                        f"Progress: {total_processed}/{total_hadiths} "
                        f"(imported: {self.stats['imported']}, "
                        f"skipped: {self.stats['skipped']}, "
                        f"errors: {self.stats['errors']})"
                    )
            
        except Exception as e:
            logger.error(f"Error importing collection {collection_id}: {str(e)}")
        finally:
            db.close()
    
    def import_all_collections(self):
        """Import all hadith collections"""
        logger.info("="*50)
        logger.info("Starting fast hadith import")
        logger.info(f"Collections to import: {list(self.collections_info.keys())}")
        logger.info(f"Using {self.max_workers} parallel workers")
        logger.info("="*50)
        
        start_time = time.time()
        
        for collection_id in self.collections_info.keys():
            # Reset stats for each collection
            with self.lock:
                self.stats = {
                    'imported': 0,
                    'skipped': 0,
                    'errors': 0,
                    'total_processed': 0
                }
            
            self.import_collection(collection_id)
            
            # Summary for this collection
            with self.lock:
                logger.info(f"Completed {collection_id}: "
                          f"imported={self.stats['imported']}, "
                          f"skipped={self.stats['skipped']}, "
                          f"errors={self.stats['errors']}")
        
        elapsed_time = time.time() - start_time
        logger.info("="*50)
        logger.info(f"Import completed in {elapsed_time/60:.2f} minutes")
        logger.info("="*50)

def main():
    """Main entry point"""
    importer = FastHadithImporter()
    
    if len(sys.argv) > 1:
        # Import specific collection
        collection_id = sys.argv[1]
        if collection_id in importer.collections_info:
            importer.import_collection(collection_id)
        else:
            logger.error(f"Unknown collection: {collection_id}")
            logger.info(f"Available collections: {list(importer.collections_info.keys())}")
    else:
        # Import all collections
        importer.import_all_collections()

if __name__ == "__main__":
    main()