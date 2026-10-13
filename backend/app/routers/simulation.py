from fastapi import APIRouter
from pydantic import BaseModel, Field
from ..engines import stormtwin, risk as risk_mod
from ..db import query

router = APIRouter(prefix="/simulation", tags=["simulation"])

class SimReq(BaseModel):
    cyclone_id: int = Field(default=1, description="Target cyclone ID")
    category: int = Field(default=3, ge=1, le=5, description="Category 1-5")
    rain_pct: int = Field(default=0, ge=0, le=100, description="Additional rainfall percentage")

@router.post("/analyze")
async def analyze(req: SimReq):
    """Deterministic StormTwin digital twin simulation: scales hazard deltas & recomputes asset risk."""
    base = await query("SELECT wind_kph, pressure_hpa FROM cyclones WHERE id=$1", req.cyclone_id)
    base_wind = float(base[0]["wind_kph"]) if base and base[0].get("wind_kph") else 165.0
    
    # Scale baseline hazards deterministically
    base_hazards = {"flood": 50.0, "rain": 60.0, "wind": base_wind * 0.5, "surge": 45.0, "vuln": 55.0}
    scaled = stormtwin.scale(req.category, req.rain_pct, base_hazards)
    
    score, band = risk_mod.compute_risk(**scaled)
    assets = await query("SELECT id, name, category, risk_score, risk_band FROM infrastructure ORDER BY risk_score DESC LIMIT 50")
    
    import json
    sid = await query(
        "INSERT INTO scenarios(cyclone_id, category, rain_pct, params) VALUES($1, $2, $3, $4) RETURNING id",
        req.cyclone_id, req.category, req.rain_pct, json.dumps(scaled)
    )
    scenario_id = sid[0]["id"] if sid else 1
    
    return {
        "scenario_id": scenario_id,
        "hazards": scaled,
        "impact_score": score,
        "band": band,
        "top_assets": assets[:10]
    }

@router.post("/ai/satellite")
async def ai_satellite(req: SimReq):
    """Synthesize simulation results into an AI-narrated situational brief."""
    from ..services.gemini_ai import generate_advisory
    res = await analyze(req)
    explanation = await generate_advisory(res, {"name": f"StormTwin Cat {req.category}", "category": req.category})
    return {"explanation": explanation, "simulation_results": res}
