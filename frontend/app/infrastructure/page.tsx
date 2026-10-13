'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  Grid3x3, 
  Search, 
  SlidersHorizontal, 
  Activity, 
  X, 
  Building2, 
  Zap, 
  ShieldAlert, 
  Hospital,
  Compass,
  MapPin
} from 'lucide-react';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { COASTAL_LANES } from '@/lib/coastalLanes';

const BAND_COLOR: Record<string, string> = {
  Low: 'band-low',
  Moderate: 'band-mod',
  High: 'band-high',
  'Very High': 'band-veryhigh',
  Extreme: 'band-extreme',
};

const CATEGORY_ICONS: Record<string, any> = {
  hospital: Hospital,
  substation: Zap,
  power: Zap,
  bridge: Compass,
  shelter: ShieldAlert,
  school: Building2,
};

export default function ImpactGrid() {
  const { currentLane, setLaneId } = useCoastalLane();
  const [assets, setAssets] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<'risk_score' | 'name' | 'category'>('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const stateParam = currentLane.id;
    fetch(`/api/infrastructure?state=${stateParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.assets && data.assets.length > 0) {
          const mapped = data.assets.map((a: any) => ({
            id: a.id,
            name: a.name,
            category: a.type || 'hospital',
            risk_score: a.vulnerability_score,
            risk_band: a.risk_level || 'High',
            status: a.status || 'Operational',
            state_name: a.state_name || 'Coastal State',
            district: a.district || a.zone_name || 'Coastal District',
            zone_name: a.zone_name || 'Coastal Sector',
            criticality: a.criticality ?? 1.0,
            capacity: a.capacity,
            factors: {
              flood: a.flood_exposure ?? 75,
              wind: a.wind_exposure ?? 70,
              surge: a.surge_exposure ?? 65,
              accessibility: a.accessibility_risk ?? 60,
              criticality: Math.round((a.criticality ?? 0.8) * 100),
            },
            recommended_actions: a.recommended_actions || ['Maintain continuous telemetry monitoring and secure emergency fuel'],
          }));
          setAssets(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentLane.id]);

  const filtered = assets
    .filter((a) => {
      const matchCat = filterCat === 'all' || a.category === filterCat || (filterCat === 'substation' && a.category === 'power');
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                          (a.state_name && a.state_name.toLowerCase().includes(search.toLowerCase())) ||
                          (a.district && a.district.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      let res = 0;
      if (sortKey === 'risk_score') res = b.risk_score - a.risk_score;
      else res = a[sortKey].localeCompare(b[sortKey]);
      return sortAsc ? -res : res;
    });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="page-title flex items-center gap-2.5 text-cyan-700 dark:text-cyan-400">
            <Grid3x3 size={22} />
            ImpactGrid — Asset Risk Register
          </h1>
          <p className="page-sub">
            Real-time multi-hazard vulnerability assessment across <strong className="text-slate-900 dark:text-slate-200">{currentLane.name}</strong> ({currentLane.coastline_km} km)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State filter */}
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

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9 w-44 sm:w-52"
            />
          </div>

          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="field capitalize"
          >
            <option value="all">All Categories</option>
            <option value="hospital">Hospitals</option>
            <option value="power">Substations & Power</option>
            <option value="bridge">Bridges</option>
            <option value="shelter">Shelters</option>
          </select>

          <button
            onClick={() => {
              if (sortKey === 'risk_score') setSortAsc(!sortAsc);
              else {
                setSortKey('risk_score');
                setSortAsc(false);
              }
            }}
            className="btn-ghost btn-sm"
          >
            <SlidersHorizontal size={14} />
            <span>Sort: {sortKey === 'risk_score' ? 'Risk' : 'Name'} {sortAsc ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {/* Asset Count & Band Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Registered Assets</span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{filtered.length}</span>
        </div>
        <div className="card p-3 flex items-center justify-between border-l-4 border-l-red-500">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Extreme Risk (≥80)</span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {filtered.filter((a) => a.risk_score >= 80).length}
          </span>
        </div>
        <div className="card p-3 flex items-center justify-between border-l-4 border-l-orange-500">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Very High Risk (60-80)</span>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {filtered.filter((a) => a.risk_score >= 60 && a.risk_score < 80).length}
          </span>
        </div>
        <div className="card p-3 flex items-center justify-between border-l-4 border-l-cyan-500">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitored Coastline</span>
          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{currentLane.coastline_km} km</span>
        </div>
      </div>

      {/* Asset Table / Cards Grid */}
      <div className="card overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium">
                <th className="p-3.5">Asset &amp; Facility</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">State / District</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Vulnerability Band</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((asset) => {
                const Icon = CATEGORY_ICONS[asset.category] || Hospital;
                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shrink-0">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {asset.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {asset.zone_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 capitalize font-medium text-slate-600 dark:text-slate-300">
                      {asset.category === 'power' ? 'Substation' : asset.category}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{asset.state_name}</div>
                      <div className="text-[10px] text-slate-400">{asset.district}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {asset.risk_score}
                      <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                    </td>
                    <td className="p-3.5">
                      <span className={BAND_COLOR[asset.risk_band] || 'band-mod'}>
                        {asset.risk_band}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="btn-ghost btn-xs text-cyan-600 dark:text-cyan-400">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <Dialog.Root open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl z-50 space-y-5 animate-scale-up">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge-accent mb-1">{selectedAsset.state_name} Corridor</span>
                  <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedAsset.name}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    District: {selectedAsset.district} · Zone: {selectedAsset.zone_name}
                  </Dialog.Description>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Risk Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Vulnerability Score</span>
                  <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    {selectedAsset.risk_score} <span className="text-xs text-slate-400">/100</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Threat Band</span>
                  <span className={BAND_COLOR[selectedAsset.risk_band] || 'band-mod'}>
                    {selectedAsset.risk_band}
                  </span>
                </div>
              </div>

              {/* Multi-hazard factors */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Deterministic Exposure Weights
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">Inundation Exposure:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAsset.factors?.flood}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">Storm Surge Depth:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAsset.factors?.surge}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">Wind Load Exposure:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAsset.factors?.wind}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">Road Isolation Risk:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAsset.factors?.accessibility}%</span>
                  </div>
                </div>
              </div>

              {/* Action Protocol */}
              <div className="p-3.5 rounded-lg bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs space-y-1">
                <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                  <Activity size={14} />
                  <span>Mandatory Mitigation Protocol</span>
                </div>
                <p className="text-cyan-900 dark:text-cyan-200 leading-relaxed">
                  {Array.isArray(selectedAsset.recommended_actions) ? selectedAsset.recommended_actions[0] : selectedAsset.recommended_actions}
                </p>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
