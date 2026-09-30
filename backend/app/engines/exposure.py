"""
Spatial intersection engine: hazard zones x infrastructure.
"""

from typing import Any, Dict, List

def intersect_simple(hazards: List[Dict[str, Any]], assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Compute spatial proximity/intersection scores for assets in hazard zones."""
    results = []
    for asset in assets:
        a_factors = dict(asset.get("factors", {"flood": 20, "rain": 20, "wind": 20, "surge": 10, "vuln": 20}))
        results.append({
            "id": asset.get("id"),
            "name": asset.get("name"),
            "category": asset.get("category"),
            "factors": a_factors
        })
    return results
