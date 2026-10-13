import asyncpg
import json
import logging
import math
from typing import List, Dict, Any, Optional
from .config import settings

logger = logging.getLogger("varuna.db")

_pool: Optional[asyncpg.Pool] = None
_db_connected: bool = False

# High-fidelity mock in-memory dataset for graceful standalone/fallback operation
MOCK_CYCLONES = [
    {
        "id": 1,
        "name": "Cyclone Michaung",
        "category": 3,
        "track": [
            [84.2, 14.1],
            [83.5, 15.2],
            [82.8, 15.9],
            [82.2, 16.5],
            [81.5, 17.2],
            [80.8, 17.8]
        ],
        "status": "active",
        "wind_kph": 165.0,
        "pressure_hpa": 962.0,
        "landfall_eta": "2026-09-30T04:00:00Z",
        "updated_at": "2026-09-29T15:30:00Z"
    }
]

MOCK_INFRASTRUCTURE = [
    {
        "id": 1,
        "osm_id": "osm_node_101",
        "name": "Kakinada General Hospital",
        "category": "hospital",
        "criticality": 1.0,
        "population_served": 240000,
        "geom": '{"type":"Point","coordinates":[82.234, 16.989]}',
        "factors": {"flood": 85, "rain": 78, "wind": 80, "surge": 72, "vuln": 75},
        "risk_score": 78.4,
        "risk_band": "Very High",
        "status": "critical",
        "lon": 82.234,
        "lat": 16.989
    },
    {
        "id": 2,
        "osm_id": "osm_node_102",
        "name": "King George Hospital Visakhapatnam",
        "category": "hospital",
        "criticality": 1.0,
        "population_served": 450000,
        "geom": '{"type":"Point","coordinates":[83.303, 17.704]}',
        "factors": {"flood": 65, "rain": 70, "wind": 85, "surge": 50, "vuln": 68},
        "risk_score": 68.3,
        "risk_band": "Very High",
        "status": "alert",
        "lon": 83.303,
        "lat": 17.704
    },
    {
        "id": 3,
        "osm_id": "osm_node_103",
        "name": "Machilipatnam District Hospital",
        "category": "hospital",
        "criticality": 1.0,
        "population_served": 180000,
        "geom": '{"type":"Point","coordinates":[81.138, 16.187]}',
        "factors": {"flood": 92, "rain": 85, "wind": 90, "surge": 88, "vuln": 82},
        "risk_score": 87.9,
        "risk_band": "Extreme",
        "status": "critical",
        "lon": 81.138,
        "lat": 16.187
    },
    {
        "id": 4,
        "osm_id": "osm_node_104",
        "name": "Vijayawada 220kV Substation",
        "category": "substation",
        "criticality": 1.0,
        "population_served": 520000,
        "geom": '{"type":"Point","coordinates":[80.648, 16.506]}',
        "factors": {"flood": 74, "rain": 65, "wind": 60, "surge": 30, "vuln": 62},
        "risk_score": 60.6,
        "risk_band": "Very High",
        "status": "warning",
        "lon": 80.648,
        "lat": 16.506
    },
    {
        "id": 5,
        "osm_id": "osm_node_105",
        "name": "Bapatla Cyclone Multi-Purpose Shelter",
        "category": "shelter",
        "criticality": 0.2,
        "population_served": 5000,
        "geom": '{"type":"Point","coordinates":[80.468, 15.904]}',
        "factors": {"flood": 40, "rain": 50, "wind": 75, "surge": 45, "vuln": 30},
        "risk_score": 46.0,
        "risk_band": "High",
        "status": "nominal",
        "lon": 80.468,
        "lat": 15.904
    },
    {
        "id": 6,
        "osm_id": "osm_node_106",
        "name": "Prakasam Barrage Bridge Link",
        "category": "bridge",
        "criticality": 0.8,
        "population_served": 320000,
        "geom": '{"type":"Point","coordinates":[80.605, 16.507]}',
        "factors": {"flood": 82, "rain": 70, "wind": 65, "surge": 20, "vuln": 60},
        "risk_score": 63.4,
        "risk_band": "Very High",
        "status": "alert",
        "lon": 80.605,
        "lat": 16.507
    },
    {
        "id": 7,
        "osm_id": "osm_node_107",
        "name": "Kakinada Port Power Substation",
        "category": "substation",
        "criticality": 1.0,
        "population_served": 160000,
        "geom": '{"type":"Point","coordinates":[82.261, 16.963]}',
        "factors": {"flood": 90, "rain": 80, "wind": 85, "surge": 85, "vuln": 80},
        "risk_score": 84.5,
        "risk_band": "Extreme",
        "status": "critical",
        "lon": 82.261,
        "lat": 16.963
    },
    {
        "id": 8,
        "osm_id": "osm_node_108",
        "name": "Guntur Zilla Parishad High School Shelter",
        "category": "school",
        "criticality": 0.5,
        "population_served": 2500,
        "geom": '{"type":"Point","coordinates":[80.436, 16.306]}',
        "factors": {"flood": 35, "rain": 45, "wind": 55, "surge": 10, "vuln": 25},
        "risk_score": 34.3,
        "risk_band": "Moderate",
        "status": "nominal",
        "lon": 80.436,
        "lat": 16.306
    }
]

MOCK_ROADS = [
    {
        "id": 1,
        "osm_id": "road_01",
        "name": "NH-16 Kakinada to Rajahmundry Bypass",
        "class": "primary",
        "flood_exposure": 78.5,
        "bottleneck": True,
        "geom": '{"type":"LineString","coordinates":[[82.23, 16.98], [82.10, 16.99], [81.80, 17.00]]}'
    },
    {
        "id": 2,
        "osm_id": "road_02",
        "name": "SH-42 Machilipatnam Coastal Highway",
        "class": "secondary",
        "flood_exposure": 88.0,
        "bottleneck": True,
        "geom": '{"type":"LineString","coordinates":[[81.13, 16.18], [81.25, 16.25], [81.40, 16.35]]}'
    },
    {
        "id": 3,
        "osm_id": "road_03",
        "name": "Visakhapatnam Beach Road Corridor",
        "class": "primary",
        "flood_exposure": 64.0,
        "bottleneck": True,
        "geom": '{"type":"LineString","coordinates":[[83.30, 17.70], [83.35, 17.74], [83.38, 17.78]]}'
    },
    {
        "id": 4,
        "osm_id": "road_04",
        "name": "Guntur-Tenali Link Road",
        "class": "secondary",
        "flood_exposure": 32.0,
        "bottleneck": False,
        "geom": '{"type":"LineString","coordinates":[[80.43, 16.30], [80.50, 16.27], [80.64, 16.24]]}'
    }
]

MOCK_HAZARDS = [
    {
        "id": 1,
        "cyclone_id": 1,
        "hazard": "surge",
        "intensity": 85,
        "geom": '{"type":"MultiPolygon","coordinates":[[[[82.0, 16.0],[82.5, 16.0],[82.5, 17.0],[82.0, 17.0],[82.0, 16.0]]]]}'
    },
    {
        "id": 2,
        "cyclone_id": 1,
        "hazard": "flood",
        "intensity": 90,
        "geom": '{"type":"MultiPolygon","coordinates":[[[[81.8, 15.8],[82.6, 15.8],[82.6, 16.8],[81.8, 16.8],[81.8, 15.8]]]]}'
    },
    {
        "id": 3,
        "cyclone_id": 1,
        "hazard": "wind",
        "intensity": 95,
        "geom": '{"type":"MultiPolygon","coordinates":[[[[81.0, 15.0],[83.5, 15.0],[83.5, 18.0],[81.0, 18.0],[81.0, 15.0]]]]}'
    },
    {
        "id": 4,
        "cyclone_id": 1,
        "hazard": "rain",
        "intensity": 88,
        "geom": '{"type":"MultiPolygon","coordinates":[[[[81.2, 15.2],[83.0, 15.2],[83.0, 17.5],[81.2, 17.5],[81.2, 15.2]]]]}'
    }
]

MOCK_ADVISORIES = [
    {
        "id": 1,
        "cyclone_id": 1,
        "threat_level": "Category 3 - Severe Cyclonic Storm",
        "hazards": {"flood": 90, "wind": 95, "surge": 85, "rain": 88},
        "actions": [
            "Evacuate vulnerable settlements along Kakinada and Machilipatnam coastlines.",
            "Pre-stage emergency backup diesel generators at Kakinada General Hospital and King George Hospital.",
            "Reroute critical medical supply transport away from NH-16 Kakinada bypass and SH-42.",
            "Deputize NDRF teams along Prakasam Barrage corridor to manage flood surge.",
            "De-energize coastal 220kV feeders prior to expected landfall window."
        ],
        "body": "Cyclone Michaung is tracking north-northwest with sustained winds of 165 km/h and central pressure of 962 hPa. Peak storm surge of 2.8m and intense precipitation will severely impact low-lying assets in Kakinada and Machilipatnam. 5 out of 8 monitored critical infrastructure assets are in High to Extreme risk bands. NH-16 and SH-42 are identified as primary bottlenecks requiring immediate traffic diversions.",
        "source": "gemini",
        "created_at": "2026-09-29T15:00:00Z"
    }
]

MOCK_SCENARIOS: List[Dict[str, Any]] = []

def haversine_km(lon1, lat1, lon2, lat2):
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

async def pool():
    global _pool, _db_connected
    if _pool is None:
        try:
            _pool = await asyncpg.create_pool(settings.database_url, timeout=3.0)
            _db_connected = True
        except Exception as e:
            logger.warning(f"Database connection not available ({e}), using in-memory mock store.")
            _db_connected = False
    return _pool

async def query(sql: str, *args) -> List[Dict[str, Any]]:
    p = await pool()
    if _db_connected and p:
        try:
            async with p.acquire() as c:
                rows = await c.fetch(sql, *args)
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"SQL execution error: {e}, falling back to mock query handler.")

    # In-memory mock query engine for standalone offline execution
    import re
    s = re.sub(r'\s+', ' ', sql.strip().upper())
    
    if "FROM CYCLONES" in s:
        if "WIND_KPH" in s and "PRESSURE_HPA" in s and "SELECT WIND_KPH" in s:
            return [{"wind_kph": MOCK_CYCLONES[0]["wind_kph"], "pressure_hpa": MOCK_CYCLONES[0]["pressure_hpa"]}]
        return MOCK_CYCLONES

    if "SELECT * FROM HAZARD_ZONES WHERE CYCLONE_ID" in s:
        return MOCK_HAZARDS

    if "SELECT RISK_BAND, COUNT(*) N, AVG(RISK_SCORE) AVG_SCORE FROM INFRASTRUCTURE GROUP BY RISK_BAND" in s:
        bands: Dict[str, List[float]] = {}
        for a in MOCK_INFRASTRUCTURE:
            bands.setdefault(a["risk_band"], []).append(float(a["risk_score"]))
        return [{"risk_band": k, "n": len(v), "avg_score": round(sum(v)/len(v), 1)} for k, v in bands.items()]

    if "SELECT RISK_BAND, COUNT(*) N FROM INFRASTRUCTURE GROUP BY RISK_BAND" in s:
        bands_c: Dict[str, int] = {}
        for a in MOCK_INFRASTRUCTURE:
            bands_c[a["risk_band"]] = bands_c.get(a["risk_band"], 0) + 1
        return [{"risk_band": k, "n": v} for k, v in bands_c.items()]

    if "WHERE CATEGORY='HOSPITAL'" in s:
        # Distance calculation
        lon, lat = (float(args[0]), float(args[1])) if len(args) >= 2 else (82.2, 16.5)
        res = []
        for h in MOCK_INFRASTRUCTURE:
            if h["category"] == "hospital":
                dist = haversine_km(lon, lat, h.get("lon", 82.2), h.get("lat", 16.5))
                res.append({
                    "id": h["id"],
                    "name": h["name"],
                    "risk_score": h["risk_score"],
                    "risk_band": h["risk_band"],
                    "km": round(dist, 1)
                })
        return sorted(res, key=lambda x: x["km"])

    if "SELECT ID,NAME,CATEGORY,RISK_SCORE,RISK_BAND,FACTORS FROM INFRASTRUCTURE WHERE RISK_SCORE>=60" in s:
        items = [a for a in MOCK_INFRASTRUCTURE if a["risk_score"] >= 60]
        return sorted(items, key=lambda x: x["risk_score"], reverse=True)

    if "SELECT NAME,CATEGORY,RISK_SCORE,RISK_BAND FROM INFRASTRUCTURE WHERE RISK_SCORE>=60" in s:
        items = [a for a in MOCK_INFRASTRUCTURE if a["risk_score"] >= 60]
        return sorted(items, key=lambda x: x["risk_score"], reverse=True)

    if "SELECT ID,NAME,CATEGORY,RISK_SCORE,RISK_BAND FROM INFRASTRUCTURE" in s:
        return sorted(MOCK_INFRASTRUCTURE, key=lambda x: x["risk_score"], reverse=True)

    if "WHERE ID=$1" in s and "FROM INFRASTRUCTURE" in s:
        iid = args[0] if args else 1
        for a in MOCK_INFRASTRUCTURE:
            if a["id"] == iid:
                return [a]
        return [MOCK_INFRASTRUCTURE[0]]

    if "FROM ROADS WHERE FLOOD_EXPOSURE > 40" in s or "FROM ROADS WHERE BOTTLENECK" in s:
        if args and args[0] is False:
            return [r for r in MOCK_ROADS if not r["bottleneck"]]
        return [r for r in MOCK_ROADS if r["bottleneck"]]

    if "COUNT(*) FILTER" in s or "POPULATION-EXPOSURE" in s or "FROM INFRASTRUCTURE WHERE RISK_BAND IN" in s:
        high = len([x for x in MOCK_INFRASTRUCTURE if x["risk_band"] in ('High', 'Very High', 'Extreme')])
        return [{"exposed": high, "total": len(MOCK_INFRASTRUCTURE), "n": high}]

    if "SELECT ID, 'BEFORE' AS T" in s or "FROM HAZARD_ZONES" in s:
        return [
            {"id": 1, "t": "before", "g": '{"type":"MultiPolygon","coordinates":[[[[82.0, 16.0],[82.5, 16.0],[82.5, 17.0],[82.0, 17.0],[82.0, 16.0]]]]}'},
            {"id": 2, "t": "current", "g": '{"type":"MultiPolygon","coordinates":[[[[81.8, 15.8],[82.6, 15.8],[82.6, 16.8],[81.8, 16.8],[81.8, 15.8]]]]}'},
            {"id": 3, "t": "projected", "g": '{"type":"MultiPolygon","coordinates":[[[[81.0, 15.0],[83.5, 15.0],[83.5, 18.0],[81.0, 18.0],[81.0, 15.0]]]]}'}
        ]

    if "INSERT INTO SCENARIOS" in s:
        new_id = len(MOCK_SCENARIOS) + 1
        rec = {"id": new_id, "cyclone_id": args[0], "category": args[1], "rain_pct": args[2], "params": args[3]}
        MOCK_SCENARIOS.append(rec)
        return [{"id": new_id}]

    if "INSERT INTO ADVISORIES" in s:
        new_id = len(MOCK_ADVISORIES) + 1
        rec = {"id": new_id, "cyclone_id": args[0], "threat_level": args[1], "hazards": args[2], "actions": args[3], "body": args[4]}
        MOCK_ADVISORIES.append(rec)
        return [{"id": new_id}]

    if "FROM ADVISORIES" in s:
        return MOCK_ADVISORIES

    return []

def gjencode(r: Any) -> Any:
    if isinstance(r, str):
        try:
            return json.loads(r)
        except Exception:
            return r
    return r
