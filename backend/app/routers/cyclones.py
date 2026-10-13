from fastapi import APIRouter
from ..db import query

router = APIRouter(prefix="/cyclones", tags=["cyclones"])

@router.get("/current")
async def current():
    """Retrieve currently active cyclone track & real-time telemetry."""
    rows = await query(
        "SELECT id, name, category, status, wind_kph, pressure_hpa, track FROM cyclones WHERE status='active' ORDER BY updated_at DESC LIMIT 1"
    )
    return rows

@router.get("/{cid}/forecast")
async def forecast(cid: int):
    """Retrieve hazard forecast zones for the active cyclone."""
    rows = await query("SELECT * FROM hazard_zones WHERE cyclone_id=$1", cid)
    return rows

@router.get("/risk-summary")
async def risk_summary():
    """Aggregate high-level risk band distribution across all regional infrastructure."""
    rows = await query("SELECT risk_band, count(*) n, avg(risk_score) avg_score FROM infrastructure GROUP BY risk_band")
    return rows
