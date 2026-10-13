import httpx
import json
import pathlib
import logging

logger = logging.getLogger("varuna.osm")
CACHE_DIR = pathlib.Path("cache")
CACHE_FILE = CACHE_DIR / "osm_infra.json"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OVERPASS_QUERY = """
[out:json][timeout:60];
(
  node["amenity"="hospital"](15.0,80.0,18.0,84.0);
  node["power"="substation"](15.0,80.0,18.0,84.0);
  node["amenity"="shelter"](15.0,80.0,18.0,84.0);
  way["highway"="primary"](15.0,80.0,18.0,84.0);
);
out center 50;
"""

async def fetch_osm_assets():
    """Fetch OpenStreetMap critical assets for Coastal Andhra Pradesh with local cache."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(OVERPASS_URL, data={"data": OVERPASS_QUERY})
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                CACHE_FILE.write_text(json.dumps(elements))
                return {"source": "live_overpass", "count": len(elements), "elements": elements}
    except Exception as e:
        logger.warning(f"OSM Overpass query failed ({e}), loading cache...")

    if CACHE_FILE.exists():
        try:
            cached = json.loads(CACHE_FILE.read_text())
            return {"source": "cached", "count": len(cached), "elements": cached}
        except Exception:
            pass

    return {
        "source": "fallback",
        "count": 8,
        "elements": [
            {"id": "osm_101", "lat": 16.989, "lon": 82.234, "tags": {"name": "Kakinada General Hospital", "amenity": "hospital"}},
            {"id": "osm_102", "lat": 17.704, "lon": 83.303, "tags": {"name": "King George Hospital Visakhapatnam", "amenity": "hospital"}},
            {"id": "osm_103", "lat": 16.187, "lon": 81.138, "tags": {"name": "Machilipatnam District Hospital", "amenity": "hospital"}},
            {"id": "osm_104", "lat": 16.506, "lon": 80.648, "tags": {"name": "Vijayawada 220kV Substation", "power": "substation"}}
        ]
    }
