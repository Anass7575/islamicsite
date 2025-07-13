#!/usr/bin/env python3
"""
Consolidated Hadith Import Script
Imports hadiths from sunnah.com API with proper error handling and rate limiting.
"""

import sys
import os
import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from app.models import Hadith, HadithCollection, HadithBook
from app.services.hadith_import import HadithImporter, COLLECTION_MAPPING

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class HadithImportManager:
    """Manages hadith imports with various options."""
    
    def __init__(self):
        self.db = SessionLocal()
        self.importer = None
        
    async def __aenter__(self):
        self.importer = HadithImporter(self.db)
        await self.importer.__aenter__()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.importer:
            await self.importer.__aexit__(exc_type, exc_val, exc_tb)
        self.db.close()
        
    async def clear_collection(self, collection_id: str):
        """Clear existing data for a collection."""
        collection = self.db.query(HadithCollection).filter(
            HadithCollection.collection_id == collection_id
        ).first()
        
        if collection:
            deleted_hadiths = self.db.query(Hadith).filter(
                Hadith.collection_id == collection.id
            ).delete(synchronize_session=False)
            
            deleted_books = self.db.query(HadithBook).filter(
                HadithBook.collection_id == collection.id
            ).delete(synchronize_session=False)
            
            self.db.commit()
            logger.info(f"Cleared {deleted_hadiths} hadiths and {deleted_books} books from {collection.name}")
            
    async def import_collection(self, collection_id: str, limit: Optional[int] = None, clear_first: bool = False):
        """Import a single collection."""
        if collection_id not in COLLECTION_MAPPING:
            logger.error(f"Unknown collection: {collection_id}")
            return
            
        logger.info(f"\n{'='*60}")
        logger.info(f"Importing: {COLLECTION_MAPPING[collection_id]['name']}")
        logger.info(f"{'='*60}")
        
        if clear_first:
            await self.clear_collection(collection_id)
            
        await self.importer.import_collection(collection_id, limit=limit)
        
        # Show final count
        collection = self.db.query(HadithCollection).filter(
            HadithCollection.collection_id == collection_id
        ).first()
        
        if collection:
            count = self.db.query(Hadith).filter(
                Hadith.collection_id == collection.id
            ).count()
            logger.info(f"✅ {collection.name}: {count} hadiths in database")
            
    async def import_all(self, limit_per_collection: Optional[int] = None, clear_first: bool = False):
        """Import all collections."""
        collections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']
        
        for collection_id in collections:
            try:
                await self.import_collection(collection_id, limit=limit_per_collection, clear_first=clear_first)
                await asyncio.sleep(5)  # Delay between collections
            except Exception as e:
                logger.error(f"Failed to import {collection_id}: {e}")
                continue
                
    def get_status(self) -> Dict[str, Any]:
        """Get current import status."""
        status = {"collections": {}, "total": 0}
        
        for collection in self.db.query(HadithCollection).all():
            count = self.db.query(Hadith).filter(
                Hadith.collection_id == collection.id
            ).count()
            status["collections"][collection.collection_id] = {
                "name": collection.name,
                "count": count
            }
            status["total"] += count
            
        return status


async def main():
    """Main entry point with CLI interface."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Import hadiths from sunnah.com")
    parser.add_argument('action', choices=['import', 'status', 'clear'], 
                       help="Action to perform")
    parser.add_argument('--collection', '-c', 
                       help="Specific collection to import")
    parser.add_argument('--limit', '-l', type=int, 
                       help="Limit number of hadiths per collection")
    parser.add_argument('--clear', action='store_true', 
                       help="Clear existing data before import")
    
    args = parser.parse_args()
    
    async with HadithImportManager() as manager:
        if args.action == 'status':
            status = manager.get_status()
            print(f"\nHadith Database Status:")
            print(f"{'='*40}")
            for coll_id, info in status["collections"].items():
                print(f"{info['name']}: {info['count']} hadiths")
            print(f"{'='*40}")
            print(f"Total: {status['total']} hadiths\n")
            
        elif args.action == 'clear':
            if args.collection:
                await manager.clear_collection(args.collection)
            else:
                print("Please specify a collection to clear with --collection")
                
        elif args.action == 'import':
            start_time = datetime.now()
            
            if args.collection:
                await manager.import_collection(
                    args.collection, 
                    limit=args.limit, 
                    clear_first=args.clear
                )
            else:
                logger.info("Starting import of all collections...")
                await manager.import_all(
                    limit_per_collection=args.limit, 
                    clear_first=args.clear
                )
                
            elapsed = datetime.now() - start_time
            logger.info(f"\nImport completed in {elapsed}")
            
            # Show final status
            status = manager.get_status()
            logger.info(f"\nFinal count: {status['total']} hadiths")


if __name__ == "__main__":
    asyncio.run(main())