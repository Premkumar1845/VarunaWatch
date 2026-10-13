"""
VarunaWatch Backend - Pydantic Models
Typed contracts for all API request/response shapes
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# --- Enums ---

class RiskLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"
    EXTREME = "Extreme"


class AssetType(str, Enum):
    HOSPITAL = "hospital"
    POWER = "power"
    ROAD = "road"
    SHELTER = "shelter"
    BRIDGE = "bridge"


class CycloneCategory(int, Enum):
    CAT1 = 1
    CAT2 = 2
    CAT3 = 3
    CAT4 = 4
    CAT5 = 5


class TriggerStatus(str, Enum):
    CLEAR = "Clear"
    WATCH = "Watch"
    LIKELY_TRIGGER = "Likely Trigger"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EXTREME = "extreme"


# --- Geospatial ---

class Coordinate(BaseModel):
    lat: float
    lng: float


class BoundingBox(BaseModel):
    north: float
    south: float
    east: float
    west: float


# --- Cyclone ---

class CycloneStatus(BaseModel):
    id: str
    name: str
    category: int
    wind_speed: float = Field(description="Wind speed in km/h")
    pressure: float = Field(description="Pressure in hPa")
    position: Coordinate
    direction: str
    speed_of_movement: float = Field(description="Movement speed in km/h")
    eta_landfall: Optional[str] = None
    timestamp: str
    status: str = "Active"


class TrackPoint(BaseModel):
    position: Coordinate
    timestamp: str
    wind_speed: float
    pressure: float
    category: int
    is_forecast: bool = False


class CycloneForecast(BaseModel):
    cyclone: CycloneStatus
    track: List[TrackPoint]
    forecast_cone: List[List[float]] = Field(description="GeoJSON polygon coords")
    landfall_estimate: Optional[Coordinate] = None
    rainfall_forecast: List[Dict[str, Any]] = []
    wind_forecast: List[Dict[str, Any]] = []


# --- Hazards ---

class HazardZone(BaseModel):
    id: str
    name: str
    zone_type: str = "district"
    geometry: Dict[str, Any] = Field(description="GeoJSON geometry")
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    flood_score: float = Field(ge=0, le=100)
    rainfall_score: float = Field(ge=0, le=100)
    wind_score: float = Field(ge=0, le=100)
    surge_score: float = Field(ge=0, le=100)
    vulnerability_score: float = Field(ge=0, le=100)
    population: int = 0
    area_sq_km: float = 0


class HazardSummary(BaseModel):
    total_zones: int
    extreme_zones: int
    very_high_zones: int
    high_zones: int
    moderate_zones: int
    low_zones: int
    total_population_exposed: int
    zones: List[HazardZone]


# --- Infrastructure ---

class RiskFactors(BaseModel):
    flood_exposure: float = Field(ge=0, le=100)
    wind_exposure: float = Field(ge=0, le=100)
    surge_exposure: float = Field(ge=0, le=100)
    accessibility_risk: float = Field(ge=0, le=100)
    criticality: float = Field(ge=0, le=1.0)


class InfrastructureAsset(BaseModel):
    id: str
    name: str
    type: AssetType
    position: Coordinate
    zone_id: str
    zone_name: str
    vulnerability_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    status: str = "Operational"
    criticality: float = Field(ge=0, le=1.0)
    capacity: Optional[int] = None
    factors: RiskFactors
    recommended_actions: List[str] = []


class InfrastructureSummary(BaseModel):
    total_assets: int
    critical_assets: int
    high_risk_assets: int
    hospitals: int
    hospitals_at_risk: int
    power_assets: int
    power_at_risk: int
    shelters: int
    shelters_at_risk: int
    bridges: int
    bridges_at_risk: int
    assets: List[InfrastructureAsset]


# --- Roads ---

class RoadSegment(BaseModel):
    id: str
    name: str
    road_type: str
    geometry: Dict[str, Any]
    length_km: float
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    accessibility: str = "Open"
    zone_id: str
    zone_name: str
    factors: Dict[str, float] = {}


class RoadsSummary(BaseModel):
    total_road_km: float
    affected_road_km: float
    critical_segments: int
    blocked_segments: int
    segments: List[RoadSegment]


# --- Risk Summary ---

class RiskSummaryResponse(BaseModel):
    overall_risk_score: float
    overall_risk_level: RiskLevel
    population_exposed: int
    hospitals_at_risk: int
    road_km_affected: float
    power_assets_at_risk: int
    shelters_available: int
    shelters_at_risk: int
    top_risks: List[Dict[str, Any]]
    zone_breakdown: List[Dict[str, Any]]


# --- Simulation (StormTwin) ---

class SimulationRequest(BaseModel):
    category: int = Field(ge=1, le=5, description="Cyclone category 1-5")
    rainfall_multiplier: float = Field(ge=0.5, le=3.0, default=1.0)


class SimulationResult(BaseModel):
    category: int
    rainfall_multiplier: float
    wind_speed: float
    rainfall_mm: float
    surge_height: float
    population_exposed: int
    hospitals_at_risk: int
    road_km_affected: float
    power_assets_at_risk: int
    shelters_at_risk: int
    overall_risk_score: float
    risk_level: RiskLevel
    zone_impacts: List[Dict[str, Any]]
    delta_from_current: Dict[str, Any] = {}


class ScenarioComparison(BaseModel):
    scenarios: List[SimulationResult]


# --- TriggerWatch ---

class TriggerThreshold(BaseModel):
    parameter: str
    threshold_value: float
    forecast_value: float
    unit: str
    status: TriggerStatus
    confidence: float = Field(ge=0, le=1.0)


class TriggerWatchResponse(BaseModel):
    overall_status: TriggerStatus
    thresholds: List[TriggerThreshold]
    last_updated: str


# --- AI ---

class AIAnalyzeRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    context: Optional[Dict[str, Any]] = None


class AIAnalyzeResponse(BaseModel):
    response: str
    tool_calls: List[Dict[str, Any]] = []
    cited_assets: List[Dict[str, Any]] = []
    suggestions: List[str] = []


class AdvisoryRequest(BaseModel):
    threat_level: Optional[str] = None
    focus_area: Optional[str] = None


class AdvisoryResponse(BaseModel):
    id: str
    content: str
    threat_level: str
    focus_area: Optional[str] = None
    tool_results: Optional[Dict[str, Any]] = None
    priority_actions: List[str]
    created_at: str


class ReportRequest(BaseModel):
    include_sections: List[str] = ["overview", "hazards", "infrastructure", "recommendations"]


class ReportResponse(BaseModel):
    id: str
    content: str
    sections: Dict[str, str]
    created_at: str


# --- Alerts ---

class Alert(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    message: str
    zone: Optional[str] = None
    timestamp: str
    is_active: bool = True
