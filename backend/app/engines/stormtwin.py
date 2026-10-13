"""
StormTwin: Digital Twin Simulation Engine.
Category 1-5 scenario deltas & parametric adjustments.
"""

from typing import Dict

MULT: Dict[int, Dict[str, float]] = {
    1: dict(wind=0.50, rain=0.60, surge=0.40),
    2: dict(wind=0.65, rain=0.75, surge=0.60),
    3: dict(wind=0.80, rain=0.90, surge=0.80),
    4: dict(wind=0.92, rain=1.00, surge=1.10),
    5: dict(wind=1.00, rain=1.15, surge=1.35)
}

def scale(cat: int, rain_pct: int, base: Dict[str, float]) -> Dict[str, float]:
    """Scale baseline hazards for Cat 1-5 and +rain_pct delta."""
    cat = max(1, min(5, cat))
    m = MULT[cat].copy()
    m_rain = m["rain"] * (1.0 + (rain_pct / 100.0))
    m["rain"] = m_rain
    
    scaled = {}
    for k, base_val in base.items():
        multiplier = m.get(k, 1.0)
        scaled[k] = round(min(100.0, max(0.0, base_val * multiplier)), 1)
    return scaled
