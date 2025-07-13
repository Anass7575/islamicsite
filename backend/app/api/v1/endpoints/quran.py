from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
import httpx

router = APIRouter()

# Pydantic models
class Surah(BaseModel):
    number: int
    name: str
    englishName: str
    englishNameTranslation: str
    numberOfAyahs: int
    revelationType: str

class Ayah(BaseModel):
    number: int
    text: str
    numberInSurah: int
    juz: int
    manzil: int
    page: int
    ruku: int
    hizbQuarter: int
    sajda: bool

class SurahDetail(BaseModel):
    number: int
    name: str
    englishName: str
    englishNameTranslation: str
    numberOfAyahs: int
    revelationType: str
    ayahs: List[Ayah]

# Mock data for now - in production, this would come from a database or external API
SURAHS_DATA = [
    {
        "number": 1,
        "name": "الفاتحة",
        "englishName": "Al-Fatiha",
        "englishNameTranslation": "The Opening",
        "numberOfAyahs": 7,
        "revelationType": "Meccan"
    },
    {
        "number": 2,
        "name": "البقرة",
        "englishName": "Al-Baqara",
        "englishNameTranslation": "The Cow",
        "numberOfAyahs": 286,
        "revelationType": "Medinan"
    },
    {
        "number": 3,
        "name": "آل عمران",
        "englishName": "Al-Imran",
        "englishNameTranslation": "The Family of Imran",
        "numberOfAyahs": 200,
        "revelationType": "Medinan"
    },
    {
        "number": 4,
        "name": "النساء",
        "englishName": "An-Nisa",
        "englishNameTranslation": "The Women",
        "numberOfAyahs": 176,
        "revelationType": "Medinan"
    },
    {
        "number": 5,
        "name": "المائدة",
        "englishName": "Al-Ma'ida",
        "englishNameTranslation": "The Table",
        "numberOfAyahs": 120,
        "revelationType": "Medinan"
    }
]

@router.get("/surahs", response_model=List[Surah])
async def get_all_surahs():
    """Get list of all Quran surahs"""
    return SURAHS_DATA

@router.get("/surah/{surah_number}", response_model=SurahDetail)
async def get_surah(surah_number: int, edition: Optional[str] = "quran-simple"):
    """Get a specific surah with its verses"""
    surah = next((s for s in SURAHS_DATA if s["number"] == surah_number), None)
    if not surah:
        raise HTTPException(status_code=404, detail="Surah not found")
    
    # Mock ayahs for demonstration
    mock_ayahs = []
    if surah_number == 1:  # Al-Fatiha
        mock_ayahs = [
            {"number": 1, "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "numberInSurah": 1, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 2, "text": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", "numberInSurah": 2, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 3, "text": "الرَّحْمَٰنِ الرَّحِيمِ", "numberInSurah": 3, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 4, "text": "مَالِكِ يَوْمِ الدِّينِ", "numberInSurah": 4, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 5, "text": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "numberInSurah": 5, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 6, "text": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", "numberInSurah": 6, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False},
            {"number": 7, "text": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", "numberInSurah": 7, "juz": 1, "manzil": 1, "page": 1, "ruku": 1, "hizbQuarter": 1, "sajda": False}
        ]
    
    return {**surah, "ayahs": mock_ayahs}

@router.get("/verse/{surah_number}/{verse_number}")
async def get_verse(surah_number: int, verse_number: int, edition: Optional[str] = "quran-simple"):
    """Get a specific verse"""
    surah = next((s for s in SURAHS_DATA if s["number"] == surah_number), None)
    if not surah:
        raise HTTPException(status_code=404, detail="Surah not found")
    
    if verse_number > surah["numberOfAyahs"]:
        raise HTTPException(status_code=404, detail="Verse not found")
    
    # Mock verse response
    return {
        "number": verse_number,
        "text": "Mock verse text",
        "surah": surah,
        "edition": edition
    }

@router.get("/search")
async def search_quran(
    q: str = Query(..., description="Search query"),
    language: Optional[str] = Query("en", description="Language for search")
):
    """Search the Quran"""
    # Mock search results
    return {
        "query": q,
        "language": language,
        "count": 0,
        "results": []
    }