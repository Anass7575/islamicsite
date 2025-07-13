#!/usr/bin/env python3
"""
Script to automatically categorize hadiths based on their content.
Uses keyword matching to assign categories to hadiths.
"""

import os
import sys
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.hadith import Hadith, HadithCategory
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Category keywords mapping
CATEGORY_KEYWORDS = {
    "faith": {
        "keywords": [
            "faith", "belief", "believe", "iman", "allah", "god", "prophet", "messenger",
            "testimony", "shahada", "witness", "islam", "muslim", "religion", "creed",
            "tawhid", "oneness", "worship", "ibadah", "lord", "creator", "judgment day",
            "afterlife", "paradise", "hell", "angels", "books", "revelation", "quran",
            "scripture", "decree", "qadar", "destiny", "predestination"
        ],
        "exclude": ["prayer", "pray", "salah", "salat", "fasting", "fast", "ramadan"]
    },
    "prayer": {
        "keywords": [
            "prayer", "pray", "salah", "salat", "worship", "prostration", "sujud",
            "ruku", "bow", "ablution", "wudu", "mosque", "masjid", "qibla", "adhan",
            "call to prayer", "imam", "congregation", "jumu'ah", "friday", "tahajjud",
            "fajr", "dhuhr", "asr", "maghrib", "isha", "rakah", "recitation"
        ],
        "exclude": []
    },
    "fasting": {
        "keywords": [
            "fast", "fasting", "sawm", "siyam", "ramadan", "iftar", "suhur", "sahur",
            "break fast", "month of ramadan", "laylat al-qadr", "night of power",
            "i'tikaf", "retreat", "abstain", "refrain"
        ],
        "exclude": []
    },
    "zakat": {
        "keywords": [
            "zakat", "charity", "alms", "poor", "needy", "sadaqah", "give", "giving",
            "donation", "wealth", "money", "gold", "silver", "nisab", "poor-due",
            "purification of wealth", "help", "assist", "orphan", "widow"
        ],
        "exclude": []
    },
    "hajj": {
        "keywords": [
            "hajj", "pilgrimage", "mecca", "makkah", "ka'bah", "kaaba", "umrah",
            "ihram", "tawaf", "circumambulation", "safa", "marwa", "sa'i", "arafat",
            "muzdalifah", "mina", "jamarat", "stoning", "sacrifice", "eid al-adha",
            "pilgrim", "haram", "black stone"
        ],
        "exclude": []
    },
    "knowledge": {
        "keywords": [
            "knowledge", "learn", "learning", "education", "teach", "teaching", "scholar",
            "student", "study", "wisdom", "understanding", "science", "ilm", "ulama",
            "seek knowledge", "beneficial", "guidance", "truth"
        ],
        "exclude": ["prayer", "fast", "zakat", "hajj"]
    },
    "family": {
        "keywords": [
            "family", "parent", "mother", "father", "child", "children", "son", "daughter",
            "husband", "wife", "marriage", "marry", "wedding", "nikah", "divorce", "talaq",
            "kinship", "relative", "brother", "sister", "orphan", "inheritance", "lineage"
        ],
        "exclude": []
    },
    "ethics": {
        "keywords": [
            "character", "moral", "ethics", "virtue", "good", "evil", "right", "wrong",
            "honesty", "truthful", "lie", "trust", "patience", "sabr", "gratitude",
            "shukr", "forgiveness", "mercy", "compassion", "justice", "fair", "kind",
            "kindness", "generous", "humility", "pride", "arrogance", "anger", "envy"
        ],
        "exclude": []
    },
    "social": {
        "keywords": [
            "neighbor", "friend", "community", "society", "brother", "brotherhood",
            "unity", "help", "assist", "visit", "guest", "hospitality", "greeting",
            "salam", "peace", "reconciliation", "dispute", "rights", "duty", "responsibility"
        ],
        "exclude": ["family", "marriage"]
    },
    "business": {
        "keywords": [
            "trade", "business", "buy", "sell", "transaction", "commerce", "market",
            "price", "profit", "loss", "debt", "loan", "interest", "riba", "usury",
            "contract", "agreement", "witness", "halal", "haram", "lawful", "unlawful"
        ],
        "exclude": []
    },
    "jihad": {
        "keywords": [
            "jihad", "struggle", "strive", "fight", "battle", "war", "peace", "treaty",
            "enemy", "defend", "protection", "martyr", "shahid", "courage", "brave"
        ],
        "exclude": []
    },
    "death": {
        "keywords": [
            "death", "die", "dying", "grave", "burial", "funeral", "janazah", "shroud",
            "kafan", "cemetery", "afterlife", "resurrection", "judgment", "paradise",
            "hell", "soul", "spirit", "barzakh"
        ],
        "exclude": []
    },
    "food": {
        "keywords": [
            "food", "eat", "eating", "drink", "drinking", "halal", "haram", "lawful",
            "unlawful", "meat", "slaughter", "animal", "wine", "alcohol", "intoxicant",
            "dates", "water", "honey", "milk", "bread"
        ],
        "exclude": ["fast", "fasting", "iftar"]
    },
    "health": {
        "keywords": [
            "health", "medicine", "disease", "illness", "sick", "cure", "healing",
            "treatment", "doctor", "physician", "plague", "epidemic", "pain", "suffering"
        ],
        "exclude": []
    },
    "worship": {
        "keywords": [
            "worship", "dhikr", "remembrance", "supplication", "dua", "invocation",
            "praise", "glorify", "tasbih", "istighfar", "repentance", "tawbah",
            "night prayer", "tahajjud", "witr", "sunnah", "nawafil"
        ],
        "exclude": ["salah", "prayer", "fast", "hajj", "zakat"]
    },
    "women": {
        "keywords": [
            "woman", "women", "female", "girl", "daughter", "mother", "wife", "sister",
            "menses", "menstruation", "hijab", "veil", "modesty", "dowry", "mahr"
        ],
        "exclude": []
    },
    "quran": {
        "keywords": [
            "quran", "qur'an", "verse", "ayah", "surah", "chapter", "recite", "recitation",
            "memorize", "hafiz", "revelation", "scripture", "book of allah"
        ],
        "exclude": []
    },
    "sins": {
        "keywords": [
            "sin", "sins", "major sin", "minor sin", "forbidden", "haram", "repent",
            "repentance", "forgiveness", "tawbah", "istighfar", "transgression",
            "disobedience", "evil", "wrongdoing"
        ],
        "exclude": []
    },
    "nature": {
        "keywords": [
            "nature", "creation", "universe", "earth", "sky", "heaven", "sun", "moon",
            "star", "rain", "water", "tree", "plant", "animal", "bird", "sea", "mountain"
        ],
        "exclude": []
    },
    "prophecy": {
        "keywords": [
            "prophet", "messenger", "prophecy", "revelation", "miracle", "sign",
            "previous nations", "children of israel", "moses", "jesus", "abraham",
            "noah", "adam", "story", "parable"
        ],
        "exclude": []
    }
}


class HadithCategorizer:
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        Session = sessionmaker(bind=self.engine)
        self.db = Session()
        self.categories = self._load_categories()
        
    def _load_categories(self):
        """Load categories from database into a dict"""
        categories = self.db.query(HadithCategory).all()
        return {cat.category_id: cat for cat in categories}
    
    def _calculate_category_score(self, text: str, category_id: str) -> int:
        """Calculate how well a text matches a category"""
        if category_id not in CATEGORY_KEYWORDS:
            return 0
            
        text_lower = text.lower()
        score = 0
        
        # Check positive keywords
        for keyword in CATEGORY_KEYWORDS[category_id]["keywords"]:
            if keyword in text_lower:
                # Give more weight to exact word matches
                if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                    score += 2
                else:
                    score += 1
        
        # Check exclude keywords (reduce score)
        for keyword in CATEGORY_KEYWORDS[category_id]["exclude"]:
            if keyword in text_lower:
                score -= 1
        
        return max(0, score)
    
    def categorize_hadith(self, hadith: Hadith) -> list:
        """Determine categories for a hadith based on its content"""
        # Use English text for categorization
        text = hadith.english_text or ""
        
        # Calculate scores for each category
        category_scores = {}
        for category_id in self.categories.keys():
            if category_id in CATEGORY_KEYWORDS:
                score = self._calculate_category_score(text, category_id)
                if score > 0:
                    category_scores[category_id] = score
        
        # Sort by score and take top categories (threshold: score >= 2)
        selected_categories = []
        for category_id, score in sorted(category_scores.items(), key=lambda x: x[1], reverse=True):
            if score >= 2:  # Minimum score threshold
                selected_categories.append(category_id)
                if len(selected_categories) >= 3:  # Maximum 3 categories per hadith
                    break
        
        return selected_categories
    
    def process_all_hadiths(self, batch_size: int = 1000):
        """Process all hadiths and assign categories"""
        total = self.db.query(Hadith).count()
        logger.info(f"Total hadiths to process: {total}")
        
        processed = 0
        categorized = 0
        
        # Process in batches
        for offset in range(0, total, batch_size):
            hadiths = self.db.query(Hadith).offset(offset).limit(batch_size).all()
            
            for hadith in hadiths:
                categories = self.categorize_hadith(hadith)
                
                if categories:
                    hadith.categories = categories
                    categorized += 1
                
                processed += 1
                
                if processed % 100 == 0:
                    logger.info(f"Processed: {processed}/{total} ({categorized} categorized)")
            
            # Commit batch
            self.db.commit()
            logger.info(f"Committed batch at offset {offset}")
        
        logger.info(f"Categorization complete! Processed: {processed}, Categorized: {categorized}")
        return processed, categorized


def main():
    """Main function"""
    logger.info("Starting hadith categorization...")
    
    # Create database URL
    db_url = settings.DATABASE_URL
    
    # Initialize categorizer
    categorizer = HadithCategorizer(db_url)
    
    # Process all hadiths
    processed, categorized = categorizer.process_all_hadiths()
    
    logger.info(f"Done! Processed {processed} hadiths, categorized {categorized}")


if __name__ == "__main__":
    main()