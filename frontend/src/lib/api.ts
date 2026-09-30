/** VarunaWatch — API Client Library */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ---- Cyclone ----
export async function getCycloneCurrent(state?: string) {
  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<CycloneStatus>(`/cyclone/current${query}`);
}

export async function getCycloneForecast(state?: string) {
  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<CycloneForecast>(`/cyclone/forecast${query}`);
}

// ---- Hazards ----
export async function getHazards(minRisk?: number, category?: number, state?: string) {
  const params = new URLSearchParams();
  if (minRisk !== undefined) params.set('min_risk', String(minRisk));
  if (category !== undefined) params.set('category', String(category));
  if (state) params.set('state', state);
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI<HazardResponse>(`/hazards${query}`);
}

export async function getHazardDetail(zoneId: string) {
  return fetchAPI<HazardZoneDetail>(`/hazards/${zoneId}`);
}

// ---- Infrastructure ----
export interface InfraFilters {
  assetType?: string;
  minRisk?: number;
  zoneId?: string;
  category?: number;
  state?: string;
}

export async function getInfrastructure(filters?: InfraFilters) {
  const params = new URLSearchParams();
  if (filters?.assetType) params.set('asset_type', filters.assetType);
  if (filters?.minRisk !== undefined) params.set('min_risk', String(filters.minRisk));
  if (filters?.zoneId) params.set('zone_id', filters.zoneId);
  if (filters?.category !== undefined) params.set('category', String(filters.category));
  if (filters?.state) params.set('state', filters.state);
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI<InfrastructureResponse>(`/infrastructure${query}`);
}

export async function getInfrastructureDetail(assetId: string) {
  return fetchAPI<InfrastructureAsset>(`/infrastructure/${assetId}`);
}

// ---- Roads ----
export async function getRoadsAffected(minRisk?: number, category?: number, state?: string) {
  const params = new URLSearchParams();
  if (minRisk !== undefined) params.set('min_risk', String(minRisk));
  if (category !== undefined) params.set('category', String(category));
  if (state) params.set('state', state);
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI<RoadsResponse>(`/roads/affected${query}`);
}

// ---- Risk Summary ----
export async function getRiskSummary(category?: number, state?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', String(category));
  if (state) params.set('state', state);
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI<RiskSummary>(`/risk/summary${query}`);
}

// ---- Simulation ----
export interface SimulationOptions {
  category: number;
  surge_height_m?: number;
  landfall_shift_km?: number;
  rainfall_multiplier?: number;
  high_tide_coincident?: boolean;
  state?: string;
}

export async function runSimulation(optionsOrCat: number | SimulationOptions, rainfallMultiplier: number = 1.0, state?: string) {
  const body = typeof optionsOrCat === 'number'
    ? { category: optionsOrCat, rainfall_multiplier: rainfallMultiplier }
    : optionsOrCat;

  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<SimulationResult>(`/simulation${query}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function compareScenarios(state?: string) {
  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<{ scenarios: SimulationResult[] }>(`/simulation/compare${query}`);
}

// ---- TriggerWatch ----
export async function getTriggerStatus(state?: string) {
  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<TriggerWatchResponse>(`/trigger/status${query}`);
}

// ---- Alerts ----
export async function getAlerts(state?: string) {
  const query = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchAPI<{ alerts: Alert[] }>(`/alerts${query}`);
}

export async function dispatchEmergencyCall() {
  return fetchAPI<{ success: boolean; status?: string; call_sid?: string; error?: string }>('/alerts/dispatch-call', {
    method: 'POST',
  });
}

// ---- AI ----
export async function chatWithAI(message: string, context?: Record<string, unknown>) {
  return fetchAPI<AIResponse>('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  });
}

export async function generateAdvisory(threatLevel?: string, focusArea?: string) {
  return fetchAPI<AdvisoryResponse>('/ai/advisory', {
    method: 'POST',
    body: JSON.stringify({ threat_level: threatLevel, focus_area: focusArea }),
  });
}

export async function generateReport(sections?: string[]) {
  return fetchAPI<ReportResponse>('/ai/report', {
    method: 'POST',
    body: JSON.stringify({ include_sections: sections }),
  });
}


// ---- Types ----

export interface CycloneStatus {
  id: string;
  name: string;
  category: number;
  category_name?: string;
  wind_speed: number;
  max_wind_kmh?: number;
  pressure: number;
  position: { lat: number; lng: number };
  current_lat?: number;
  current_lng?: number;
  direction: string;
  heading?: string;
  speed_of_movement: number;
  movement_speed_kmh?: number;
  eta_landfall: string | null;
  hours_to_landfall?: number;
  timestamp: string;
  status: string;
}

export interface TrackPoint {
  position: { lat: number; lng: number };
  timestamp: string;
  wind_speed: number;
  pressure: number;
  category: number;
  is_forecast: boolean;
}

export interface CycloneForecast {
  cyclone: CycloneStatus;
  track: TrackPoint[];
  forecast_cone: number[][];
  landfall_estimate: { lat: number; lng: number } | null;
  rainfall_forecast: RainfallPoint[];
  wind_forecast: WindPoint[];
}

export interface RainfallPoint {
  time: string;
  hour: number;
  rainfall_mm: number;
  cumulative_mm: number;
}

export interface WindPoint {
  time: string;
  hour: number;
  wind_speed_kmh: number;
  gust_kmh: number;
}

export interface HazardZone {
  id: string;
  name: string;
  district: string;
  zone_type?: string;
  geometry?: GeoJSONGeometry;
  center: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  risk_score: number;
  risk_level: RiskLevel;
  flood_score?: number;
  rainfall_score?: number;
  wind_score?: number;
  surge_score?: number;
  surge_height_m?: number;
  peak_wind_kmh?: number;
  key_vulnerability?: string;
  priority_action?: string;
  vulnerability_score?: number;
  population: number;
  population_exposed?: number;
  area_sq_km?: number;
  elevation_avg?: number;
  coastal?: boolean;
}

export interface HazardZoneDetail extends HazardZone {
  infrastructure: InfrastructureAsset[];
  roads: RoadSegment[];
}

export interface HazardResponse {
  total_zones: number;
  zones: HazardZone[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: AssetType;
  position: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  zone_id: string;
  zone_name: string;
  vulnerability_score: number;
  risk_level: RiskLevel;
  status: string;
  criticality: number;
  capacity: number | null;
  capacity_metric?: string;
  elevation_m?: number;
  surge_flood_depth_m?: number;
  backup_power_hours?: number;
  action_recommendation?: string;
  factors?: RiskFactors;
  recommended_actions?: string[];
}

export interface RiskFactors {
  flood_exposure: number;
  wind_exposure: number;
  surge_exposure: number;
  accessibility_risk: number;
  criticality: number;
}

export interface InfrastructureResponse {
  total_assets: number;
  critical_assets: number;
  high_risk_assets: number;
  hospitals: number;
  hospitals_at_risk: number;
  power_assets: number;
  power_at_risk: number;
  shelters: number;
  shelters_at_risk: number;
  bridges: number;
  bridges_at_risk: number;
  assets: InfrastructureAsset[];
}

export interface InfraFilters {
  assetType?: string;
  minRisk?: number;
  zoneId?: string;
  category?: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  road_type: string;
  geometry: GeoJSONGeometry;
  start_lat?: number;
  start_lng?: number;
  end_lat?: number;
  end_lng?: number;
  length_km: number;
  risk_score: number;
  risk_level: RiskLevel;
  accessibility: string;
  zone_id: string;
  zone_name: string;
  factors?: Record<string, number>;
}

export interface RoadsResponse {
  total_road_km: number;
  affected_road_km: number;
  critical_segments: number;
  blocked_segments: number;
  segments: RoadSegment[];
}

export interface RiskSummary {
  overall_risk_score: number;
  overall_risk_level: RiskLevel;
  population_total: number;
  population_exposed: number;
  hospitals_total: number;
  total_hospitals?: number;
  hospitals_at_risk: number;
  power_assets_total: number;
  total_power_assets?: number;
  power_assets_at_risk: number;
  shelters_total: number;
  shelters_available: number;
  active_shelters_count?: number;
  shelters_at_risk: number;
  total_road_km: number;
  road_km_affected: number;
  bridges_total: number;
  bridges_at_risk: number;
  top_risks: { zone: string; score: number; level: RiskLevel; population: number }[];
  zone_breakdown: { zone: string; score: number; level: RiskLevel }[];
}

export interface SimulationResult {
  category?: number;
  scenario_name?: string;
  simulated_category?: number;
  rainfall_multiplier?: number;
  wind_speed?: number;
  rainfall_mm?: number;
  surge_height?: number;
  population_exposed?: number;
  exposed_population?: number;
  hospitals_at_risk?: number;
  hospitals_flooded_count?: number;
  road_km_affected?: number;
  road_km_inundated?: number;
  power_assets_at_risk?: number;
  power_substations_threatened?: number;
  shelters_at_risk?: number;
  overall_risk_score?: number;
  overall_vulnerability_index?: number;
  risk_level?: RiskLevel;
  delta_vs_baseline?: {
    additional_population_at_risk?: number;
    additional_hospitals_flooded?: number;
    additional_road_km_blocked?: number;
  };
  delta_from_current?: Record<string, number>;
  cascading_failures?: string[];
  smart_trigger_verdict?: string;
  zone_impacts?: ZoneImpact[];
}

export interface ZoneImpact {
  zone: string;
  risk_score: number;
  risk_level: RiskLevel;
  population: number;
  flood_score: number;
  wind_score: number;
  surge_score: number;
}

export interface TriggerThreshold {
  parameter: string;
  threshold_value: number;
  forecast_value: number;
  unit: string;
  status: 'Clear' | 'Watch' | 'Likely Trigger';
  confidence: number;
}

export interface TriggerWatchResponse {
  overall_status: string;
  thresholds: TriggerThreshold[];
  last_updated: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'extreme';
  title: string;
  message: string;
  zone: string | null;
  timestamp: string;
  is_active: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIResponse {
  response: string;
  tool_calls?: { tool: string; args: Record<string, unknown>; result_summary: string }[];
  cited_assets?: { id: string; name: string; type: string; score: number; level: string }[];
  suggestions?: string[];
}

export interface AdvisoryResponse {
  id: string;
  content: string;
  body?: string;
  threat_level?: string;
  focus_area?: string;
  tool_results?: {
    cyclone?: any;
    high_risk_assets?: any[];
    affected_roads?: any[];
    population_exposure?: number;
    risk_summary?: any[];
  };
  priority_actions?: string[];
  created_at?: string;
}

export interface ReportResponse {
  id: string;
  content: string;
  sections: Record<string, string>;
  created_at: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
export type AssetType = 'hospital' | 'power' | 'road' | 'shelter' | 'bridge';

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}
