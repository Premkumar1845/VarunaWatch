"""
VarunaWatch Backend — API Routes
All endpoints with typed request/response contracts and multi-state coastal filtering
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.schemas import (
    SimulationRequest, AIAnalyzeRequest, AdvisoryRequest, ReportRequest
)
from services.demo_data import (
    get_demo_cyclone, get_demo_track, get_demo_forecast_cone,
    get_demo_rainfall_forecast, get_demo_wind_forecast,
    get_demo_hazard_zones, get_demo_infrastructure, get_demo_roads,
    get_demo_risk_summary, simulate_scenario, get_trigger_status,
    get_demo_alerts
)
from services.gemini_service import (
    chat_with_gemini, generate_advisory, generate_report
)

router = APIRouter()


# ==================== CYCLONE ====================

@router.get("/cyclone/current")
async def cyclone_current(state: Optional[str] = Query(None, description="State ID e.g. ap, od, wb, tn, mh, gj, kl, ka, ga, ut, all")):
    """Get current cyclone status for a specific state or national basin."""
    return get_demo_cyclone(state_id=state)


@router.get("/cyclone/forecast")
async def cyclone_forecast(state: Optional[str] = Query(None, description="State ID")):
    """Get cyclone forecast with track, cone, and weather predictions."""
    cyclone = get_demo_cyclone(state_id=state)
    return {
        "cyclone": cyclone,
        "track": get_demo_track(state_id=state),
        "forecast_cone": get_demo_forecast_cone(state_id=state),
        "landfall_estimate": cyclone.get("position", {"lat": 16.7, "lng": 82.5}),
        "rainfall_forecast": get_demo_rainfall_forecast(state_id=state),
        "wind_forecast": get_demo_wind_forecast(state_id=state),
    }


# ==================== HAZARDS ====================

@router.get("/hazards")
async def hazards_list(
    min_risk: Optional[float] = Query(None, ge=0, le=100),
    category: Optional[int] = Query(None, ge=1, le=5),
    state: Optional[str] = Query(None, description="State ID e.g. ap, od, tn, mh, gj, wb, kl, ka, ga, ut, all"),
):
    """Get all hazard zones with risk scores, filtered optionally by state."""
    cat = category or 3
    zones = get_demo_hazard_zones(cat, state_id=state)
    if min_risk is not None:
        zones = [z for z in zones if z["risk_score"] >= min_risk]
    return {
        "total_zones": len(zones),
        "zones": zones,
    }


@router.get("/hazards/{zone_id}")
async def hazard_detail(zone_id: str):
    """Get detailed hazard data for a specific zone."""
    zones = get_demo_hazard_zones()
    zone = next((z for z in zones if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Get infrastructure in this zone
    infra = [a for a in get_demo_infrastructure() if a.get("zone_id") == zone_id]
    roads = [r for r in get_demo_roads() if r.get("zone_id") == zone_id]

    return {
        **zone,
        "infrastructure": infra,
        "roads": roads,
    }


# ==================== INFRASTRUCTURE ====================

@router.get("/infrastructure")
async def infrastructure_list(
    asset_type: Optional[str] = None,
    min_risk: Optional[float] = Query(None, ge=0, le=100),
    zone_id: Optional[str] = None,
    category: Optional[int] = Query(None, ge=1, le=5),
    state: Optional[str] = Query(None, description="State ID e.g. ap, od, tn, mh, gj, wb, kl, ka, ga, ut, all"),
):
    """Get infrastructure assets with vulnerability scores across all coastal states."""
    cat = category or 3
    assets = get_demo_infrastructure(cat, state_id=state)

    if asset_type:
        assets = [a for a in assets if a["type"] == asset_type]
    if min_risk is not None:
        assets = [a for a in assets if a["vulnerability_score"] >= min_risk]
    if zone_id:
        assets = [a for a in assets if a["zone_id"] == zone_id]

    hospitals = [a for a in assets if a["type"] == "hospital"]
    power = [a for a in assets if a["type"] == "power"]
    shelters = [a for a in assets if a["type"] == "shelter"]
    bridges = [a for a in assets if a["type"] == "bridge"]

    return {
        "total_assets": len(assets),
        "critical_assets": sum(1 for a in assets if a["vulnerability_score"] >= 60),
        "high_risk_assets": sum(1 for a in assets if a["vulnerability_score"] >= 40),
        "hospitals": len(hospitals),
        "hospitals_at_risk": sum(1 for h in hospitals if h["vulnerability_score"] >= 50),
        "power_assets": len(power),
        "power_at_risk": sum(1 for p in power if p["vulnerability_score"] >= 50),
        "shelters": len(shelters),
        "shelters_at_risk": sum(1 for s in shelters if s["vulnerability_score"] >= 50),
        "bridges": len(bridges),
        "bridges_at_risk": sum(1 for b in bridges if b["vulnerability_score"] >= 50),
        "assets": assets,
    }


@router.get("/infrastructure/{asset_id}")
async def infrastructure_detail(asset_id: str):
    """Get detailed data for a specific infrastructure asset."""
    assets = get_demo_infrastructure()
    asset = next((a for a in assets if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


# ==================== ROADS ====================

@router.get("/roads/affected")
async def roads_affected(
    min_risk: Optional[float] = Query(None, ge=0, le=100),
    category: Optional[int] = Query(None, ge=1, le=5),
    state: Optional[str] = Query(None, description="State ID e.g. ap, od, tn, mh, gj, wb, kl, ka, ga, ut, all"),
):
    """Get affected road segments for a state or pan-India."""
    cat = category or 3
    roads = get_demo_roads(cat, state_id=state)
    if min_risk is not None:
        roads = [r for r in roads if r["risk_score"] >= min_risk]

    total_km = sum(r["length_km"] for r in roads)
    affected_km = sum(r["length_km"] for r in roads if r["risk_score"] >= 40)

    return {
        "total_road_km": total_km,
        "affected_road_km": affected_km,
        "critical_segments": sum(1 for r in roads if r["risk_score"] >= 60),
        "blocked_segments": sum(1 for r in roads if r["accessibility"] == "Likely Blocked"),
        "segments": roads,
    }


# ==================== RISK SUMMARY ====================

@router.get("/risk/summary")
async def risk_summary(
    category: Optional[int] = Query(None, ge=1, le=5),
    state: Optional[str] = Query(None, description="State ID e.g. ap, od, tn, mh, gj, wb, kl, ka, ga, ut, all")
):
    """Get overall risk summary for state or pan-India."""
    cat = category or 3
    return get_demo_risk_summary(cat, state_id=state)


# ==================== SIMULATION (StormTwin) ====================

@router.post("/simulation")
async def run_simulation(
    request: SimulationRequest,
    state: Optional[str] = Query(None, description="State ID")
):
    """Run a StormTwin scenario simulation for a specific state or national grid."""
    return simulate_scenario(request.category, request.rainfall_multiplier, state_id=state)


@router.get("/simulation/compare")
async def compare_scenarios(state: Optional[str] = Query(None, description="State ID")):
    """Compare all 5 category scenarios for a state or national grid."""
    scenarios = []
    for cat in range(1, 6):
        scenarios.append(simulate_scenario(cat, state_id=state))
    return {"scenarios": scenarios}


# ==================== TRIGGERWATCH ====================

@router.get("/trigger/status")
async def trigger_watch(state: Optional[str] = Query(None, description="State ID")):
    """Get TriggerWatch threshold monitoring status."""
    return get_trigger_status(state_id=state)


# ==================== ALERTS & DISPATCH ====================

@router.get("/alerts")
async def alerts_list(state: Optional[str] = Query(None, description="State ID")):
    """Get current alerts."""
    return {"alerts": get_demo_alerts(state_id=state)}


@router.post("/alerts/dispatch-call")
async def dispatch_alert_call():
    """Trigger automated Twilio voice call to emergency coordinator."""
    from services.twilio_service import dispatch_emergency_call
    result = await dispatch_emergency_call()
    return result


# ==================== AI (Gemini) ====================

@router.post("/ai/analyze")
async def ai_analyze(request: AIAnalyzeRequest):
    """Chat with Varuna AI — processes message with multi-state coastal context."""
    result = await chat_with_gemini(
        message=request.message,
        history=request.history,
        context=request.context,
    )
    return result


@router.post("/ai/advisory")
async def ai_advisory(request: AdvisoryRequest):
    """Generate a formal cyclone advisory for any Indian coastal corridor."""
    return await generate_advisory(request.threat_level, request.focus_area)


@router.post("/ai/report")
async def ai_report(request: ReportRequest):
    """Generate a comprehensive response plan."""
    return await generate_report(request.include_sections)
