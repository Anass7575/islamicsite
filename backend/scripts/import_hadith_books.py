#!/usr/bin/env python3
"""
Import hadith books metadata for all collections
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.hadith import HadithBook, HadithCollection
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Hadith books data for each collection
HADITH_BOOKS = {
    "bukhari": [
        {"number": 1, "name": "Revelation", "arabic": "كتاب بدء الوحي"},
        {"number": 2, "name": "Belief", "arabic": "كتاب الإيمان"},
        {"number": 3, "name": "Knowledge", "arabic": "كتاب العلم"},
        {"number": 4, "name": "Ablutions (Wudu')", "arabic": "كتاب الوضوء"},
        {"number": 5, "name": "Bathing (Ghusl)", "arabic": "كتاب الغسل"},
        {"number": 6, "name": "Menstrual Periods", "arabic": "كتاب الحيض"},
        {"number": 7, "name": "Rubbing hands and feet with dust", "arabic": "كتاب التيمم"},
        {"number": 8, "name": "Prayers (Salat)", "arabic": "كتاب الصلاة"},
        {"number": 9, "name": "Virtues of the Prayer Hall", "arabic": "كتاب فضل الصلاة في مسجد مكة والمدينة"},
        {"number": 10, "name": "Times of the Prayers", "arabic": "كتاب مواقيت الصلاة"},
        {"number": 11, "name": "Call to Prayers (Adhaan)", "arabic": "كتاب الأذان"},
        {"number": 12, "name": "Characteristics of Prayer", "arabic": "كتاب صفة الصلاة"},
        {"number": 13, "name": "Friday Prayer", "arabic": "كتاب الجمعة"},
        {"number": 14, "name": "Fear Prayer", "arabic": "كتاب صلاة الخوف"},
        {"number": 15, "name": "The Two Festivals (Eids)", "arabic": "كتاب العيدين"},
        {"number": 16, "name": "Witr Prayer", "arabic": "كتاب الوتر"},
        {"number": 17, "name": "Invoking Allah for Rain", "arabic": "كتاب الاستسقاء"},
        {"number": 18, "name": "Eclipses", "arabic": "كتاب الكسوف"},
        {"number": 19, "name": "Prostration During Recitation", "arabic": "كتاب سجود القرآن"},
        {"number": 20, "name": "Shortening the Prayers", "arabic": "كتاب التقصير"},
        {"number": 21, "name": "Prayer at Night", "arabic": "كتاب التهجد"},
        {"number": 22, "name": "Virtues of Prayer at Masjid Makkah and Madinah", "arabic": "كتاب فضل الصلاة في مسجد مكة والمدينة"},
        {"number": 23, "name": "Actions while Praying", "arabic": "كتاب العمل في الصلاة"},
        {"number": 24, "name": "Forgetfulness in Prayer", "arabic": "كتاب السهو"},
        {"number": 25, "name": "Funerals", "arabic": "كتاب الجنائز"},
        {"number": 26, "name": "Obligatory Charity Tax (Zakat)", "arabic": "كتاب الزكاة"},
        {"number": 27, "name": "Obligatory Charity Tax After Ramadaan", "arabic": "كتاب زكاة الفطر"},
        {"number": 28, "name": "Pilgrimage (Hajj)", "arabic": "كتاب الحج"},
        {"number": 29, "name": "Minor Pilgrimage (Umra)", "arabic": "كتاب العمرة"},
        {"number": 30, "name": "Fasting", "arabic": "كتاب الصوم"},
    ],
    "muslim": [
        {"number": 1, "name": "The Book of Faith", "arabic": "كتاب الإيمان"},
        {"number": 2, "name": "The Book of Purification", "arabic": "كتاب الطهارة"},
        {"number": 3, "name": "The Book of Menstruation", "arabic": "كتاب الحيض"},
        {"number": 4, "name": "The Book of Prayers", "arabic": "كتاب الصلاة"},
        {"number": 5, "name": "The Book of Mosques and Places of Prayer", "arabic": "كتاب المساجد ومواضع الصلاة"},
        {"number": 6, "name": "The Book of Prayer - Travellers", "arabic": "كتاب صلاة المسافرين وقصرها"},
        {"number": 7, "name": "The Book of Friday Prayer", "arabic": "كتاب الجمعة"},
        {"number": 8, "name": "The Book of Prayer - Two Eids", "arabic": "كتاب صلاة العيدين"},
        {"number": 9, "name": "The Book of Prayer - Rain", "arabic": "كتاب صلاة الاستسقاء"},
        {"number": 10, "name": "The Book of Prayer - Eclipses", "arabic": "كتاب صلاة الكسوف"},
        {"number": 11, "name": "The Book of Prayer - Funerals", "arabic": "كتاب الجنائز"},
        {"number": 12, "name": "The Book of Zakat", "arabic": "كتاب الزكاة"},
        {"number": 13, "name": "The Book of Fasting", "arabic": "كتاب الصيام"},
        {"number": 14, "name": "The Book of I'tikaf", "arabic": "كتاب الاعتكاف"},
        {"number": 15, "name": "The Book of Pilgrimage", "arabic": "كتاب الحج"},
    ],
    "abudawud": [
        {"number": 1, "name": "Purification", "arabic": "كتاب الطهارة"},
        {"number": 2, "name": "Prayer", "arabic": "كتاب الصلاة"},
        {"number": 3, "name": "Zakat", "arabic": "كتاب الزكاة"},
        {"number": 4, "name": "Fasting", "arabic": "كتاب الصوم"},
        {"number": 5, "name": "Pilgrimage Rites", "arabic": "كتاب المناسك"},
        {"number": 6, "name": "Marriage", "arabic": "كتاب النكاح"},
        {"number": 7, "name": "Divorce", "arabic": "كتاب الطلاق"},
        {"number": 8, "name": "Oaths and Vows", "arabic": "كتاب الأيمان والنذور"},
        {"number": 9, "name": "Commercial Transactions", "arabic": "كتاب البيوع"},
        {"number": 10, "name": "Wages", "arabic": "كتاب الإجارة"},
        {"number": 11, "name": "The Office of the Judge", "arabic": "كتاب الأقضية"},
        {"number": 12, "name": "Knowledge", "arabic": "كتاب العلم"},
        {"number": 13, "name": "Drinks", "arabic": "كتاب الأشربة"},
        {"number": 14, "name": "Foods", "arabic": "كتاب الأطعمة"},
        {"number": 15, "name": "Medicine", "arabic": "كتاب الطب"},
    ],
    "tirmidhi": [
        {"number": 1, "name": "Purification", "arabic": "كتاب الطهارة"},
        {"number": 2, "name": "Prayer", "arabic": "كتاب الصلاة"},
        {"number": 3, "name": "Witr", "arabic": "كتاب الوتر"},
        {"number": 4, "name": "The Book on Friday", "arabic": "كتاب الجمعة"},
        {"number": 5, "name": "The Book on the Two Eids", "arabic": "كتاب العيدين"},
        {"number": 6, "name": "The Book on Traveling", "arabic": "كتاب السفر"},
        {"number": 7, "name": "The Book on Zakat", "arabic": "كتاب الزكاة"},
        {"number": 8, "name": "The Book on Fasting", "arabic": "كتاب الصوم"},
        {"number": 9, "name": "The Book on Hajj", "arabic": "كتاب الحج"},
        {"number": 10, "name": "The Book on Funerals", "arabic": "كتاب الجنائز"},
        {"number": 11, "name": "The Book on Marriage", "arabic": "كتاب النكاح"},
        {"number": 12, "name": "The Book on Divorce", "arabic": "كتاب الطلاق"},
        {"number": 13, "name": "The Book on Business", "arabic": "كتاب البيوع"},
        {"number": 14, "name": "The Book on Judgements", "arabic": "كتاب الأحكام"},
        {"number": 15, "name": "The Book on Blood Money", "arabic": "كتاب الديات"},
    ],
    "nasai": [
        {"number": 1, "name": "The Book of Purification", "arabic": "كتاب الطهارة"},
        {"number": 2, "name": "The Book of Water", "arabic": "كتاب المياه"},
        {"number": 3, "name": "The Book of Menstruation", "arabic": "كتاب الحيض والاستحاضة"},
        {"number": 4, "name": "The Book of Ghusl and Tayammum", "arabic": "كتاب الغسل والتيمم"},
        {"number": 5, "name": "The Book of Salah", "arabic": "كتاب الصلاة"},
        {"number": 6, "name": "The Book of the Times of Prayer", "arabic": "كتاب المواقيت"},
        {"number": 7, "name": "The Book of the Adhan", "arabic": "كتاب الأذان"},
        {"number": 8, "name": "The Book of the Masjids", "arabic": "كتاب المساجد"},
        {"number": 9, "name": "The Book of the Qiblah", "arabic": "كتاب القبلة"},
        {"number": 10, "name": "The Book of Leading the Prayer", "arabic": "كتاب الإمامة"},
        {"number": 11, "name": "The Book of the Friday Prayer", "arabic": "كتاب الجمعة"},
        {"number": 12, "name": "The Book of Shortening the Prayer", "arabic": "كتاب تقصير الصلاة في السفر"},
        {"number": 13, "name": "The Book of the Two Eid Prayers", "arabic": "كتاب صلاة العيدين"},
        {"number": 14, "name": "The Book of Eclipse Prayer", "arabic": "كتاب صلاة الكسوف"},
        {"number": 15, "name": "The Book of Prayer for Rain", "arabic": "كتاب الاستسقاء"},
    ],
    "ibnmajah": [
        {"number": 1, "name": "The Book of Purification", "arabic": "كتاب الطهارة وسننها"},
        {"number": 2, "name": "The Book of Prayer", "arabic": "كتاب الصلاة"},
        {"number": 3, "name": "The Book of the Call to Prayer", "arabic": "كتاب الأذان والسنة فيها"},
        {"number": 4, "name": "The Book of the Mosques and Congregations", "arabic": "كتاب المساجد والجماعات"},
        {"number": 5, "name": "The Book of Establishing the Prayer", "arabic": "كتاب إقامة الصلاة والسنة فيها"},
        {"number": 6, "name": "The Book of Funerals", "arabic": "كتاب الجنائز"},
        {"number": 7, "name": "The Book of Fasting", "arabic": "كتاب الصيام"},
        {"number": 8, "name": "The Book of Zakat", "arabic": "كتاب الزكاة"},
        {"number": 9, "name": "The Book of Marriage", "arabic": "كتاب النكاح"},
        {"number": 10, "name": "The Book of Divorce", "arabic": "كتاب الطلاق"},
        {"number": 11, "name": "The Book of Business Transactions", "arabic": "كتاب التجارات"},
        {"number": 12, "name": "The Book of Rulings", "arabic": "كتاب الأحكام"},
        {"number": 13, "name": "The Book of Gifts", "arabic": "كتاب الهبات"},
        {"number": 14, "name": "The Book of Charity", "arabic": "كتاب الصدقات"},
        {"number": 15, "name": "The Book of Pawning", "arabic": "كتاب الرهون"},
    ]
}

def import_hadith_books():
    """Import hadith books metadata"""
    db: Session = SessionLocal()
    
    try:
        for collection_id, books in HADITH_BOOKS.items():
            # Find collection
            collection = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            
            if not collection:
                logger.warning(f"Collection {collection_id} not found")
                continue
                
            logger.info(f"Importing books for {collection.name}")
            
            for book_data in books:
                # Check if book exists
                existing = db.query(HadithBook).filter(
                    HadithBook.collection_id == collection.id,
                    HadithBook.book_number == book_data["number"]
                ).first()
                
                if existing:
                    # Update existing book
                    existing.name = book_data["name"]
                    existing.arabic_name = book_data["arabic"]
                    logger.info(f"Updated book {book_data['number']}: {book_data['name']}")
                else:
                    # Create new book
                    new_book = HadithBook(
                        collection_id=collection.id,
                        book_number=book_data["number"],
                        name=book_data["name"],
                        arabic_name=book_data["arabic"],
                        hadith_count=0  # Will be updated when hadiths are imported
                    )
                    db.add(new_book)
                    logger.info(f"Created book {book_data['number']}: {book_data['name']}")
                    
        db.commit()
        logger.info("Book import completed successfully")
        
    except Exception as e:
        logger.error(f"Error during import: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting hadith books import")
    import_hadith_books()