"""
Hazard Engine: Physical sensors/rasters/weather feeds -> per-asset hazard exposures (0-100).
"""

def exposure_from_rainfall(mm_24h: float) -> float:
    """200mm in 24h corresponds to 100% hazard exposure."""
    return min(100.0, max(0.0, mm_24h / 2.0))

def exposure_from_wind(kph: float) -> float:
    """Wind exposure triggered at 30 kph, saturates at 180 kph."""
    return min(100.0, max(0.0, (kph - 30.0) * 100.0 / 150.0))

def exposure_from_flood_depth(m: float) -> float:
    """2.0m inundation depth reaches 100% flood hazard."""
    return min(100.0, max(0.0, m / 2.0 * 100.0))

def exposure_from_surge(m: float) -> float:
    """3.0m tidal surge reaches 100% surge hazard."""
    return min(100.0, max(0.0, m / 3.0 * 100.0))

def trigger(wind_kph: float, rain_mm: float) -> bool:
    """Parametric alert activation threshold."""
    return wind_kph >= 30.0 or rain_mm >= 100.0
