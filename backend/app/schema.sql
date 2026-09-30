CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS cyclones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category INT NOT NULL,
    track JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    wind_kph NUMERIC NOT NULL,
    pressure_hpa NUMERIC NOT NULL,
    landfall_eta TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hazard_zones (
    id SERIAL PRIMARY KEY,
    cyclone_id INT REFERENCES cyclones(id) ON DELETE CASCADE,
    hazard TEXT CHECK (hazard IN ('flood','wind','rain','surge')),
    intensity NUMERIC NOT NULL,
    geom GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_hz_geom ON hazard_zones USING GIST(geom);

CREATE TABLE IF NOT EXISTS infrastructure (
    id SERIAL PRIMARY KEY,
    osm_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    criticality NUMERIC NOT NULL,
    population_served INT DEFAULT 10000,
    geom GEOMETRY(Geometry, 4326),
    factors JSONB,
    risk_score NUMERIC NOT NULL,
    risk_band TEXT NOT NULL,
    status TEXT DEFAULT 'nominal'
);
CREATE INDEX IF NOT EXISTS idx_infra_geom ON infrastructure USING GIST(geom);

CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    osm_id TEXT,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    geom GEOMETRY(LineString, 4326),
    flood_exposure NUMERIC NOT NULL,
    bottleneck BOOL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST(geom);

CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    cyclone_id INT REFERENCES cyclones(id) ON DELETE CASCADE,
    category INT NOT NULL,
    rain_pct INT NOT NULL DEFAULT 0,
    params JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS advisories (
    id SERIAL PRIMARY KEY,
    cyclone_id INT REFERENCES cyclones(id) ON DELETE CASCADE,
    threat_level TEXT NOT NULL,
    hazards JSONB,
    actions JSONB,
    body TEXT NOT NULL,
    source TEXT DEFAULT 'gemini',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    infra_id INT REFERENCES infrastructure(id) ON DELETE SET NULL,
    kind TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Initial Cyclone Data (Active Cyclone 'Michaung' impacting Coastal Andhra Pradesh)
INSERT INTO cyclones (id, name, category, track, status, wind_kph, pressure_hpa, landfall_eta)
VALUES (
    1,
    'Cyclone Michaung',
    3,
    '[[84.2, 14.1], [83.5, 15.2], [82.8, 15.9], [82.2, 16.5], [81.5, 17.2], [80.8, 17.8]]'::jsonb,
    'active',
    165,
    962,
    now() + interval '6 hours'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    track = EXCLUDED.track, 
    wind_kph = EXCLUDED.wind_kph, 
    pressure_hpa = EXCLUDED.pressure_hpa;

-- Seed Sample Hazard Zones
INSERT INTO hazard_zones (id, cyclone_id, hazard, intensity, geom)
VALUES 
    (1, 1, 'surge', 85, ST_Multi(ST_GeomFromText('POLYGON((82.0 16.0, 82.5 16.0, 82.5 17.0, 82.0 17.0, 82.0 16.0))', 4326))),
    (2, 1, 'flood', 90, ST_Multi(ST_GeomFromText('POLYGON((81.8 15.8, 82.6 15.8, 82.6 16.8, 81.8 16.8, 81.8 15.8))', 4326))),
    (3, 1, 'wind', 95, ST_Multi(ST_GeomFromText('POLYGON((81.0 15.0, 83.5 15.0, 83.5 18.0, 81.0 18.0, 81.0 15.0))', 4326))),
    (4, 1, 'rain', 88, ST_Multi(ST_GeomFromText('POLYGON((81.2 15.2, 83.0 15.2, 83.0 17.5, 81.2 17.5, 81.2 15.2))', 4326)))
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Infrastructure
INSERT INTO infrastructure (id, osm_id, name, category, criticality, population_served, geom, factors, risk_score, risk_band, status)
VALUES
    (1, 'osm_node_101', 'Kakinada General Hospital', 'hospital', 1.0, 240000, ST_SetSRID(ST_MakePoint(82.234, 16.989), 4326), '{"flood": 85, "rain": 78, "wind": 80, "surge": 72, "vuln": 75}'::jsonb, 78.4, 'Very High', 'critical'),
    (2, 'osm_node_102', 'King George Hospital Visakhapatnam', 'hospital', 1.0, 450000, ST_SetSRID(ST_MakePoint(83.303, 17.704), 4326), '{"flood": 65, "rain": 70, "wind": 85, "surge": 50, "vuln": 68}'::jsonb, 68.3, 'Very High', 'alert'),
    (3, 'osm_node_103', 'Machilipatnam District Hospital', 'hospital', 1.0, 180000, ST_SetSRID(ST_MakePoint(81.138, 16.187), 4326), '{"flood": 92, "rain": 85, "wind": 90, "surge": 88, "vuln": 82}'::jsonb, 87.9, 'Extreme', 'critical'),
    (4, 'osm_node_104', 'Vijayawada 220kV Substation', 'substation', 1.0, 520000, ST_SetSRID(ST_MakePoint(80.648, 16.506), 4326), '{"flood": 74, "rain": 65, "wind": 60, "surge": 30, "vuln": 62}'::jsonb, 60.6, 'Very High', 'warning'),
    (5, 'osm_node_105', 'Bapatla Cyclone Multi-Purpose Shelter', 'shelter', 0.2, 5000, ST_SetSRID(ST_MakePoint(80.468, 15.904), 4326), '{"flood": 40, "rain": 50, "wind": 75, "surge": 45, "vuln": 30}'::jsonb, 46.0, 'High', 'nominal'),
    (6, 'osm_node_106', 'Prakasam Barrage Bridge Link', 'bridge', 0.8, 320000, ST_SetSRID(ST_MakePoint(80.605, 16.507), 4326), '{"flood": 82, "rain": 70, "wind": 65, "surge": 20, "vuln": 60}'::jsonb, 63.4, 'Very High', 'alert'),
    (7, 'osm_node_107', 'Kakinada Port Power Substation', 'substation', 1.0, 160000, ST_SetSRID(ST_MakePoint(82.261, 16.963), 4326), '{"flood": 90, "rain": 80, "wind": 85, "surge": 85, "vuln": 80}'::jsonb, 84.5, 'Extreme', 'critical'),
    (8, 'osm_node_108', 'Guntur Zilla Parishad High School Shelter', 'school', 0.5, 2500, ST_SetSRID(ST_MakePoint(80.436, 16.306), 4326), '{"flood": 35, "rain": 45, "wind": 55, "surge": 10, "vuln": 25}'::jsonb, 34.3, 'Moderate', 'nominal')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Roads
INSERT INTO roads (id, osm_id, name, class, geom, flood_exposure, bottleneck)
VALUES
    (1, 'road_01', 'NH-16 Kakinada to Rajahmundry Bypass', 'primary', ST_SetSRID(ST_GeomFromText('LINESTRING(82.23 16.98, 82.10 16.99, 81.80 17.00)', 4326), 4326), 78.5, true),
    (2, 'road_02', 'SH-42 Machilipatnam Coastal Highway', 'secondary', ST_SetSRID(ST_GeomFromText('LINESTRING(81.13 16.18, 81.25 16.25, 81.40 16.35)', 4326), 4326), 88.0, true),
    (3, 'road_03', 'Visakhapatnam Beach Road Corridor', 'primary', ST_SetSRID(ST_GeomFromText('LINESTRING(83.30 17.70, 83.35 17.74, 83.38 17.78)', 4326), 4326), 64.0, true),
    (4, 'road_04', 'Guntur-Tenali Link Road', 'secondary', ST_SetSRID(ST_GeomFromText('LINESTRING(80.43 16.30, 80.50 16.27, 80.64 16.24)', 4326), 4326), 32.0, false)
ON CONFLICT (id) DO NOTHING;
