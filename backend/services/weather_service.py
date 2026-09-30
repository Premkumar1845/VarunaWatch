"""
VarunaWatch Backend - Live Weather Telemetry Service
Integrates with Tomorrow.io API & Open-Meteo with fallback mechanisms.
"""
import logging
import httpx
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger("varuna.weather")


async def fetch_tomorrow_forecast(lat: float = 16.9891, lng: float = 82.2475) -> Optional[Dict[str, Any]]:
    """
    Fetches real-time weather & marine forecast data from Tomorrow.io API over HTTPS.
    Default location: Coastal Andhra Pradesh (Kakinada / Godavari basin: 16.9891, 82.2475).
    """
    api_key = settings.TOMORROW_API_KEY or settings.WEATHER_API_KEY
    if not api_key:
        logger.info("Tomorrow.io API key not configured, using fallback telemetry.")
        return None

    url = "https://api.tomorrow.io/v4/weather/forecast"
    params = {
        "location": f"{lat},{lng}",
        "apikey": api_key,
        "timesteps": "1h",
        "units": "metric"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                logger.info("Successfully fetched Tomorrow.io weather data for (%s, %s)", lat, lng)
                return data
            else:
                logger.warning("Tomorrow.io returned status %s: %s", response.status_code, response.text)
                return None
    except Exception as e:
        logger.error("Error connecting to Tomorrow.io API: %s", str(e))
        return None
