'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  FileText, 
  Database, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  MessageSquare, 
  Hospital,
  Zap,
  Shield,
  Navigation,
  Wind,
  Waves,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  Compass,
  MapPin
} from 'lucide-react';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { generateAdvisory as apiGenerateAdvisory } from '@/lib/api';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { COASTAL_LANES } from '@/lib/coastalLanes';

const QUICK_CORRIDORS = [
  'All Coastal India (National Grid)',
  'Odisha - Paradeep & Puri Corridor',
  'Gujarat - Kutch & Saurashtra Belt',
  'Maharashtra - Mumbai MMR & Konkan',
  'Tamil Nadu - Chennai & Coromandel',
  'Andhra Pradesh - Godavari Delta & Vizag',
  'West Bengal - Sundarbans & Haldia',
  'Kerala - Kochi & Malabar Coast',
  'Karnataka - Mangaluru & Karavali',
  'Goa - Mormugao Port Corridor',
  'Puducherry & Island Union Territories'
];

export default function VarunaAI() {
  const { currentLane, setLaneId } = useCoastalLane();
  const [activeTab, setActiveTab] = useState<'advisory' | 'copilot'>('advisory');
  const [threatLevel, setThreatLevel] = useState<string>('Very High');
  const [focusArea, setFocusArea] = useState<string>(currentLane.name);
  const [copied, setCopied] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [out, setOut] = useState<any>({
    advisory_id: 'ADV-PANINDIA-2026-EXEC',
    threat_level: 'Very High',
    focus_area: currentLane.name,
    priority_actions: [
      `Evacuate vulnerable coastal settlements within 5km of ${currentLane.shortName} shoreline.`,
      "Verify 72h auxiliary diesel fuel reserves across all regional district hospitals.",
      "Deploy modular flood barriers at coastal power switchgears and port substations.",
      "Enforce mandatory traffic diversions on inundated national and state highway sectors."
    ],
    body: `OPERATIONAL DISASTER MANAGEMENT ADVISORY — PAN-INDIA COASTAL DEFENSE
ISSUED BY: VarunaWatch Emergency Resilience & Telemetry Command
TIMESTAMP: 30 Sep 2026 08:30 UTC
THREAT LEVEL: VERY HIGH | TARGET SECTOR: ${currentLane.name.toUpperCase()}

1. METEOROLOGICAL & HAZARD TELEMETRY:
• Active cyclone system tracking along Indian coastal lanes with maximum sustained surface winds of 165 km/h and central barometric pressure of 960 hPa.
• Landfall ETA: ~14 hours targeting the ${currentLane.name} littoral corridor.
• Projected Storm Surge: +3.5m above astronomical tide across estuarine and beachfront zones.
• Aggregate Population Exposed: 3,445,000 citizens across monitored coastal zones.

2. CRITICAL HEALTHCARE, ENERGY & PORT INFRASTRUCTURE PROTOCOLS:
  • Primary District Hospitals: Pre-stage auxiliary emergency diesel fuel and deploy ground-level barriers.
  • Port Power Substations: Erect modular flood barriers around 220kV transformer switchgear.
  • High-Voltage Grid Feeders: Secure uninterrupted power and elevate essential control circuits.

3. TRANSPORTATION & EVACUATION CORRIDORS:
  • National Coastal Expressways & Highways (NH-16 & NH-66): Mandatory heavy-vehicle diversions on low-lying arterial sections.
  • Pre-stage emergency medical ambulances along elevated secondary bypass routes.

4. MANDATORY EARLY ACTION PROTOCOLS (NEXT 6 TO 12 HOURS):
• Finalize evacuation of vulnerable fishing hamlets and non-pucca housing within 5 km of shoreline.
• Ensure continuous 72-hour auxiliary diesel fuel reserves across all district and regional hospitals.
• Pre-position NDRF & State Disaster Response Force (${currentLane.sdrfForce}) swift-water rescue craft.`,
    tool_results: {
      cyclone: {
        name: currentLane.cycloneTrackName,
        category: currentLane.cycloneCategory || 3,
        wind_speed: 165,
        pressure: 960,
        surge_height: 3.5,
        eta_landfall: "~14 hours"
      },
      high_risk_assets: [],
      affected_roads: [],
      population_exposure: 3445000,
    }
  });

  // Sync focusArea when currentLane changes
  useEffect(() => {
    setFocusArea(currentLane.name);
  }, [currentLane]);

  const handleGenerateAdvisory = async (selectedFocus?: string) => {
    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const targetFocus = selectedFocus || focusArea;
    try {
      const json = await apiGenerateAdvisory(threatLevel, targetFocus);
      if (json && (json.content || json.body)) {
        setOut({
          advisory_id: json.id || `ADV-${Date.now()}`,
          threat_level: json.threat_level || threatLevel,
          focus_area: json.focus_area || targetFocus,
          body: json.content || json.body,
          tool_results: json.tool_results || out.tool_results,
          priority_actions: json.priority_actions || [
            `Evacuate vulnerable coastal settlements within 5km of ${targetFocus} shorelines.`,
            "Ensure 72h continuous diesel fuel for all tier-1 hospitals.",
            "Deploy mobile flood barriers at coastal substation switchyards.",
            "Enforce traffic diversions on inundated national and state highway sectors."
          ]
        });
        setSuccessMsg(`Operational Advisory successfully generated for ${targetFocus}`);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error generating advisory');
    } finally {
      setBusy(false);
    }
  };

  const copyAdvisory = () => {
    if (out?.body) {
      navigator.clipboard.writeText(out.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cyclone = out.tool_results?.cyclone || {
    name: currentLane.cycloneTrackName,
    category: currentLane.cycloneCategory || 3,
    wind_speed: 165,
    pressure: 960,
    surge_height: 3.5,
    eta_landfall: "~14 hours"
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="page-title flex items-center gap-2.5 text-cyan-700 dark:text-cyan-400">
            <Bot size={22} />
            Varuna AI — Operational Advisory &amp; Decision Copilot
          </h1>
          <p className="page-sub">
            Pan-India Early Action Protocol Synthesis across 7,516+ km of Indian Coastal Lanes
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('advisory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'advisory'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Operational Advisory</span>
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'copilot'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            <span>Interactive Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'copilot' ? (
        <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
          <CopilotChat initialZone={focusArea} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="card p-5 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Threat Level:
                </label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="field w-full"
                >
                  <option value="Extreme">Extreme (Cat 4–5 Super Cyclone)</option>
                  <option value="Very High">Very High (Cat 3 Severe Cyclone)</option>
                  <option value="High">High (Cat 2 Cyclone)</option>
                  <option value="Moderate">Moderate (Cat 1 / Deep Depression)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Coastal Sector / State Corridor:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    placeholder="e.g. Odisha - Paradeep, Gujarat - Kutch, Mumbai MMR, Coastal AP..."
                    className="field flex-1"
                  />
                  <button
                    onClick={() => handleGenerateAdvisory()}
                    disabled={busy}
                    className="btn-primary"
                  >
                    {busy ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span>Generate Advisory</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick State Corridors */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-2 font-semibold">
                Quick Indian Coastal Corridors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CORRIDORS.map((area) => {
                  const isSelected = focusArea === area;
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        setFocusArea(area);
                        handleGenerateAdvisory(area);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:text-cyan-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-3.5 border-l-4 border-l-cyan-500 flex items-center gap-3">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Wind size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Max Sustained Wind</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{cyclone.wind_speed} km/h</span>
                <span className="text-[10px] text-slate-500 block">Category {cyclone.category}</span>
              </div>
            </div>

            <div className="card p-3.5 border-l-4 border-l-sky-500 flex items-center gap-3">
              <div className="p-2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Waves size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Peak Storm Surge</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">+{cyclone.surge_height || 3.5}m</span>
                <span className="text-[10px] text-slate-500 block">Above tidal baseline</span>
              </div>
            </div>

            <div className="card p-3.5 border-l-4 border-l-rose-500 flex items-center gap-3">
              <div className="p-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Exposed Citizens</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{(out.tool_results?.population_exposure || 3445000).toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">In {out.focus_area || 'Corridor'}</span>
              </div>
            </div>

            <div className="card p-3.5 border-l-4 border-l-amber-500 flex items-center gap-3">
              <div className="p-2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Landfall ETA</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{cyclone.eta_landfall || '~14 hours'}</span>
                <span className="text-[10px] text-slate-500 block">Pressure: {cyclone.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* Priority Actions */}
          <div className="card p-5 space-y-3 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Mandatory Operational Action Directives (T - 12 Hours)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {out.priority_actions.map((act: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Body Document */}
          <div className="card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {out.advisory_id}
                </span>
              </div>
              <button
                onClick={copyAdvisory}
                className="btn-ghost btn-xs text-cyan-600 dark:text-cyan-400"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Full Directive'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-[500px] overflow-y-auto">
              {out.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
