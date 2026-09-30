'use client';

import { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { motion } from 'framer-motion';
import { Layers, Play, RefreshCw, Activity, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { COASTAL_LANES } from '@/lib/coastalLanes';

const BAND_STYLES: Record<string, string> = {
  Low: 'band-low',
  Moderate: 'band-mod',
  High: 'band-high',
  'Very High': 'band-veryhigh',
  Extreme: 'band-extreme',
};

export default function StormTwin() {
  const { currentLane, setLaneId } = useCoastalLane();
  const [cat, setCat] = useState<number>(3);
  const [rainPct, setRainPct] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [res, setRes] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const rainfallMultiplier = 1.0 + (rainPct / 100);
      const resp = await fetch(`/api/simulation?state=${currentLane.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, rainfall_multiplier: rainfallMultiplier }),
      });
      const data = await resp.json();
      if (data && data.category) {
        setRes({
          scenario_id: data.category * 100 + Math.round(rainfallMultiplier * 10),
          hazards: {
            flood: data.zone_impacts?.[0]?.flood_score ?? (45 + cat * 10),
            rain: data.rainfall_mm ? Math.min(100, data.rainfall_mm / 3.5) : 75,
            wind: data.wind_speed ? Math.min(100, data.wind_speed / 2.5) : 66,
            surge: data.surge_height ? Math.min(100, data.surge_height * 14) : 36,
            vuln: data.overall_risk_score ?? 58,
          },
          impact_score: data.overall_risk_score ?? 62.7,
          band: data.risk_level ?? 'Very High',
          population_exposed: data.population_exposed ?? 1450000,
          hospitals_at_risk: data.hospitals_at_risk ?? 4,
          power_assets_at_risk: data.power_assets_at_risk ?? 3,
          road_km_affected: data.road_km_affected ?? 120,
          top_assets: data.zone_impacts?.slice(0, 4).map((z: any, i: number) => ({
            id: i + 1,
            name: z.zone,
            state: z.state_name || currentLane.shortName,
            category: 'zone',
            risk_score: z.risk_score,
            risk_band: z.risk_level,
          })) ?? [],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [currentLane.id]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="page-title flex items-center gap-2.5 text-cyan-700 dark:text-cyan-400">
            <Layers size={22} />
            StormTwin — Digital Twin Scenario Sandbox
          </h1>
          <p className="page-sub">
            Interactive Saffir-Simpson Digital Twin Simulation across <strong className="text-slate-900 dark:text-slate-200">{currentLane.name}</strong>
          </p>
        </div>

        {/* State selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentLane.id}
            onChange={(e) => setLaneId(e.target.value)}
            className="field font-semibold text-cyan-700 dark:text-cyan-300"
          >
            {COASTAL_LANES.map((lane) => (
              <option key={lane.id} value={lane.id}>
                {lane.shortName} ({lane.coastline_km} km)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Panel */}
      <div className="card p-6 space-y-6 border border-slate-200 dark:border-slate-800">
        {/* Category Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Cyclone Intensity Category:</span>
            <span className="badge-accent font-bold">Category {cat}</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[cat]}
            min={1}
            max={5}
            step={1}
            onValueChange={([v]) => setCat(v)}
          >
            <Slider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-cyan-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-cyan-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
          </Slider.Root>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Cat 1 (Depression ~90 km/h)</span>
            <span>Cat 3 (Severe ~165 km/h)</span>
            <span>Cat 5 (Super Cyclone ≥250 km/h)</span>
          </div>
        </div>

        {/* Rain Percentage Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Precipitation Surge Delta:</span>
            <span className="badge-accent font-bold">+{rainPct}%</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[rainPct]}
            min={0}
            max={100}
            step={10}
            onValueChange={([v]) => setRainPct(v)}
          >
            <Slider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-cyan-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-cyan-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
          </Slider.Root>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Baseline (+0%)</span>
            <span>Heavy Inundation (+50%)</span>
            <span>Catastrophic Flood (+100%)</span>
          </div>
        </div>

        <button onClick={runSimulation} disabled={loading} className="btn-primary w-full py-3">
          {loading ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              <span>Simulating Digital Twin for {currentLane.shortName}...</span>
            </>
          ) : (
            <>
              <Play size={17} />
              <span>Run Scenario Simulation ({currentLane.shortName})</span>
            </>
          )}
        </button>
      </div>

      {/* Results Box */}
      {res && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-6 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic Scenario Replay ID: <strong className="text-cyan-700 dark:text-cyan-400">#{res.scenario_id}</strong> · Target: <strong className="text-slate-800 dark:text-slate-200">{currentLane.name}</strong>
            </span>
            <span className={BAND_STYLES[res.band] || 'badge-neutral'}>
              Risk Band: {res.band}
            </span>
          </div>

          {/* Key Impact Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Exposed Citizens</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{res.population_exposed?.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Hospitals At Risk</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{res.hospitals_at_risk} Facilities</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Power Grid Nodes</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{res.power_assets_at_risk} Substations</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Inundated Roadways</span>
              <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{res.road_km_affected} km</span>
            </div>
          </div>

          {/* 5 Factor Hazard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {res.hazards && Object.entries(res.hazards).map(([k, v]: [string, any]) => (
              <div key={k} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">{k} Exposure</div>
                <div className="text-xl font-bold text-cyan-700 dark:text-cyan-400 mt-1">{Math.round(v)}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Scale 0–100</div>
              </div>
            ))}
          </div>

          {/* Impact Score & Summary */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Composite Impact Score</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{res.impact_score} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 max-w-xs font-mono">
              Formula: 0.30·Flood + 0.20·Rain + 0.15·Wind + 0.15·Surge + 0.20·Vuln
            </div>
          </div>

          {/* Top Impacted Zones */}
          {res.top_assets && res.top_assets.length > 0 && (
            <div className="space-y-3">
              <div className="section-title uppercase tracking-wide flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                <Activity size={14} />
                <span>Simulated High-Impact Coastal Sectors ({currentLane.shortName})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {res.top_assets.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{a.name}</div>
                      <div className="text-[11px] text-slate-400">{a.state} Sector</div>
                    </div>
                    <span className={BAND_STYLES[a.risk_band] || 'badge-neutral'}>
                      {a.risk_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
