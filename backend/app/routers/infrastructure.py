from fastapi import APIRouter
from ..db import query

router = APIRouter(prefix="/infrastructure", tags=["infrastructure"])

@router.get("/high-risk-assets")
async def high_risk():
    """Retrieve top high-risk assets sorted by deterministic composite score."""
    rows = await query("SELECT id, name, category, risk_score, risk_band, factors, status FROM infrastructure WHERE risk_score>=60 ORDER BY risk_score DESC")
    return rows

@router.get("/all")
async def all_assets():
    """Retrieve all monitored critical assets."""
    rows = await query("SELECT id, name, category, risk_score, risk_band, factors, status, ST_AsGeoJSON(geom) geom FROM infrastructure ORDER BY risk_score DESC")
    return rows

@router.get("/roads/affected")
async def roads():
    """Retrieve roads with flood exposure over 40% threshold."""
    rows = await query("SELECT id, name, class, flood_exposure, bottleneck, ST_AsGeoJSON(geom) geom FROM roads WHERE flood_exposure > 40")
    return rows

@router.get("/roads/trigger/{status}")
async def trigger(status: str):
    """Retrieve road segments filtered by bottleneck trigger status."""
    is_bottleneck = (status.lower() == "true")
    rows = await query("SELECT * FROM roads WHERE bottleneck=$1", is_bottleneck)
    return rows

@router.get("/nearby-hospitals")
async def hospitals(lon: float = 82.2, lat: float = 16.5, km: float = 50.0):
    """Spatial proximity search for hospitals within radius."""
    rows = await query(
        """SELECT id, name, risk_score, risk_band, 
           ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)/1000 as km 
           FROM infrastructure 
           WHERE category='hospital' 
           AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3*1000) 
           ORDER BY km""",
        lon, lat, km
    )
    return rows

@router.get("/{iid}")
async def get_one(iid: int):
    """Drilldown endpoint for specific asset factors and location."""
    rows = await query("SELECT id, name, category, risk_score, risk_band, factors, status, ST_AsGeoJSON(geom) geom FROM infrastructure WHERE id=$1", iid)
    return rows[0] if rows else {}
