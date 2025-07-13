from fastapi import APIRouter, HTTPException
import httpx
from typing import Optional

router = APIRouter()

ALQURAN_API_BASE = "https://api.alquran.cloud/v1"

@router.get("/surah/{surah_number}/{edition}")
async def get_surah(surah_number: int, edition: str):
    """Proxy endpoint for Al-Quran API to avoid CORS issues"""
    if surah_number < 1 or surah_number > 114:
        raise HTTPException(status_code=400, detail="Invalid surah number")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ALQURAN_API_BASE}/surah/{surah_number}/{edition}",
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/surah/{surah_number}")
async def get_surah_info(surah_number: int):
    """Get surah information"""
    if surah_number < 1 or surah_number > 114:
        raise HTTPException(status_code=400, detail="Invalid surah number")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ALQURAN_API_BASE}/surah/{surah_number}",
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")