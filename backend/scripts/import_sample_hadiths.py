#!/usr/bin/env python3
"""
Script simple pour importer des hadiths d'exemple
"""

import sys
import os
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.hadith import Hadith, HadithCollection
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Hadiths d'exemple
SAMPLE_HADITHS = [
    # Bukhari
    {
        "collection": "bukhari",
        "hadiths": [
            {
                "number": 1,
                "arabic": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
                "english": "Actions are (judged) by intentions, and everyone will get what was intended",
                "narrator": "Umar ibn al-Khattab",
                "grade": "sahih"
            },
            {
                "number": 2,
                "arabic": "الإِيمَانُ أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ",
                "english": "Faith is to believe in Allah, His angels, His books, His messengers, and the Last Day",
                "narrator": "Abu Hurairah",
                "grade": "sahih"
            },
            {
                "number": 3,
                "arabic": "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ",
                "english": "Islam is built upon five pillars",
                "narrator": "Abdullah ibn Umar",
                "grade": "sahih"
            },
            {
                "number": 4,
                "arabic": "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
                "english": "The most beloved deeds to Allah are those done consistently, even if they are small",
                "narrator": "Aisha",
                "grade": "sahih"
            },
            {
                "number": 5,
                "arabic": "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
                "english": "None of you truly believes until he loves for his brother what he loves for himself",
                "narrator": "Anas ibn Malik",
                "grade": "sahih"
            }
        ]
    },
    # Muslim
    {
        "collection": "muslim",
        "hadiths": [
            {
                "number": 1,
                "arabic": "الطُّهُورُ شَطْرُ الإِيمَانِ",
                "english": "Cleanliness is half of faith",
                "narrator": "Abu Malik al-Ash'ari",
                "grade": "sahih"
            },
            {
                "number": 2,
                "arabic": "الدِّينُ النَّصِيحَةُ",
                "english": "Religion is sincerity/good advice",
                "narrator": "Tamim ad-Dari",
                "grade": "sahih"
            },
            {
                "number": 3,
                "arabic": "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ",
                "english": "Whoever among you sees an evil, let him change it with his hand",
                "narrator": "Abu Sa'id al-Khudri",
                "grade": "sahih"
            },
            {
                "number": 4,
                "arabic": "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
                "english": "A Muslim is one from whose tongue and hand other Muslims are safe",
                "narrator": "Abdullah ibn Amr",
                "grade": "sahih"
            },
            {
                "number": 5,
                "arabic": "أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ",
                "english": "The best prayer after the obligatory prayers is the night prayer",
                "narrator": "Abu Hurairah",
                "grade": "sahih"
            }
        ]
    },
    # Abu Dawud
    {
        "collection": "abudawud",
        "hadiths": [
            {
                "number": 1,
                "arabic": "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
                "english": "Seeking knowledge is an obligation upon every Muslim",
                "narrator": "Anas ibn Malik",
                "grade": "hasan"
            },
            {
                "number": 2,
                "arabic": "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
                "english": "The best of you are those who learn the Quran and teach it",
                "narrator": "Uthman ibn Affan",
                "grade": "sahih"
            },
            {
                "number": 3,
                "arabic": "الصَّلَاةُ نُورٌ",
                "english": "Prayer is light",
                "narrator": "Abu Malik al-Ash'ari",
                "grade": "sahih"
            },
            {
                "number": 4,
                "arabic": "مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيَعْرِفْ حَقَّ كَبِيرِنَا فَلَيْسَ مِنَّا",
                "english": "He who does not show mercy to our young ones and respect to our elders is not one of us",
                "narrator": "Abdullah ibn Amr",
                "grade": "sahih"
            },
            {
                "number": 5,
                "arabic": "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
                "english": "The most beloved people to Allah are those who are most beneficial to people",
                "narrator": "Abdullah ibn Umar",
                "grade": "hasan"
            }
        ]
    },
    # Tirmidhi
    {
        "collection": "tirmidhi",
        "hadiths": [
            {
                "number": 1,
                "arabic": "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
                "english": "Fear Allah wherever you are",
                "narrator": "Abu Dharr",
                "grade": "hasan"
            },
            {
                "number": 2,
                "arabic": "الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ",
                "english": "Modesty is a branch of faith",
                "narrator": "Abu Hurairah",
                "grade": "sahih"
            },
            {
                "number": 3,
                "arabic": "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
                "english": "A kind word is charity",
                "narrator": "Abu Hurairah",
                "grade": "sahih"
            },
            {
                "number": 4,
                "arabic": "خَيْرُ الْأُمُورِ أَوْسَطُهَا",
                "english": "The best of matters are those which are moderate",
                "narrator": "Ali ibn Abi Talib",
                "grade": "hasan"
            },
            {
                "number": 5,
                "arabic": "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ",
                "english": "Oppression will be darkness on the Day of Resurrection",
                "narrator": "Ibn Umar",
                "grade": "sahih"
            }
        ]
    }
]

def import_sample_hadiths():
    """Importer les hadiths d'exemple"""
    db: Session = SessionLocal()
    
    try:
        imported = 0
        
        for collection_data in SAMPLE_HADITHS:
            # Trouver la collection
            collection = db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_data['collection']
            ).first()
            
            if not collection:
                logger.warning(f"Collection {collection_data['collection']} non trouvée")
                continue
                
            logger.info(f"Import des hadiths pour {collection.name}")
            
            for hadith_data in collection_data["hadiths"]:
                # Vérifier si le hadith existe déjà
                existing = db.query(Hadith).filter(
                    Hadith.collection_id == collection.id,
                    Hadith.hadith_number == hadith_data["number"]
                ).first()
                
                if existing:
                    continue
                    
                # Créer le hadith
                new_hadith = Hadith(
                    collection_id=collection.id,
                    book_id=1,  # Par défaut
                    hadith_number=hadith_data["number"],
                    arabic_text=hadith_data["arabic"],
                    english_text=hadith_data["english"],
                    narrator_chain=hadith_data["narrator"],
                    arabic_narrator_chain=hadith_data["narrator"],
                    grade=hadith_data["grade"],
                    grade_text=hadith_data["grade"].capitalize(),
                    reference=f"{collection.name} {hadith_data['number']}"
                )
                
                db.add(new_hadith)
                imported += 1
                
        db.commit()
        logger.info(f"Import terminé: {imported} hadiths importés")
        
    except Exception as e:
        logger.error(f"Erreur lors de l'import: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Démarrage de l'import des hadiths d'exemple")
    import_sample_hadiths()