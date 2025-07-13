"""Initialize hadith collections in database"""
from sqlalchemy.orm import Session
from app.db.base import SessionLocal, engine
from app.models.hadith import HadithCollection, HadithBook, Hadith
from app.db.base import Base

# Create tables
Base.metadata.create_all(bind=engine)

# Sample collections data
COLLECTIONS_DATA = [
    {
        "collection_id": "bukhari",
        "name": "Sahih al-Bukhari",
        "arabic_name": "صحيح البخاري",
        "author": "Imam Muhammad ibn Ismail al-Bukhari",
        "author_arabic": "الإمام محمد بن إسماعيل البخاري",
        "description": "The most authentic book after the Quran, compiled by Imam Bukhari with over 7,500 carefully verified hadiths.",
        "total_hadiths": 7563,
        "books": 97,
        "authenticity": "sahih"
    },
    {
        "collection_id": "muslim",
        "name": "Sahih Muslim",
        "arabic_name": "صحيح مسلم",
        "author": "Imam Muslim ibn al-Hajjaj",
        "author_arabic": "الإمام مسلم بن الحجاج",
        "description": "One of the most authentic hadith collections, known for its rigorous methodology and systematic arrangement.",
        "total_hadiths": 7500,
        "books": 56,
        "authenticity": "sahih"
    },
    {
        "collection_id": "abudawud",
        "name": "Sunan Abu Dawud",
        "arabic_name": "سنن أبي داود",
        "author": "Imam Abu Dawud as-Sijistani",
        "author_arabic": "الإمام أبو داود السجستاني",
        "description": "A collection focused on legal hadiths and practical Islamic jurisprudence, containing around 5,274 hadiths.",
        "total_hadiths": 5274,
        "books": 43,
        "authenticity": "mixed"
    },
    {
        "collection_id": "tirmidhi",
        "name": "Jami' at-Tirmidhi",
        "arabic_name": "جامع الترمذي",
        "author": "Imam Muhammad ibn Isa at-Tirmidhi",
        "author_arabic": "الإمام محمد بن عيسى الترمذي",
        "description": "Known for its commentary on hadith authenticity and juristic opinions from various schools of thought.",
        "total_hadiths": 3956,
        "books": 49,
        "authenticity": "mixed"
    },
    {
        "collection_id": "nasai",
        "name": "Sunan an-Nasa'i",
        "arabic_name": "سنن النسائي",
        "author": "Imam Ahmad ibn Shu'ayb an-Nasa'i",
        "author_arabic": "الإمام أحمد بن شعيب النسائي",
        "description": "Known for its attention to the defects in hadith narrations and careful selection of authentic reports.",
        "total_hadiths": 5761,
        "books": 51,
        "authenticity": "mixed"
    },
    {
        "collection_id": "ibnmajah",
        "name": "Sunan Ibn Majah",
        "arabic_name": "سنن ابن ماجه",
        "author": "Imam Muhammad ibn Yazid Ibn Majah",
        "author_arabic": "الإمام محمد بن يزيد بن ماجه",
        "description": "The sixth canonical hadith collection, containing unique narrations not found in other collections.",
        "total_hadiths": 4341,
        "books": 37,
        "authenticity": "mixed"
    }
]

# Sample books for Bukhari
BUKHARI_BOOKS = [
    {"book_number": 1, "name": "Revelation", "arabic_name": "كتاب بدء الوحي", "hadith_count": 7},
    {"book_number": 2, "name": "Belief", "arabic_name": "كتاب الإيمان", "hadith_count": 51},
    {"book_number": 3, "name": "Knowledge", "arabic_name": "كتاب العلم", "hadith_count": 134},
    {"book_number": 4, "name": "Ablutions", "arabic_name": "كتاب الوضوء", "hadith_count": 113},
    {"book_number": 5, "name": "Bathing", "arabic_name": "كتاب الغسل", "hadith_count": 46},
    {"book_number": 6, "name": "Menstrual Periods", "arabic_name": "كتاب الحيض", "hadith_count": 40},
    {"book_number": 7, "name": "Tayammum", "arabic_name": "كتاب التيمم", "hadith_count": 15},
    {"book_number": 8, "name": "Prayers", "arabic_name": "كتاب الصلاة", "hadith_count": 172},
    {"book_number": 9, "name": "Times of Prayers", "arabic_name": "كتاب مواقيت الصلاة", "hadith_count": 41},
    {"book_number": 10, "name": "Call to Prayers", "arabic_name": "كتاب الأذان", "hadith_count": 169},
]

# Sample hadiths
SAMPLE_HADITHS = [
    {
        "collection_id": 1,  # Will be set dynamically
        "book_id": 1,  # Will be set dynamically
        "hadith_number": 1,
        "hadith_number_in_book": 1,
        "arabic_text": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
        "english_text": "Actions are judged by intentions, so each man will have what he intended. Thus, he whose migration was to Allah and His Messenger, his migration is to Allah and His Messenger; but he whose migration was for some worldly thing he might gain, or for a wife he might marry, his migration is to that for which he migrated.",
        "narrator": "Umar ibn al-Khattab",
        "narrator_chain": "Narrated 'Umar bin Al-Khattab",
        "grade": "sahih",
        "grade_text": "Authentic",
        "reference": "Sahih al-Bukhari 1",
        "book_reference": "Book 1, Hadith 1",
        "tags": ["faith", "intention", "migration", "fundamental"]
    },
    {
        "collection_id": 1,
        "book_id": 1,
        "hadith_number": 2,
        "hadith_number_in_book": 2,
        "arabic_text": "الإِيمَانُ أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ",
        "english_text": "Faith is to believe in Allah, His angels, His books, His messengers, and the Last Day, and to believe in divine destiny, both the good and the evil thereof.",
        "narrator": "Abu Huraira",
        "narrator_chain": "Narrated Abu Huraira",
        "grade": "sahih",
        "grade_text": "Authentic",
        "reference": "Sahih al-Bukhari 50",
        "book_reference": "Book 2, Hadith 43",
        "tags": ["faith", "belief", "pillars", "creed"]
    },
    {
        "collection_id": 1,
        "book_id": 1,
        "hadith_number": 3,
        "hadith_number_in_book": 3,
        "arabic_text": "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
        "english_text": "Islam is built on five [pillars]: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving the zakat, making the pilgrimage to the House, and fasting in Ramadan.",
        "narrator": "Abdullah ibn Umar",
        "narrator_chain": "Narrated Ibn 'Umar",
        "grade": "sahih",
        "grade_text": "Authentic",
        "reference": "Sahih al-Bukhari 8",
        "book_reference": "Book 2, Hadith 1",
        "tags": ["islam", "pillars", "fundamental", "worship"]
    }
]

def init_hadith_data():
    """Initialize hadith collections and sample data"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing = db.query(HadithCollection).first()
        if existing:
            print("Hadith data already exists")
            return
        
        # Add collections
        for collection_data in COLLECTIONS_DATA:
            collection = HadithCollection(**collection_data)
            db.add(collection)
        
        db.commit()
        print(f"Added {len(COLLECTIONS_DATA)} hadith collections")
        
        # Get Bukhari collection
        bukhari = db.query(HadithCollection).filter_by(collection_id="bukhari").first()
        
        # Add books for Bukhari
        for book_data in BUKHARI_BOOKS:
            book = HadithBook(
                collection_id=bukhari.id,
                **book_data
            )
            db.add(book)
        
        db.commit()
        print(f"Added {len(BUKHARI_BOOKS)} books for Sahih al-Bukhari")
        
        # Get first book
        first_book = db.query(HadithBook).filter_by(
            collection_id=bukhari.id,
            book_number=1
        ).first()
        
        # Add sample hadiths
        for hadith_data in SAMPLE_HADITHS:
            hadith_data["collection_id"] = bukhari.id
            hadith_data["book_id"] = first_book.id
            hadith = Hadith(**hadith_data)
            db.add(hadith)
        
        db.commit()
        print(f"Added {len(SAMPLE_HADITHS)} sample hadiths")
        
    except Exception as e:
        print(f"Error initializing hadith data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_hadith_data()