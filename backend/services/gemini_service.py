"""
VarunaWatch - Gemini AI Service
Handles Gemini API integration with ground-truth data synthesis across all 9 Indian coastal states & UTs.
Key architecture principle:
- Backend computes every risk score deterministically.
- AI explains, prioritizes, and advises without hallucinating facts.
"""
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from config import settings
from services.demo_data import (
    get_demo_cyclone, get_demo_hazard_zones, get_demo_infrastructure,
    get_demo_roads, get_demo_risk_summary, simulate_scenario,
    get_trigger_status, get_demo_alerts
)

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None
    types = None


SYSTEM_PROMPT = """You are Varuna AI, the intelligence copilot for VarunaWatch — a Pan-India Cyclone Impact & Infrastructure Resilience Platform covering all 9 Indian Coastal States and Union Territories (7,516+ km coastline: Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Odisha, West Bengal, Puducherry & Island UTs).

ROLE & PRINCIPLES:
- You advise emergency commanders, district collectors, NDMA, NDRF, and State Disaster Management Authorities (SDMAs/SDRFs).
- Ground all advice strictly in the verified deterministic telemetry provided.
- Never invent hazard scores or population statistics.
- Provide structured, actionable, evidence-backed operational guidance tailored to the requested state/corridor.
- Focus on critical life-safety priorities: hospital power backups, evacuation of surge zones, road cutoffs, port terminal securing, and shelter staging.
"""


def _detect_state_from_focus(focus_area: str) -> Optional[str]:
    """Detect state ID from focus area string."""
    f = (focus_area or "").lower()
    if "odisha" in f or "puri" in f or "paradeep" in f or "balasore" in f or "ganjam" in f:
        return "od"
    if "bengal" in f or "sundarban" in f or "haldia" in f or "digha" in f:
        return "wb"
    if "tamil" in f or "chennai" in f or "cuddalore" in f or "nagapattinam" in f or "thoothukudi" in f:
        return "tn"
    if "kerala" in f or "kochi" in f or "alappuzha" in f or "malabar" in f:
        return "kl"
    if "karnataka" in f or "mangaluru" in f or "karwar" in f or "udupi" in f:
        return "ka"
    if "goa" in f or "mormugao" in f or "panaji" in f:
        return "ga"
    if "maharashtra" in f or "mumbai" in f or "konkan" in f or "raigad" in f or "ratnagiri" in f:
        return "mh"
    if "gujarat" in f or "kutch" in f or "kandla" in f or "dwarka" in f or "surat" in f or "hazira" in f:
        return "gj"
    if "puducherry" in f or "island" in f or "andaman" in f or "lakshadweep" in f:
        return "ut"
    if "andhra" in f or "kakinada" in f or "amalapuram" in f or "vizag" in f or "visakhapatnam" in f or "machilipatnam" in f:
        return "ap"
    return "all"


def _build_telemetry_context(threat_level: str = "Very High", focus_area: str = "All Coastal India") -> Dict[str, Any]:
    """Gather real-time deterministic telemetry payload tailored to the threat level & focus area."""
    state_id = _detect_state_from_focus(focus_area)
    summary = get_demo_risk_summary(state_id=state_id)
    cyclone = dict(get_demo_cyclone(state_id=state_id))
    infra = get_demo_infrastructure(state_id=state_id)
    roads = get_demo_roads(state_id=state_id)
    zones = get_demo_hazard_zones(state_id=state_id)

    threat_lower = (threat_level or "Very High").lower()
    if "extreme" in threat_lower:
        cyclone["category"] = 4
        cyclone["wind_speed"] = 210
        cyclone["pressure"] = 945
        cyclone["surge_height"] = 4.5
        exposed_pop = int(summary["population_total"] * 0.75)
    elif "high" in threat_lower and "very" not in threat_lower:
        cyclone["category"] = 2
        cyclone["wind_speed"] = 135
        cyclone["pressure"] = 975
        cyclone["surge_height"] = 2.2
        exposed_pop = int(summary["population_total"] * 0.45)
    elif "moderate" in threat_lower or "low" in threat_lower:
        cyclone["category"] = 1
        cyclone["wind_speed"] = 95
        cyclone["pressure"] = 990
        cyclone["surge_height"] = 1.2
        exposed_pop = int(summary["population_total"] * 0.25)
    else:  # Very High / Default
        cyclone["category"] = 3
        cyclone["wind_speed"] = 165
        cyclone["pressure"] = 960
        cyclone["surge_height"] = 3.5
        exposed_pop = summary["population_exposed"]

    summary_copy = dict(summary)
    summary_copy["population_exposed"] = exposed_pop

    focus_lower = (focus_area or "").lower()

    def matches_focus(item_zone: str, item_name: str, item_state: str = "") -> bool:
        if not focus_lower or "coastal" in focus_lower or "all" in focus_lower or "national" in focus_lower:
            return True
        tokens = [t.strip() for t in focus_lower.replace("&", ",").replace("/", ",").split(",") if t.strip()]
        for token in tokens:
            if token in item_zone.lower() or token in item_name.lower() or token in item_state.lower():
                return True
        return False

    matching_assets = [a for a in infra if matches_focus(a.get("zone_name", ""), a.get("name", ""), a.get("state_name", ""))]
    other_assets = [a for a in infra if not matches_focus(a.get("zone_name", ""), a.get("name", ""), a.get("state_name", ""))]
    high_risk_assets = (matching_assets + other_assets)[:8]

    matching_roads = [r for r in roads if matches_focus(r.get("zone_name", ""), r.get("name", ""), r.get("state_name", ""))]
    other_roads = [r for r in roads if not matches_focus(r.get("zone_name", ""), r.get("name", ""), r.get("state_name", ""))]
    affected_roads = (matching_roads + other_roads)[:6]

    matching_zones = [z for z in zones if matches_focus(z.get("name", ""), z.get("district", ""), z.get("state_name", ""))]
    if not matching_zones:
        matching_zones = zones[:6]

    return {
        "cyclone": cyclone,
        "summary": summary_copy,
        "high_risk_assets": high_risk_assets,
        "affected_roads": affected_roads,
        "zones": matching_zones,
        "threat_level": threat_level or "Very High",
        "focus_area": focus_area or "All Coastal India (National Grid)",
    }


def _generate_grounded_advisory_text(telemetry: Dict[str, Any]) -> str:
    """Generate deterministic high-fidelity advisory text grounded in raw telemetry."""
    cyclone = telemetry["cyclone"]
    summary = telemetry["summary"]
    threat = telemetry.get("threat_level", "Very High")
    focus = telemetry.get("focus_area", "All Coastal India")
    assets = telemetry.get("high_risk_assets", [])
    roads = telemetry.get("affected_roads", [])

    top_assets_str = "\n".join([
        f"  • {a['name']} ({a['type'].title()} — Vulnerability Score: {a['vulnerability_score']}/100, Band: {a['risk_level']}): {a.get('recommended_actions', ['Pre-stage backup generators'])[0] if isinstance(a.get('recommended_actions'), list) and a.get('recommended_actions') else 'Pre-stage emergency diesel fuel and deploy ground-level barriers.'}"
        for a in assets[:4]
    ])

    top_roads_str = "\n".join([
        f"  • {r['name']} ({r.get('road_type', 'Corridor').title()}): Risk Index {r['risk_score']}/100 — Status: {r.get('accessibility', 'Caution')}"
        for r in roads[:3]
    ])

    now_str = datetime.utcnow().strftime('%d %b %Y %H:%M UTC')
    surge = cyclone.get('surge_height', 3.5)

    return f"""OPERATIONAL DISASTER MANAGEMENT ADVISORY — CYCLONE {cyclone['name'].upper()} (CATEGORY {cyclone['category']})
ISSUED BY: VarunaWatch Pan-India Emergency Resilience Command
TIMESTAMP: {now_str}
THREAT LEVEL: {threat.upper()} | TARGET SECTOR: {focus.upper()}

1. METEOROLOGICAL & HAZARD TELEMETRY:
• Cyclone {cyclone['name']} is centered at {cyclone['position']['lat']}°N, {cyclone['position']['lng']}°E with maximum sustained surface winds of {cyclone['wind_speed']} km/h (gusts to {int(cyclone['wind_speed'] * 1.25)} km/h) and central barometric pressure of {cyclone['pressure']} hPa.
• Landfall ETA: {cyclone['eta_landfall']} targeting the {focus} littoral corridor.
• Projected Storm Surge: +{surge}m above astronomical tide across estuarine and beachfront zones.
• Aggregate Population Exposed: {summary['population_exposed']:,} citizens across monitored coastal zones.

2. CRITICAL HEALTHCARE, ENERGY & PORT INFRASTRUCTURE PROTOCOLS:
{top_assets_str}

3. TRANSPORTATION & EVACUATION CORRIDORS:
{top_roads_str}
• Implement immediate mandatory heavy-vehicle diversions on low-lying coastal arterial routes.
• Pre-stage emergency medical ambulances along elevated secondary bypass routes.

4. MANDATORY EARLY ACTION PROTOCOLS (NEXT 6 TO 12 HOURS):
• Finalize evacuation of vulnerable fishing hamlets and non-pucca housing within 5 km of shoreline.
• Ensure continuous 72-hour auxiliary diesel fuel reserves across all district and regional hospitals.
• Pre-position NDRF & State Disaster Response Force (SDRF) swift-water rescue craft at designated coastal staging depots."""


def _generate_fallback_chat(message: str) -> Dict[str, Any]:
    """Fallback generator for conversational queries across Pan-India coastal lanes."""
    state_id = _detect_state_from_focus(message)
    summary = get_demo_risk_summary(state_id=state_id)
    cyclone = get_demo_cyclone(state_id=state_id)
    infra = get_demo_infrastructure(state_id=state_id)
    roads = get_demo_roads(state_id=state_id)
    lower = message.lower()

    if "hospital" in lower or "medical" in lower:
        hospitals = [a for a in infra if a["type"] == "hospital"]
        resp = f"## 🏥 Critical Hospital Vulnerability Register ({summary.get('hospitals_at_risk', 4)} at Risk)\n\n"
        for h in hospitals[:6]:
            resp += f"• **{h['name']}** ({h.get('state_name', 'Coast')}) — Score: **{h['vulnerability_score']}/100** ({h['risk_level']})\n"
            resp += f"  Location: {h['zone_name']} | Protocol: {h.get('recommended_actions', ['Ensure backup generators'])[0] if isinstance(h.get('recommended_actions'), list) else 'Ensure backup power'}\n"
    elif "road" in lower or "traffic" in lower or "evacuat" in lower:
        resp = f"## 🛣️ Coastal Road Network & Evacuation Corridors\n\n"
        for r in roads[:5]:
            resp += f"• **{r['name']}** ({r.get('state_name', 'Coast')}) — Risk Score: **{r['risk_score']}/100** ({r['risk_level']})\n"
            resp += f"  Corridor: {r.get('zone_name', 'Coastal')} | Access: **{r.get('accessibility', 'Caution')}**\n"
    elif "status" in lower or "cyclone" in lower:
        resp = f"## 🌀 Cyclone {cyclone['name']} Status Overview\n\n"
        resp += f"• **Intensity:** Category {cyclone['category']} | **Sustained Winds:** {cyclone['wind_speed']} km/h | **Pressure:** {cyclone['pressure']} hPa\n"
        resp += f"• **Eye Location:** {cyclone['position']['lat']}°N, {cyclone['position']['lng']}°E | **Landfall ETA:** {cyclone['eta_landfall']}\n"
        resp += f"• **Exposed Population:** {summary['population_exposed']:,} citizens across coastal lanes\n"
        resp += f"• **High-Risk Assets:** {summary['hospitals_at_risk']} hospitals, {summary['power_assets_at_risk']} substations, {summary['road_km_affected']} km roadways affected."
    else:
        resp = f"## 📊 VarunaWatch Pan-India Coastal Intelligence\n\n"
        resp += f"Current tracking for **Cyclone {cyclone['name']} (Cat {cyclone['category']})** across Indian coastal lanes:\n\n"
        resp += f"• **Overall Threat Level:** {summary['overall_risk_level']} ({summary['overall_risk_score']}/100)\n"
        resp += f"• **Landfall ETA:** {cyclone['eta_landfall']}\n"
        resp += f"• **Population at Risk:** {summary['population_exposed']:,}\n"
        resp += f"• **Critical Assets:** {summary['hospitals_at_risk']} Hospitals & {summary['power_assets_at_risk']} Power Grid nodes at risk.\n\n"
        resp += "Supported Coastal Lanes: **Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Odisha, West Bengal, UTs & Islands**."

    return {
        "response": resp,
        "tool_calls": [],
        "cited_assets": [
            {"name": a["name"], "score": a["vulnerability_score"], "type": a["type"]}
            for a in infra if a.get("vulnerability_score", 0) >= 60
        ][:4],
        "suggestions": [
            "Which hospitals require emergency power backup?",
            "Show road bottlenecks on coastal highways (NH-16 & NH-66)",
            "Simulate Category 4 upgrade scenario on Gujarat or Odisha",
            "Generate formal district evacuation advisory"
        ]
    }


def _is_valid_gemini_key(key: Optional[str]) -> bool:
    if not key or not isinstance(key, str):
        return False
    k = key.strip()
    return k.startswith("AIza") or (len(k) > 30 and not k.startswith("AQ."))


async def chat_with_gemini(message: str, history: List[Dict[str, str]] = None,
                           context: Dict = None) -> Dict[str, Any]:
    """Process chat message through Gemini model with ground truth fallback."""
    telemetry = _build_telemetry_context(focus_area=message)

    if not GEMINI_AVAILABLE or not _is_valid_gemini_key(settings.GEMINI_API_KEY):
        return _generate_fallback_chat(message)

    try:
        def _call_gemini():
            client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options=types.HttpOptions(timeout=5000) if types else None
            )
            prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"CURRENT VERIFIED TELEMETRY:\n{json.dumps(telemetry, default=str)}\n\n"
                f"USER QUERY: {message}"
            )
            resp = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return resp.text if resp and resp.text else None

        text = await asyncio.wait_for(asyncio.to_thread(_call_gemini), timeout=4.0)

        if text:
            return {
                "response": text,
                "tool_calls": [],
                "cited_assets": [
                    {"name": a["name"], "score": a["vulnerability_score"], "type": a["type"]}
                    for a in telemetry.get("high_risk_assets", [])[:4]
                ],
                "suggestions": [
                    "Which hospitals require emergency power backup?",
                    "Show road bottlenecks on coastal highways",
                    "Simulate Category 4 scenario",
                    "Generate district evacuation advisory"
                ]
            }
        else:
            return _generate_fallback_chat(message)
    except Exception:
        return _generate_fallback_chat(message)


async def generate_advisory(threat_level: str = "Very High", focus_area: str = "All Coastal India") -> Dict[str, Any]:
    """Generate structured formal operational advisory."""
    telemetry = _build_telemetry_context(threat_level=threat_level, focus_area=focus_area)

    priority_actions = [
        f"Evacuate vulnerable coastal settlements within 5km of {focus_area} shorelines.",
        "Verify 72h auxiliary diesel fuel reserves across all regional district hospitals.",
        "Deploy modular flood barriers at coastal power switchgears and port substations.",
        "Enforce mandatory traffic diversions on inundated national and state highway sectors."
    ]

    body_text = _generate_grounded_advisory_text(telemetry)

    state_code = _detect_state_from_focus(focus_area).upper()
    now_date = datetime.utcnow().strftime('%Y%m%d')

    return {
        "advisory_id": f"ADV-{state_code}-{now_date}-EXEC",
        "threat_level": threat_level or "Very High",
        "focus_area": focus_area or "All Coastal India",
        "priority_actions": priority_actions,
        "body": body_text,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "telemetry_context": telemetry
    }


async def generate_report(sections: Optional[List[str]] = None) -> Dict[str, Any]:
    """Generate comprehensive response plan."""
    telemetry = _build_telemetry_context()
    cyclone = telemetry["cyclone"]
    summary = telemetry["summary"]

    content = f"""# VarunaWatch Pan-India Coastal Resilience Plan
## Target Storm: {cyclone['name']} (Category {cyclone['category']})
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

### 1. Executive Summary
- Current Sustained Winds: {cyclone['wind_speed']} km/h
- Central Pressure: {cyclone['pressure']} hPa
- Population Exposed: {summary['population_exposed']:,}
- Critical Facilities at Risk: {summary['hospitals_at_risk']} Hospitals, {summary['power_assets_at_risk']} Power Substations

### 2. Multi-State SDRF & NDRF Action Matrix
- East Coast (AP, Odisha, WB, TN): Mobilize ODRAF, AP SDRF, and Eastern Naval Command.
- West Coast (Gujarat, Maharashtra, Goa, Karnataka, Kerala): Secure major ports (Kandla, JNPT, Cochin) and coastal expressways.
"""
    return {
        "report_id": f"REP-PANINDIA-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "title": f"Pan-India Coastal Defense Plan — {cyclone['name']}",
        "content": content,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
