import json
from fastapi import APIRouter
from ..db import query
from ..services.gemini_ai import generate_advisory

router = APIRouter(prefix="/advisories", tags=["advisories"])

@router.post("/generate")
async def generate(cyclone_id: int = 1):
    """Generate plain-language explainable advisory from ground-truth backend numbers."""
    cyc_rows = await query("SELECT * FROM cyclones WHERE id=$1", cyclone_id)
    cyc = cyc_rows[0] if cyc_rows else {"id": 1, "name": "Cyclone Michaung", "category": 3}
    
    high_risk_assets = await query("SELECT name, category, risk_score, risk_band FROM infrastructure WHERE risk_score>=60 ORDER BY risk_score DESC LIMIT 10")
    affected_roads = await query("SELECT name, class, flood_exposure FROM roads WHERE bottleneck=true")
    pop_exposure = await query("SELECT count(*) n FROM infrastructure WHERE risk_band IN ('High','Very High','Extreme')")
    risk_summary = await query("SELECT risk_band, count(*) n FROM infrastructure GROUP BY risk_band")
    
    tool_results = {
        "high_risk_assets": high_risk_assets,
        "affected_roads": affected_roads,
        "population_exposure": pop_exposure[0]["n"] if pop_exposure else 5,
        "risk_summary": risk_summary,
    }
    
    body = await generate_advisory(tool_results, cyc)
    
    row = await query(
        """INSERT INTO advisories(cyclone_id, threat_level, hazards, actions, body) 
           VALUES($1, $2, $3, $4, $5) RETURNING id""",
        cyclone_id, f"Category {cyc.get('category', 3)}", json.dumps(risk_summary), json.dumps([]), body
    )
    advisory_id = row[0]["id"] if row else 1
    
    return {
        "advisory_id": advisory_id,
        "body": body,
        "tool_results": tool_results
    }

@router.get("/history")
async def history():
    """Retrieve historical drafted operational advisories."""
    rows = await query("SELECT id, threat_level, body, source, created_at FROM advisories ORDER BY created_at DESC")
    return rows
