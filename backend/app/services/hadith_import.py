import asyncio
import httpx
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
import logging
import time
from datetime import datetime

from app.db import SessionLocal
from app.models import HadithCollection, HadithBook, Hadith, HadithCategory

logger = logging.getLogger(__name__)

# Sunnah.com API configuration
SUNNAH_API_BASE = "https://api.sunnah.com/v1"
SUNNAH_API_KEY = "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzOk"  # Free tier API key

# Mapping of sunnah.com collections to our IDs
COLLECTION_MAPPING = {
    "bukhari": {"api_name": "bukhari", "name": "Sahih al-Bukhari"},
    "muslim": {"api_name": "muslim", "name": "Sahih Muslim"},
    "abudawud": {"api_name": "abudawud", "name": "Sunan Abu Dawud"},
    "tirmidhi": {"api_name": "tirmidhi", "name": "Jami' at-Tirmidhi"},
    "nasai": {"api_name": "nasai", "name": "Sunan an-Nasa'i"}, 
    "ibnmajah": {"api_name": "ibnmajah", "name": "Sunan Ibn Majah"}
}

# Grade mapping
GRADE_MAPPING = {
    "Sahih": "sahih",
    "Sahih li ghairih": "sahih",
    "Sahih Isnaad": "sahih",
    "Hasan": "hasan", 
    "Hasan Sahih": "hasan",
    "Hasan li ghairih": "hasan",
    "Da'if": "da'if",
    "Daif": "da'if",
    "Mawdu'": "mawdu'",
    "Munkar": "da'if",
    "Batil": "mawdu'"
}

class HadithImporter:
    def __init__(self, db: Session):
        self.db = db
        self.headers = {
            "x-api-key": SUNNAH_API_KEY,
            "Accept": "application/json"
        }
        self.client = None
        self.stats = {
            "total_hadiths": 0,
            "imported": 0,
            "failed": 0,
            "skipped": 0
        }
        
    async def __aenter__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()
            
    async def import_collection(self, collection_id: str, limit: Optional[int] = None):
        """Import a specific collection with optional limit for testing."""
        config = COLLECTION_MAPPING.get(collection_id)
        if not config:
            logger.error(f"Unknown collection: {collection_id}")
            return
            
        logger.info(f"Starting import for {config['name']}")
        start_time = time.time()
        
        try:
            # Get or create collection
            collection = self.db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            
            if not collection:
                logger.error(f"Collection {collection_id} not found in database")
                return
                
            # Get books for this collection
            books = await self._get_books(config['api_name'])
            logger.info(f"Found {len(books)} books in {config['name']}")
            
            # Import hadiths from each book
            for book_data in books:
                await self._import_book_hadiths(
                    collection, 
                    config['api_name'],
                    book_data,
                    limit
                )
                
                # Stop if we've reached the limit
                if limit and self.stats['imported'] >= limit:
                    break
                    
        except Exception as e:
            logger.error(f"Error importing {collection_id}: {str(e)}")
            raise
        finally:
            elapsed = time.time() - start_time
            logger.info(
                f"Import completed for {config['name']} in {elapsed:.2f}s. "
                f"Stats: {self.stats}"
            )
            
    async def _get_books(self, collection_name: str) -> List[Dict]:
        """Get all books for a collection."""
        url = f"{SUNNAH_API_BASE}/collections/{collection_name}/books"
        
        response = await self.client.get(url, headers=self.headers)
        response.raise_for_status()
        
        data = response.json()
        return data.get("data", [])
        
    async def _import_book_hadiths(self, collection: HadithCollection, 
                                  api_collection: str, book_data: Dict,
                                  limit: Optional[int] = None):
        """Import all hadiths from a specific book."""
        book_number_str = book_data.get("bookNumber", "1")
        
        # Skip non-numeric book numbers like "introduction"
        try:
            book_number = int(book_number_str)
        except ValueError:
            logger.info(f"Skipping non-numeric book: {book_number_str}")
            return
        
        # Get or create book
        book = self.db.query(HadithBook).filter(
            HadithBook.collection_id == collection.id,
            HadithBook.book_number == book_number
        ).first()
        
        if not book:
            book = HadithBook(
                collection_id=collection.id,
                book_number=book_number,
                name=book_data.get("book", [{}])[0].get("name", f"Book {book_number}"),
                arabic_name=book_data.get("book", [{}])[1].get("name", "") if len(book_data.get("book", [])) > 1 else ""
            )
            self.db.add(book)
            self.db.commit()
            
        logger.info(f"Importing hadiths from {collection.name} - Book {book_number}")
        
        # Get hadiths page by page
        page = 1
        per_page = 100  # Batch size
        
        while True:
            if limit and self.stats['imported'] >= limit:
                break
                
            # Fetch hadiths
            url = f"{SUNNAH_API_BASE}/collections/{api_collection}/books/{book_number}/hadiths"
            params = {
                "page": page,
                "limit": per_page
            }
            
            try:
                response = await self.client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                hadiths = data.get("data", [])
                
                if not hadiths:
                    break
                    
                # Process each hadith
                for hadith_data in hadiths:
                    if limit and self.stats['imported'] >= limit:
                        break
                        
                    await self._save_hadith(collection, book, hadith_data)
                    
                # Progress update
                if page % 5 == 0:
                    logger.info(
                        f"Progress: Page {page}, "
                        f"Imported: {self.stats['imported']}, "
                        f"Failed: {self.stats['failed']}"
                    )
                    
                # Check if there are more pages
                total_pages = data.get("totalPages", 1)
                if page >= total_pages:
                    break
                    
                page += 1
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    logger.warning(f"No more hadiths found for book {book_number}")
                    break
                else:
                    logger.error(f"HTTP error: {e}")
                    await asyncio.sleep(5)  # Wait before retry
                    continue
            except Exception as e:
                logger.error(f"Error fetching hadiths: {e}")
                await asyncio.sleep(5)
                continue
                
        self.db.commit()
        
    async def _save_hadith(self, collection: HadithCollection, book: HadithBook, 
                          hadith_data: Dict):
        """Save a single hadith to the database."""
        try:
            # Extract hadith number
            hadith_number = hadith_data.get("hadithNumber", 0)
            if isinstance(hadith_number, str):
                # Handle cases like "1a", "1b" by taking numeric part
                numeric_str = ''.join(filter(str.isdigit, hadith_number))
                if numeric_str:
                    hadith_number = int(numeric_str)
                    # Handle concatenated numbers (e.g., 949950 -> 949)
                    if hadith_number > 10000:
                        # Take first 3-4 digits
                        hadith_number = int(str(hadith_number)[:4])
                else:
                    hadith_number = 0
            elif isinstance(hadith_number, int) and hadith_number > 10000:
                # Handle concatenated numbers
                hadith_number = int(str(hadith_number)[:4])
                
            # Check if already exists
            existing = self.db.query(Hadith).filter(
                Hadith.collection_id == collection.id,
                Hadith.book_id == book.id,
                Hadith.hadith_number == hadith_number
            ).first()
            
            if existing:
                self.stats['skipped'] += 1
                return
                
            # Extract texts
            arabic_text = ""
            english_text = ""
            arabic_narrator = ""
            english_narrator = ""
            
            # Process hadith array (contains different language versions)
            for version in hadith_data.get("hadith", []):
                lang = version.get("lang", "")
                body = version.get("body", "")
                narrator = version.get("narrator", "")
                
                if lang == "ar":
                    arabic_text = body
                    arabic_narrator = narrator
                elif lang == "en":
                    english_text = body
                    english_narrator = narrator
                    
            # Extract grade
            grades = hadith_data.get("grades", [])
            grade = None
            grade_text = None
            
            if grades:
                primary_grade = grades[0]
                grade_text = primary_grade.get("grade", "")
                grade = GRADE_MAPPING.get(grade_text, "unknown")
                
            # Build reference
            reference_data = hadith_data.get("reference", {})
            reference = f"{collection.name} {reference_data.get('book', book.book_number)}:{reference_data.get('hadith', hadith_number)}"
            
            # Determine categories
            categories = self._extract_categories(book.name, english_text)
            
            # Create hadith
            hadith = Hadith(
                collection_id=collection.id,
                book_id=book.id,
                hadith_number=hadith_number,
                arabic_text=arabic_text,
                english_text=english_text,
                french_text="",  # Would need translation API
                narrator_chain=english_narrator,
                arabic_narrator_chain=arabic_narrator,
                grade=grade,
                grade_text=grade_text,
                reference=reference,
                categories=categories,
                search_vector=f"{english_text} {english_narrator}".lower()
            )
            
            self.db.add(hadith)
            self.stats['imported'] += 1
            self.stats['total_hadiths'] += 1
            
            # Commit every 100 hadiths
            if self.stats['imported'] % 100 == 0:
                self.db.commit()
                logger.info(f"Committed {self.stats['imported']} hadiths")
                
        except Exception as e:
            logger.error(f"Error saving hadith: {e}")
            self.stats['failed'] += 1
            
    def _extract_categories(self, book_name: str, text: str) -> List[str]:
        """Extract relevant categories based on book name and content."""
        categories = []
        book_lower = book_name.lower()
        text_lower = text.lower()
        
        # Category mapping based on keywords
        category_keywords = {
            "faith": ["faith", "belief", "iman", "tawhid", "allah", "prophet"],
            "prayer": ["prayer", "salah", "salat", "pray", "mosque", "wudu", "ablution"],
            "fasting": ["fast", "ramadan", "sawm", "siyam", "iftar", "suhur"],
            "zakat": ["zakat", "charity", "sadaqah", "poor", "needy", "wealth"],
            "hajj": ["hajj", "pilgrimage", "umrah", "mecca", "kaaba", "ihram"],
            "ethics": ["character", "manner", "behavior", "ethics", "moral", "kindness"],
            "family": ["marriage", "wife", "husband", "children", "family", "parent"],
            "business": ["trade", "business", "transaction", "buy", "sell", "commerce"],
            "knowledge": ["knowledge", "learn", "teach", "scholar", "wisdom", "study"],
            "dua": ["supplication", "dua", "prayer", "invocation", "dhikr"]
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in book_lower or keyword in text_lower:
                    if category not in categories:
                        categories.append(category)
                        
        # Default category if none found
        if not categories:
            categories.append("ethics")
            
        return categories


async def import_hadiths(collection_id: Optional[str] = None, limit: Optional[int] = None):
    """
    Import hadiths from sunnah.com API.
    
    Args:
        collection_id: Specific collection to import (e.g., 'bukhari'). If None, imports all.
        limit: Maximum number of hadiths to import (for testing).
    """
    db = SessionLocal()
    
    try:
        async with HadithImporter(db) as importer:
            if collection_id:
                # Import specific collection
                await importer.import_collection(collection_id, limit)
            else:
                # Import all collections
                for coll_id in COLLECTION_MAPPING.keys():
                    await importer.import_collection(coll_id, limit)
                    
            logger.info(f"Import completed. Final stats: {importer.stats}")
            
    except Exception as e:
        logger.error(f"Import failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Import first 100 hadiths from Bukhari for testing
    asyncio.run(import_hadiths("bukhari", limit=100))