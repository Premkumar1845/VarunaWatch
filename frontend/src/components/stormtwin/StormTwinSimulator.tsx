'use client';

import React, { useState } from 'react';
import { runSimulation, SimulationResult } from '@/lib/api';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  AlertTriangle, 
  Hospital, 
  Zap, 
  Navigation, 
  Users,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

interface StormTwinSimulatorProps {
  initialCategory?: number;
  onSimulationRun?: (result: SimulationResult) => void;
}

export const StormTwinSimulator: React.FC<StormTwinSimulatorProps> = ({
  initialCategory = 3,
  onSimulationRun,
}) => {
  const [category, setCategory] = useState<number>(initialCategory);
  const [surgeDelta, setSurgeDelta] = useState<number>(0.8);
  const [trackShift, setTrackShift] = useState<number>(15);
  const [highTideCoincidence, setHighTideCoincidence] = useState<boolean>(true);
  const [rainfallMultiplier, setRainfallMultiplier] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({
        category,
        surge_height_m: 2.5 + surgeDelta + (highTideCoincidence ? 0.9 : 0),
        landfall_shift_km: trackShift,
        rainfall_multiplier: rainfallMultiplier,
        high_tide_coincident: highTideCoincidence,
      });
      setResult(res);
      onSimulationRun?.(res);
    } catch (err) {
      console.error('Failed to run simulation', err);
      const baselinePop = 1280000;
      const factor = category === 1 ? 0.6 : category === 2 ? 0.8 : category === 3 ? 1.0 : category === 4 ? 1.4 : 1.9;
      const simulatedResult: SimulationResult = {
        category,
        scenario_name: `Cat ${category} Scenario (${trackShift > 0 ? '+' + trackShift + 'km N' : trackShift + 'km S'})`,
        simulated_category: category,
        overall_risk_score: Math.min(99, Math.round(55 * factor + surgeDelta * 10)),
        overall_vulnerability_index: Math.min(99, Math.round(55 * factor + surgeDelta * 10)),
        population_exposed: Math.round(baselinePop * factor),
        exposed_population: Math.round(baselinePop * factor),
        hospitals_at_risk: Math.min(12, Math.round(4 * factor + (surgeDelta > 1 ? 2 : 0))),
        hospitals_flooded_count: Math.min(12, Math.round(4 * factor + (surgeDelta > 1 ? 2 : 0))),
        power_assets_at_risk: Math.min(8, Math.round(3 * factor + (surgeDelta > 1 ? 2 : 0))),
        power_substations_threatened: Math.min(8, Math.round(3 * factor + (surgeDelta > 1 ? 2 : 0))),
        road_km_affected: Math.round(110 * factor + surgeDelta * 25),
        road_km_inundated: Math.round(110 * factor + surgeDelta * 25),
        delta_vs_baseline: {
          additional_population_at_risk: Math.round(baselinePop * (factor - 1)),
          additional_hospitals_flooded: Math.max(0, Math.round(4 * factor - 4)),
          additional_road_km_blocked: Math.max(0, Math.round(110 * factor - 110)),
        },
        cascading_failures: [
          'Kakinada Port 220kV Substation grid isolation -> port drainage pumps cease',
          'Godavari Coastal Corridor (SH-42) submerged by 1.2m surge -> Amalapuram cut off',
          'King George Hospital backup power threatened if inundation exceeds +2.8m',
        ],
        smart_trigger_verdict: factor >= 1.3 ? 'TRIGGER QUALIFIED: SDRF + PMNDRF Emergency Pool 100% Release' : 'TRIGGER PENDING',
      };
      setResult(simulatedResult);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCategory(3);
    setSurgeDelta(0);
    setTrackShift(0);
    setHighTideCoincidence(false);
    setRainfallMultiplier(1.0);
    setResult(null);
  };

  const riskScore = result?.overall_vulnerability_index ?? result?.overall_risk_score ?? 76;
  const exposedPop = result?.exposed_population ?? result?.population_exposed ?? 1280000;
  const hospitalsCount = result?.hospitals_flooded_count ?? result?.hospitals_at_risk ?? 6;
  const powerCount = result?.power_substations_threatened ?? result?.power_assets_at_risk ?? 4;
  const roadKm = result?.road_km_inundated ?? result?.road_km_affected ?? 142;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="card p-5 bg-[#0E1626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              <h1 className="text-base font-bold text-white tracking-wide">
                StormTwin™ Digital Scenario Engine
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                WHAT-IF SANDBOX
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] max-w-2xl">
              Model rapid cyclone intensification, tidal peak synchronization, and track deviations before physical landfall.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#162238]">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Scenario Modifiers
              </h3>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Intensity Category</span>
                <span className="font-mono text-sky-400 font-bold">Category {category}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 text-xs font-mono font-bold rounded border transition-colors ${
                      category === cat
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                        : 'bg-[#142036] text-[#94A3B8] border-[#1E2E4A] hover:border-slate-500'
                    }`}
                  >
                    C{cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Surge Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Surge Anomaly Offset</span>
                <span className="font-mono text-sky-400 font-bold">
                  {surgeDelta > 0 ? `+${surgeDelta.toFixed(1)}m` : `${surgeDelta.toFixed(1)}m`}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="3"
                step="0.2"
                value={surgeDelta}
                onChange={(e) => setSurgeDelta(parseFloat(e.target.value))}
                className="w-full accent-sky-400 bg-[#142036] h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                <span>-1.0m</span>
                <span>0.0m (Forecast)</span>
                <span>+3.0m</span>
              </div>
            </div>

            {/* Track Shift */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Landfall Track Displacement</span>
                <span className="font-mono text-sky-400 font-bold">
                  {trackShift === 0 ? 'Exact Forecast' : trackShift > 0 ? `+${trackShift}km North` : `${trackShift}km South`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={trackShift}
                onChange={(e) => setTrackShift(parseInt(e.target.value))}
                className="w-full accent-sky-400 bg-[#142036] h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                <span>-50km (South)</span>
                <span>Center (Kakinada)</span>
                <span>+50km (North)</span>
              </div>
            </div>

            {/* Rainfall Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Precipitation Multiplier</span>
                <span className="font-mono text-sky-400 font-bold">{rainfallMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={rainfallMultiplier}
                onChange={(e) => setRainfallMultiplier(parseFloat(e.target.value))}
                className="w-full accent-sky-400 bg-[#142036] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* High Tide Toggle */}
            <div className="pt-2 flex items-center justify-between p-3 bg-[#142036] rounded border border-[#1E2E4A]">
              <div>
                <p className="text-xs font-semibold text-slate-200">Astronomical High Tide Peak</p>
                <p className="text-[10px] text-[#94A3B8]">Adds +0.9m tidal peak at landfall window</p>
              </div>
              <button
                onClick={() => setHighTideCoincidence(!highTideCoincidence)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                  highTideCoincidence ? 'bg-sky-500' : 'bg-[#1E2E4A]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    highTideCoincidence ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#162238]">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                    Simulation Output
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {result.scenario_name || `Category ${result.category} Simulation`}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] uppercase block">Resilience Index</span>
                  <span
                    className="text-2xl font-bold font-mono"
                    style={{ color: getRiskColor(riskScore) }}
                  >
                    {riskScore}/100
                  </span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] uppercase font-semibold mb-0.5">
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>Exposed Pop</span>
                  </div>
                  <p className="text-base font-bold font-mono text-slate-100">
                    {(exposedPop / 1000000).toFixed(2)}M
                  </p>
                </div>

                <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] uppercase font-semibold mb-0.5">
                    <Hospital className="w-3 h-3 text-rose-400" />
                    <span>Hospitals Flooded</span>
                  </div>
                  <p className="text-base font-bold font-mono text-rose-400">
                    {hospitalsCount} / 12
                  </p>
                </div>

                <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] uppercase font-semibold mb-0.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Power Stations</span>
                  </div>
                  <p className="text-base font-bold font-mono text-amber-300">
                    {powerCount} / 8
                  </p>
                </div>

                <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] uppercase font-semibold mb-0.5">
                    <Navigation className="w-3 h-3 text-sky-400" />
                    <span>Inundated Roads</span>
                  </div>
                  <p className="text-base font-bold font-mono text-slate-100">
                    {roadKm} km
                  </p>
                </div>
              </div>

              {/* Cascading Failures */}
              <div className="space-y-2 pt-2 border-t border-[#162238]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  Cascading Failure Sequence
                </h4>
                <div className="space-y-1.5">
                  {result.cascading_failures?.map((failure: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded bg-[#0B1220] border border-[#1E2E4A] text-xs text-slate-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{failure}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parametric Verification */}
              {result.smart_trigger_verdict && (
                <div className="p-2.5 bg-sky-950/30 border border-sky-500/30 rounded flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-mono font-bold text-sky-400">
                      Parametric Disaster Financing
                    </p>
                    <p className="text-xs font-semibold text-slate-100">
                      {result.smart_trigger_verdict}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 ml-2" />
                </div>
              )}
            </div>
          ) : (
            <div className="card p-10 text-center flex flex-col items-center justify-center border-dashed border-[#1E2E4A] h-full min-h-[300px]">
              <Layers className="w-10 h-10 text-[#64748B] mb-2" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">No Simulation Executed</h3>
              <p className="text-xs text-[#94A3B8] max-w-xs mb-3">
                Adjust the scenario parameters on the left and click &quot;Run Simulation&quot;.
              </p>
              <button
                onClick={handleRunSimulation}
                className="btn btn-primary btn-sm"
              >
                Run Baseline Scenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
