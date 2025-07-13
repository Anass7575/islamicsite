#!/usr/bin/env python3
"""
Check the progress of the hadith import
"""

import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithCollection

def check_progress():
    """Check import progress from database and progress file"""
    
    # Check progress file
    progress_file = "import_progress.json"
    if os.path.exists(progress_file):
        print("=== Import Progress File ===")
        with open(progress_file, 'r') as f:
            progress = json.load(f)
        
        for collection, data in progress.items():
            timestamp = datetime.fromisoformat(data['timestamp'])
            print(f"\n{collection}:")
            print(f"  Imported: {data['imported']}")
            print(f"  Skipped: {data['skipped']}")
            print(f"  Errors: {data['errors']}")
            print(f"  Last updated: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check database
    print("\n=== Database Status ===")
    db: Session = SessionLocal()
    
    try:
        collections = db.query(HadithCollection).all()
        
        total_hadiths = 0
        for collection in collections:
            count = db.query(func.count(Hadith.id)).filter(
                Hadith.collection_id == collection.id
            ).scalar()
            
            expected = {
                "bukhari": 7563,
                "muslim": 7453,
                "abudawud": 5274,
                "tirmidhi": 3956,
                "nasai": 5761,
                "ibnmajah": 4341
            }
            
            expected_count = expected.get(collection.collection_id, 0)
            percentage = (count / expected_count * 100) if expected_count > 0 else 0
            
            print(f"\n{collection.name}:")
            print(f"  Current: {count:,} hadiths")
            print(f"  Expected: {expected_count:,} hadiths")
            print(f"  Progress: {percentage:.1f}%")
            
            total_hadiths += count
        
        print(f"\nTotal hadiths in database: {total_hadiths:,}")
        print(f"Total expected: 34,348")
        print(f"Overall progress: {total_hadiths/34348*100:.1f}%")
        
    finally:
        db.close()
    
    # Check if import is running
    print("\n=== Import Process Status ===")
    pid_file = "/app/logs/import_pid.txt"
    if os.path.exists(pid_file):
        with open(pid_file, 'r') as f:
            pid = f.read().strip()
        
        # Check if process is running
        try:
            os.kill(int(pid), 0)
            print(f"Import process is RUNNING (PID: {pid})")
        except OSError:
            print(f"Import process is NOT running (last PID: {pid})")
    else:
        print("No import process information found")

if __name__ == "__main__":
    check_progress()