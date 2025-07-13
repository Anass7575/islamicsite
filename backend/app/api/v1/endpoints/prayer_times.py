from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, time
import math

router = APIRouter()

# Pydantic models
class PrayerTimesResponse(BaseModel):
    location: str
    date: str
    times: Dict[str, str]
    timezone: str

class QiblaResponse(BaseModel):
    latitude: float
    longitude: float
    qibla_direction: float
    compass_direction: str

# Helper functions for prayer time calculations
def calculate_prayer_times(latitude: float, longitude: float, date: datetime) -> Dict[str, str]:
    """
    Simplified prayer time calculation
    In production, use a proper library like pyIslam or praytimes
    """
    # This is a very simplified calculation - for production use proper algorithms
    base_times = {
        "Fajr": "05:30",
        "Sunrise": "06:45",
        "Dhuhr": "12:30",
        "Asr": "15:45",
        "Maghrib": "18:15",
        "Isha": "19:30"
    }
    
    # Adjust slightly based on latitude (very simplified)
    lat_adjustment = int((latitude - 51.5) * 10)  # minutes adjustment
    
    adjusted_times = {}
    for prayer, base_time in base_times.items():
        hour, minute = map(int, base_time.split(':'))
        minute += lat_adjustment
        
        # Handle minute overflow
        if minute >= 60:
            hour += minute // 60
            minute = minute % 60
        elif minute < 0:
            hour -= 1
            minute = 60 + minute
            
        adjusted_times[prayer] = f"{hour:02d}:{minute:02d}"
    
    return adjusted_times

def calculate_qibla_direction(latitude: float, longitude: float) -> tuple:
    """Calculate Qibla direction from given coordinates"""
    # Kaaba coordinates
    kaaba_lat = 21.4225
    kaaba_lon = 39.8262
    
    # Convert to radians
    lat1 = math.radians(latitude)
    lat2 = math.radians(kaaba_lat)
    lon1 = math.radians(longitude)
    lon2 = math.radians(kaaba_lon)
    
    # Calculate bearing
    dlon = lon2 - lon1
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    bearing = math.atan2(y, x)
    
    # Convert to degrees
    bearing_degrees = math.degrees(bearing)
    bearing_degrees = (bearing_degrees + 360) % 360
    
    # Determine compass direction
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(bearing_degrees / 45) % 8
    compass_direction = directions[index]
    
    return bearing_degrees, compass_direction

@router.get("/times")
async def get_prayer_times(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")
):
    """Get prayer times for a specific location"""
    try:
        if date:
            prayer_date = datetime.strptime(date, "%Y-%m-%d")
        else:
            prayer_date = datetime.now()
            
        times = calculate_prayer_times(latitude, longitude, prayer_date)
        
        return PrayerTimesResponse(
            location=f"{latitude:.4f}, {longitude:.4f}",
            date=prayer_date.strftime("%Y-%m-%d"),
            times=times,
            timezone="UTC"  # Simplified - in production, determine actual timezone
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/times/{city}")
async def get_prayer_times_by_city(
    city: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")
):
    """Get prayer times for a specific city"""
    # City coordinates (simplified - in production, use a proper geocoding service)
    city_coords = {
        "london": (51.5074, -0.1278),
        "paris": (48.8566, 2.3522),
        "new york": (40.7128, -74.0060),
        "dubai": (25.2048, 55.2708),
        "cairo": (30.0444, 31.2357),
        "istanbul": (41.0082, 28.9784),
        "mecca": (21.4225, 39.8262),
        "medina": (24.5247, 39.5692)
    }
    
    city_lower = city.lower()
    if city_lower not in city_coords:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found")
    
    lat, lon = city_coords[city_lower]
    
    try:
        if date:
            prayer_date = datetime.strptime(date, "%Y-%m-%d")
        else:
            prayer_date = datetime.now()
            
        times = calculate_prayer_times(lat, lon, prayer_date)
        
        return PrayerTimesResponse(
            location=city.title(),
            date=prayer_date.strftime("%Y-%m-%d"),
            times=times,
            timezone="UTC"  # Simplified
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/qibla")
async def get_qibla_direction(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude")
):
    """Get Qibla direction for a specific location"""
    try:
        qibla_degrees, compass_dir = calculate_qibla_direction(latitude, longitude)
        
        return QiblaResponse(
            latitude=latitude,
            longitude=longitude,
            qibla_direction=round(qibla_degrees, 2),
            compass_direction=compass_dir
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))