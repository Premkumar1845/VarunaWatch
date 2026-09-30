import httpx
import json
import pathlib
import logging
from ..config import settings

logger = logging.getLogger("varuna.weather")
CACHE_DIR = pathlib.Path("cache")
CACHE_FILE = CACHE_DIR / "weather.json"

async def get_current(lon: float = 82.23, lat: float = 16.98):
    """Fetch live meteorological telemetry from Open-Meteo with caching and offline fallback."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    try:
        async with httpx.AsyncClient(timeout=6.0) as c:
            r = await c.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,surface_pressure,precipitation"
                }
            )
            if r.status_code == 200:
                data = r.json()
                current_data = data.get("current", {})
                result = {
                    "source": "live",
                    "wind_speed_10m": current_data.get("wind_speed_10m", 85.0),
                    "wind_gusts_10m": current_data.get("wind_gusts_10m", 120.0),
                    "pressure_msl": current_data.get("surface_pressure", 965.0),
                    "precipitation": current_data.get("precipitation", 45.0),
                    "temperature": current_data.get("temperature_2m", 27.5),
                    "humidity": current_data.get("relative_humidity_2m", 92)
                }
                CACHE_FILE.write_text(json.dumps(result))
                return result
    except Exception as e:
        logger.warning(f"Live weather fetch failed ({e}), checking cache...")

    if CACHE_FILE.exists():
        try:
            cached = json.loads(CACHE_FILE.read_text())
            cached["source"] = "cached"
            return cached
        except Exception:
            pass

    return {
        "source": "fallback",
        "wind_speed_10m": 165.0,
        "wind_gusts_10m": 195.0,
        "pressure_msl": 962.0,
        "precipitation": 140.0,
        "temperature": 26.8,
        "humidity": 94
    }
