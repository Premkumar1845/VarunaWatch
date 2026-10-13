from fastapi import APIRouter
from ..db import query

router = APIRouter(prefix="/satellite", tags=["satellite"])

@router.get("/layers")
async def layers(bbox: str = "79.5,12.5,85.5,19.5"):
    """VarunaVision: Before / Current / Projected hazard inundation polygons."""
    parts = bbox.split(",")
    if len(parts) == 4:
        try:
            w, s, e, n = map(float, parts)
        except ValueError:
            w, s, e, n = 79.5, 12.5, 85.5, 19.5
    else:
        w, s, e, n = 79.5, 12.5, 85.5, 19.5

    rows = await query(
        """SELECT id, 'before' as t, ST_AsGeoJSON(geom) g FROM hazard_zones
           UNION ALL
           SELECT id, 'current' as t, ST_AsGeoJSON(geom) g FROM hazard_zones 
           WHERE ST_Intersects(geom, ST_MakeEnvelope($1, $2, $3, $4, 4326))""",
        w, s, e, n
    )
    return rows

@router.get("/population-exposure")
async def pop_exposure():
    """Retrieve population and asset count in high-severity risk bands."""
    rows = await query(
        "SELECT count(*) filter (where risk_band in ('High','Very High','Extreme')) as exposed, count(*) as total FROM infrastructure"
    )
    return rows
