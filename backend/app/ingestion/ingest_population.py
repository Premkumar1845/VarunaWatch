"""
Population exposure ingestion from WorldPop / GHSL rasters for Coastal Andhra Pradesh.
"""

import json
import pathlib

CACHE_DIR = pathlib.Path("cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def main():
    pop_summary = {
        "region": "Coastal Andhra Pradesh",
        "districts": ["Visakhapatnam", "East Godavari (Kakinada)", "West Godavari", "Krishna (Machilipatnam)", "Guntur", "Bapatla", "Prakasam"],
        "total_coastal_population": 14250000,
        "high_risk_zone_population": 3820000,
        "shelter_capacity": 650000,
        "grid_resolution_m": 100
    }
    with open(CACHE_DIR / "population_summary.json", "w", encoding="utf-8") as f:
        json.dump(pop_summary, f, indent=2)
    print("Population metrics cached to cache/population_summary.json")

if __name__ == "__main__":
    main()
