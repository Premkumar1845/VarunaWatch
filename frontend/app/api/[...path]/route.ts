import { NextRequest, NextResponse } from 'next/server';

/**
 * VarunaWatch Native Vercel Serverless API Handler
 * Handles all backend requests directly in Next.js App Router API Routes
 * Support for all 9 Coastal States & UTs (Pan-India 7,516+ km Coastline)
 */

// Coastal States definition & coordinates
const STATE_MAP: Record<string, { name: string; center: { lat: number; lng: number }; category: number; wind: number; pressure: number }> = {
  ap: { name: 'Andhra Pradesh', center: { lat: 16.5062, lng: 80.6480 }, category: 4, wind: 175, pressure: 948 },
  od: { name: 'Odisha', center: { lat: 20.9517, lng: 85.0985 }, category: 3, wind: 145, pressure: 962 },
  wb: { name: 'West Bengal', center: { lat: 22.9868, lng: 87.8550 }, category: 3, wind: 135, pressure: 970 },
  tn: { name: 'Tamil Nadu', center: { lat: 11.1271, lng: 78.6569 }, category: 3, wind: 140, pressure: 965 },
  mh: { name: 'Maharashtra', center: { lat: 19.7515, lng: 75.7139 }, category: 2, wind: 110, pressure: 982 },
  gj: { name: 'Gujarat', center: { lat: 22.2587, lng: 71.1924 }, category: 4, wind: 165, pressure: 955 },
  kl: { name: 'Kerala', center: { lat: 10.8505, lng: 76.2711 }, category: 2, wind: 105, pressure: 985 },
  ka: { name: 'Karnataka', center: { lat: 15.3173, lng: 75.7139 }, category: 2, wind: 95, pressure: 990 },
  ga: { name: 'Goa', center: { lat: 15.2993, lng: 74.1240 }, category: 1, wind: 85, pressure: 995 },
  ut: { name: 'Puducherry & UTs', center: { lat: 11.9416, lng: 79.8083 }, category: 3, wind: 130, pressure: 972 },
  all: { name: 'Pan-India Coastal Corridor', center: { lat: 16.5783, lng: 82.0040 }, category: 4, wind: 175, pressure: 948 },
};

function getCycloneStatus(stateId: string = 'ap') {
  const meta = STATE_MAP[stateId.toLowerCase()] || STATE_MAP.ap;
  return {
    id: `cyclone-varuna-${stateId.toLowerCase()}`,
    name: `Cyclone Varuna (${meta.name} Sector)`,
    category: meta.category,
    category_name: `Category ${meta.category} Very Severe Cyclonic Storm`,
    wind_speed: meta.wind,
    max_wind_kmh: meta.wind + 25,
    pressure: meta.pressure,
    position: meta.center,
    current_lat: meta.center.lat,
    current_lng: meta.center.lng,
    direction: 'NW',
    heading: 'North-Northwest (315°)',
    speed_of_movement: 18.5,
    movement_speed_kmh: 18.5,
    eta_landfall: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    hours_to_landfall: 18,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_WARNING',
  };
}

function getTrack(stateId: string = 'ap') {
  const status = getCycloneStatus(stateId);
  const lat = status.position.lat;
  const lng = status.position.lng;
  return [
    { position: { lat: lat - 1.5, lng: lng + 2.0 }, timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), wind_speed: 120, pressure: 978, category: 2, is_forecast: false },
    { position: { lat: lat - 0.7, lng: lng + 1.0 }, timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), wind_speed: 150, pressure: 960, category: 3, is_forecast: false },
    { position: { lat: lat, lng: lng }, timestamp: new Date().toISOString(), wind_speed: status.wind_speed, pressure: status.pressure, category: status.category, is_forecast: false },
    { position: { lat: lat + 0.6, lng: lng - 0.7 }, timestamp: new Date(Date.now() + 12 * 3600 * 1000).toISOString(), wind_speed: status.wind_speed + 10, pressure: status.pressure - 5, category: status.category, is_forecast: true },
    { position: { lat: lat + 1.3, lng: lng - 1.5 }, timestamp: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), wind_speed: status.wind_speed - 25, pressure: status.pressure + 15, category: Math.max(1, status.category - 1), is_forecast: true },
  ];
}

function getHazardZones(stateId: string = 'all') {
  const zones = [
    { id: 'zone-vsk-north', state_id: 'ap', name: 'Visakhapatnam Port & North', district: 'Visakhapatnam', center: { lat: 17.75, lng: 83.30 }, risk_score: 88, risk_level: 'Very High', population: 485000, surge_height_m: 3.4, peak_wind_kmh: 175, key_vulnerability: 'Industrial Port Facilities', priority_action: 'Evacuate low-lying docks' },
    { id: 'zone-kakinada', state_id: 'ap', name: 'Kakinada Deepwater Basin', district: 'Kakinada', center: { lat: 16.98, lng: 82.24 }, risk_score: 94, risk_level: 'Extreme', population: 410000, surge_height_m: 4.2, peak_wind_kmh: 185, key_vulnerability: 'Estuarine Inundation', priority_action: 'Pre-position NDRF teams' },
    { id: 'zone-paradeep', state_id: 'od', name: 'Paradip Port Industrial Complex', district: 'Jagatsinghpur', center: { lat: 20.26, lng: 86.67 }, risk_score: 86, risk_level: 'Very High', population: 320000, surge_height_m: 3.1, peak_wind_kmh: 160, key_vulnerability: 'Petrochemical Terminals', priority_action: 'Emergency shutdown of refinery' },
    { id: 'zone-sundarbans', state_id: 'wb', name: 'Sundarbans Biosphere Delta', district: 'South 24 Parganas', center: { lat: 21.94, lng: 88.89 }, risk_score: 96, risk_level: 'Extreme', population: 540000, surge_height_m: 4.8, peak_wind_kmh: 170, key_vulnerability: 'Embankment Breach', priority_action: 'Mass evacuation to multi-purpose shelters' },
    { id: 'zone-chennai-north', state_id: 'tn', name: 'Chennai Port & Ennore Littoral', district: 'Chennai', center: { lat: 13.12, lng: 80.30 }, risk_score: 82, risk_level: 'High', population: 980000, surge_height_m: 2.8, peak_wind_kmh: 145, key_vulnerability: 'Urban Storm Drain Congestion', priority_action: 'Clear stormwater outlets' },
    { id: 'zone-mumbai-mmr', state_id: 'mh', name: 'Mumbai Coastal Region & JNPT', district: 'Mumbai City', center: { lat: 18.96, lng: 72.82 }, risk_score: 74, risk_level: 'High', population: 1450000, surge_height_m: 2.2, peak_wind_kmh: 130, key_vulnerability: 'Low-lying Tidal Creek Inundation', priority_action: 'Deploy high-capacity dewatering pumps' },
    { id: 'zone-kandla', state_id: 'gj', name: 'Deendayal Kandla Port Basin', district: 'Kutch', center: { lat: 23.01, lng: 70.22 }, risk_score: 91, risk_level: 'Extreme', population: 390000, surge_height_m: 4.5, peak_wind_kmh: 180, key_vulnerability: 'Salt Flat Inundation', priority_action: 'Suspend cargo operations' },
    { id: 'zone-kochi', state_id: 'kl', name: 'Kochi Port & Vembanad Backwaters', district: 'Ernakulam', center: { lat: 9.96, lng: 76.26 }, risk_score: 68, risk_level: 'Moderate', population: 610000, surge_height_m: 1.8, peak_wind_kmh: 110, key_vulnerability: 'Backwater Overflow', priority_action: 'Monitor sluice gates' },
  ];
  if (stateId && stateId !== 'all') {
    return zones.filter(z => z.state_id.toLowerCase() === stateId.toLowerCase());
  }
  return zones;
}

function getInfrastructureAssets(stateId: string = 'all') {
  const assets = [
    { id: 'asset-hosp-vsk-01', name: 'King George General Hospital', type: 'hospital', position: { lat: 17.708, lng: 83.302 }, zone_id: 'zone-vsk-north', zone_name: 'Visakhapatnam Port', vulnerability_score: 82, risk_level: 'High', status: 'At Risk', criticality: 95, capacity: 1200, backup_power_hours: 48, surge_flood_depth_m: 1.8, action_recommendation: 'Deploy diesel generators & elevate medical supplies' },
    { id: 'asset-power-vsk-02', name: 'Simhadri Super Thermal Substation', type: 'power', position: { lat: 17.602, lng: 83.134 }, zone_id: 'zone-vsk-south', zone_name: 'Visakhapatnam South', vulnerability_score: 91, risk_level: 'Extreme', status: 'Critical', criticality: 98, capacity: 2000, backup_power_hours: 12, surge_flood_depth_m: 2.4, action_recommendation: 'Pre-position barrier walls' },
    { id: 'asset-shelter-kak-01', name: 'Kakinada Cyclone Shelter Alpha', type: 'shelter', position: { lat: 16.985, lng: 82.251 }, zone_id: 'zone-kakinada', zone_name: 'Kakinada Basin', vulnerability_score: 35, risk_level: 'Low', status: 'Operational', criticality: 88, capacity: 3500, backup_power_hours: 72, surge_flood_depth_m: 0.0, action_recommendation: 'Stock rations & medical kits' },
    { id: 'asset-bridge-pdk-01', name: 'Paradip Mahanadi River Bridge', type: 'bridge', position: { lat: 20.28, lng: 86.68 }, zone_id: 'zone-paradeep', zone_name: 'Paradip Port', vulnerability_score: 78, risk_level: 'High', status: 'At Risk', criticality: 92, capacity: 15000, backup_power_hours: 0, surge_flood_depth_m: 3.2, action_recommendation: 'Restrict heavy vehicle movement' },
    { id: 'asset-hosp-chn-01', name: 'Stanley Medical College & Hospital', type: 'hospital', position: { lat: 13.102, lng: 80.288 }, zone_id: 'zone-chennai-north', zone_name: 'Chennai Port', vulnerability_score: 75, risk_level: 'High', status: 'At Risk', criticality: 94, capacity: 1600, backup_power_hours: 36, surge_flood_depth_m: 1.2, action_recommendation: 'Clear basement drainage pumps' },
    { id: 'asset-power-kandla-01', name: 'Kandla Port Substation 220kV', type: 'power', position: { lat: 23.02, lng: 70.21 }, zone_id: 'zone-kandla', zone_name: 'Deendayal Kandla', vulnerability_score: 89, risk_level: 'Extreme', status: 'Critical', criticality: 96, capacity: 1200, backup_power_hours: 18, surge_flood_depth_m: 2.6, action_recommendation: 'Protect transformer yards' },
  ];
  if (stateId && stateId !== 'all') {
    return assets.filter(a => a.id.includes(stateId.toLowerCase()) || a.zone_id.includes(stateId.toLowerCase()));
  }
  return assets;
}

// Handler GET
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const endpoint = pathParts.join('/');
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || 'all';

  if (endpoint === 'cyclone/current') {
    return NextResponse.json(getCycloneStatus(state));
  }

  if (endpoint === 'cyclone/forecast') {
    const status = getCycloneStatus(state);
    return NextResponse.json({
      cyclone: status,
      track: getTrack(state),
      forecast_cone: [[status.position.lat - 1, status.position.lng - 1], [status.position.lat + 1, status.position.lng + 1]],
      landfall_estimate: status.position,
      rainfall_forecast: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}h`, hour: i * 2, rainfall_mm: Math.round(15 + Math.random() * 45), cumulative_mm: Math.round((i + 1) * 30) })),
      wind_forecast: Array.from({ length: 12 }, (_, i) => ({ time: `${i * 2}h`, hour: i * 2, wind_speed_kmh: Math.round(90 + Math.random() * 85), gust_kmh: Math.round(120 + Math.random() * 95) })),
    });
  }

  if (endpoint === 'hazards') {
    const zones = getHazardZones(state);
    return NextResponse.json({ total_zones: zones.length, zones });
  }

  if (endpoint.startsWith('hazards/')) {
    const zoneId = pathParts[1];
    const zones = getHazardZones('all');
    const zone = zones.find(z => z.id === zoneId) || zones[0];
    return NextResponse.json({ ...zone, infrastructure: getInfrastructureAssets('all'), roads: [] });
  }

  if (endpoint === 'infrastructure') {
    const assets = getInfrastructureAssets(state);
    return NextResponse.json({
      total_assets: assets.length,
      critical_assets: assets.filter(a => a.vulnerability_score >= 80).length,
      high_risk_assets: assets.filter(a => a.vulnerability_score >= 60).length,
      hospitals: assets.filter(a => a.type === 'hospital').length,
      hospitals_at_risk: assets.filter(a => a.type === 'hospital' && a.vulnerability_score >= 60).length,
      power_assets: assets.filter(a => a.type === 'power').length,
      power_at_risk: assets.filter(a => a.type === 'power' && a.vulnerability_score >= 60).length,
      shelters: assets.filter(a => a.type === 'shelter').length,
      shelters_at_risk: 0,
      bridges: assets.filter(a => a.type === 'bridge').length,
      bridges_at_risk: assets.filter(a => a.type === 'bridge' && a.vulnerability_score >= 60).length,
      assets,
    });
  }

  if (endpoint === 'roads/affected') {
    return NextResponse.json({
      total_road_km: 1850,
      affected_road_km: 420,
      critical_segments: 14,
      blocked_segments: 6,
      segments: [
        { id: 'rd-nh16-01', name: 'NH-16 Coastal Corridor Segment 4', road_type: 'National Highway', geometry: { type: 'LineString', coordinates: [] }, length_km: 48, risk_score: 84, risk_level: 'High', accessibility: 'Impaired', zone_id: 'zone-vsk-north', zone_name: 'Visakhapatnam Port' },
        { id: 'rd-sh38-02', name: 'SH-38 Kakinada Port Bypass', road_type: 'State Highway', geometry: { type: 'LineString', coordinates: [] }, length_km: 32, risk_score: 92, risk_level: 'Extreme', accessibility: 'Likely Blocked', zone_id: 'zone-kakinada', zone_name: 'Kakinada Deepwater Basin' },
      ],
    });
  }

  if (endpoint === 'risk/summary') {
    return NextResponse.json({
      overall_risk_score: 87,
      overall_risk_level: 'Extreme',
      population_total: 4850000,
      population_exposed: 1820000,
      hospitals_total: 42,
      hospitals_at_risk: 18,
      power_assets_total: 28,
      power_assets_at_risk: 14,
      shelters_total: 120,
      shelters_available: 112,
      shelters_at_risk: 8,
      total_road_km: 3400,
      road_km_affected: 820,
      bridges_total: 64,
      bridges_at_risk: 19,
      top_risks: [
        { zone: 'Kakinada Deepwater Basin', score: 94, level: 'Extreme', population: 410000 },
        { zone: 'Sundarbans Delta', score: 96, level: 'Extreme', population: 540000 },
        { zone: 'Visakhapatnam Port', score: 88, level: 'Very High', population: 485000 },
      ],
      zone_breakdown: [
        { zone: 'Andhra Pradesh', score: 88, level: 'Extreme' },
        { zone: 'Odisha', score: 86, level: 'Very High' },
        { zone: 'West Bengal', score: 92, level: 'Extreme' },
      ],
    });
  }

  if (endpoint === 'trigger/status') {
    return NextResponse.json({
      overall_status: 'Watch Active — Threshold Approaching',
      thresholds: [
        { parameter: 'Sustained Wind Speed', threshold_value: 150, forecast_value: 175, unit: 'km/h', status: 'Likely Trigger', confidence: 0.92 },
        { parameter: 'Storm Surge Elevation', threshold_value: 3.0, forecast_value: 4.2, unit: 'meters', status: 'Likely Trigger', confidence: 0.88 },
        { parameter: '24h Cumulative Rainfall', threshold_value: 200, forecast_value: 260, unit: 'mm', status: 'Watch', confidence: 0.85 },
      ],
      last_updated: new Date().toISOString(),
    });
  }

  if (endpoint === 'alerts') {
    return NextResponse.json({
      alerts: [
        { id: 'alt-01', severity: 'extreme', title: 'Cyclone Varuna Category 4 Warning', message: 'Evacuation orders in place for Kakinada, Visakhapatnam, and Paradip coastal sectors.', zone: 'Pan-India East Coast', timestamp: new Date().toISOString(), is_active: true },
        { id: 'alt-02', severity: 'warning', title: 'Storm Surge Inundation Watch', message: 'Expected peak surge 4.2m near landfall zone during high tide.', zone: 'Andhra Pradesh & Odisha', timestamp: new Date().toISOString(), is_active: true },
      ],
    });
  }

  return NextResponse.json({ status: 'active', message: `VarunaWatch Serverless API path /api/${endpoint} operational` });
}

// Handler POST
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const endpoint = pathParts.join('/');
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (endpoint === 'simulation') {
    const cat = body.category || 4;
    const mult = body.rainfall_multiplier || 1.0;
    return NextResponse.json({
      category: cat,
      scenario_name: `Simulated Category ${cat} Scenario (${mult}x Rainfall)`,
      wind_speed: 100 + cat * 20,
      rainfall_mm: Math.round(120 * mult),
      surge_height: (cat * 0.9).toFixed(1),
      population_exposed: 450000 * cat,
      hospitals_at_risk: 3 * cat,
      road_km_affected: 120 * cat,
      power_assets_at_risk: 2 * cat,
      overall_risk_score: Math.min(99, 45 + cat * 10),
      risk_level: cat >= 4 ? 'Extreme' : 'High',
      cascading_failures: [
        'Grid Tripping at Primary Substation',
        'Port Terminal Power Blackout',
        'Hospital Emergency Diesel Generator Transfer',
      ],
      smart_trigger_verdict: cat >= 3 ? 'AUTOMATIC PARAMETRIC DISPAYMENT TRIGGERED ($2.5M USD)' : 'WATCH LEVEL ONLY',
    });
  }

  if (endpoint === 'ai/analyze') {
    const userMessage = body.message || 'What is the current cyclone status?';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `You are VarunaWatch AI Disaster Specialist for Indian Coastal Lanes. User question: ${userMessage}` }],
              },
            ],
          }),
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const responseText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({
              response: responseText,
              cited_assets: [
                { id: 'asset-hosp-vsk-01', name: 'King George Hospital', type: 'hospital', score: 82, level: 'High' },
                { id: 'asset-power-vsk-02', name: 'Simhadri Power Station', type: 'power', score: 91, level: 'Extreme' },
              ],
              suggestions: ['Generate Evacuation Route Map', 'Dispatch Emergency SMS Alert', 'Run Category 5 Simulation'],
            });
          }
        }
      } catch (err) {
        console.error('Gemini API fetch error:', err);
      }
    }

    // Smart fallback response
    return NextResponse.json({
      response: `**VarunaWatch Intelligence Report:**\n\nRegarding your inquiry on *"${userMessage}"*:\n\n- **Cyclone Varuna Status:** Currently tracking Category 4 Very Severe Cyclonic Storm (175 km/h sustained winds) approaching the Andhra Pradesh - Odisha coastal corridor.\n- **Primary Vulnerabilities:** High-density port infrastructure in Visakhapatnam and Kakinada, with 4.2m predicted storm surge.\n- **Recommended Protocol:** Execute pre-landfall evacuation of low-elevation zones within 15km of coast. Pre-position NDRF search and rescue units at key arterial nodes.`,
      cited_assets: [
        { id: 'asset-hosp-vsk-01', name: 'King George General Hospital', type: 'hospital', score: 82, level: 'High' },
        { id: 'asset-power-vsk-02', name: 'Simhadri Substation', type: 'power', score: 91, level: 'Extreme' },
      ],
      suggestions: ['View Detailed Evacuation Zones', 'Inspect Substation Resilience', 'Trigger Parametric Insurance Alert'],
    });
  }

  if (endpoint === 'ai/advisory') {
    return NextResponse.json({
      id: `adv-${Date.now()}`,
      threat_level: body.threat_level || 'CRITICAL',
      focus_area: body.focus_area || 'Pan-India East Coast',
      content: `**OFFICIAL DISASTER MANAGEMENT ADVISORY**\n\n**THREAT LEVEL:** CRITICAL\n**AFFECTED REGION:** Andhra Pradesh, Odisha, West Bengal Coastal Lanes\n\n1. **IMMEDIATE ACTION:** All fishing vessels must return to port immediately. Port operations to suspend cargo handling.\n2. **EVACUATION:** Evacuate residents in coastal structures within 500m of high-tide line to multi-purpose cyclone shelters.\n3. **POWER GRID:** Prepare load-shedding protocols to isolate flooded coastal substations and prevent cascade transformer failure.`,
      priority_actions: [
        'Deploy 24 NDRF & State Disaster Teams',
        'Issue Multilingual Broadcast Alerts (Telugu, Odia, Bengali, Tamil)',
        'Activate Smart Contract Parametric Insurance Liquidity Pool',
      ],
      created_at: new Date().toISOString(),
    });
  }

  if (endpoint === 'ai/report') {
    return NextResponse.json({
      id: `rep-${Date.now()}`,
      content: `# Executive Cyclone Resilience Report\n\n## Summary\nCyclone Varuna threatens 7,516+ km of coastal infrastructure across 9 Indian states. Emergency response frameworks are active.`,
      sections: {
        'Executive Summary': 'Category 4 storm approaching AP/OD coast.',
        'Infrastructure Risk': '18 hospitals and 14 power stations in high-vulnerability sectors.',
      },
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
