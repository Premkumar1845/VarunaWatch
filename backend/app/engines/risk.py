"""
Deterministic Risk Engine for VarunaWatch:
Risk = 0.30*Flood + 0.20*Rainfall + 0.15*Wind + 0.15*Surge + 0.20*Vulnerability
All factor inputs and final scores are normalized on a 0–100 scale.
"""

from typing import Tuple, Dict

W: Dict[str, float] = dict(flood=0.30, rain=0.20, wind=0.15, surge=0.15, vuln=0.20)

CRITICALITY: Dict[str, float] = {
    "hospital": 1.0,
    "substation": 1.0,
    "bridge": 0.8,
    "school": 0.5,
    "shelter": 0.2,
    "minor_road": 0.2,
    "water_tank": 0.5
}

def band(s: float) -> str:
    """Classify 0-100 score into standard Saffir/NDMA Risk Bands."""
    if s <= 20:
        return "Low"
    if s <= 40:
        return "Moderate"
    if s <= 60:
        return "High"
    if s <= 80:
        return "Very High"
    return "Extreme"

def asset_vulnerability(exposure: float, criticality: float, access_risk: float = 1.0) -> float:
    """Asset Vulnerability scaled 0–100."""
    return min(100.0, max(0.0, exposure * criticality * access_risk))

def compute_risk(flood: float, rain: float, wind: float, surge: float, vuln: float) -> Tuple[float, str]:
    """Compute weighted deterministic risk score and return (score, band)."""
    score = (
        W["flood"] * flood +
        W["rain"] * rain +
        W["wind"] * wind +
        W["surge"] * surge +
        W["vuln"] * vuln
    )
    score = max(0.0, min(100.0, score))
    return round(score, 1), band(score)
