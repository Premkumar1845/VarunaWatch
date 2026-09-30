'use client';

import React, { useState } from 'react';
import { InfrastructureAsset } from '@/lib/api';
import { 
  Building2, 
  Hospital, 
  Zap, 
  Shield, 
  Navigation, 
  Search, 
  Fuel, 
  ExternalLink 
} from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

interface InfrastructureMatrixProps {
  assets: InfrastructureAsset[];
  onSelectAsset?: (asset: InfrastructureAsset) => void;
}

export const InfrastructureMatrix: React.FC<InfrastructureMatrixProps> = ({
  assets,
  onSelectAsset,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minRisk, setMinRisk] = useState<number>(0);

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.zone_name && asset.zone_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = asset.vulnerability_score >= minRisk;
    return matchesType && matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#162238]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-sky-400" />
              <h1 className="text-base font-bold text-white">Critical Infrastructure Resilience Matrix</h1>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Real-time vulnerability audits of hospitals, power grid substations, evacuation centers, and bridges.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets or zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#142036] border border-[#1E2E4A] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-[#64748B] focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Assets', icon: Building2 },
              { id: 'hospital', label: 'Hospitals', icon: Hospital },
              { id: 'power', label: 'Substations', icon: Zap },
              { id: 'shelter', label: 'Shelters', icon: Shield },
              { id: 'bridge', label: 'Bridges / Roads', icon: Navigation },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'bg-[#142036] text-[#94A3B8] border border-[#1E2E4A] hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Severity Quick Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#94A3B8]">Threat Level:</span>
            <button
              onClick={() => setMinRisk(0)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                minRisk === 0 ? 'bg-[#1E2E4A] text-white' : 'bg-[#142036] text-[#94A3B8]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setMinRisk(50)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                minRisk === 50 ? 'bg-amber-500 text-slate-950' : 'bg-[#142036] text-amber-400'
              }`}
            >
              &ge;50 HIGH
            </button>
            <button
              onClick={() => setMinRisk(70)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                minRisk === 70 ? 'bg-rose-500 text-white' : 'bg-[#142036] text-rose-400'
              }`}
            >
              &ge;70 CRITICAL
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAssets.map((asset) => {
          const riskColor = getRiskColor(asset.vulnerability_score);
          const isHospital = asset.type === 'hospital';
          const isPower = asset.type === 'power';
          const isShelter = asset.type === 'shelter';

          const elevation = asset.elevation_m ?? (asset.type === 'hospital' ? 8 : asset.type === 'power' ? 5 : 12);
          const surgeDepth = asset.surge_flood_depth_m ?? (asset.vulnerability_score > 60 ? 1.4 : 0);
          const backupHours = asset.backup_power_hours ?? (isHospital ? 36 : isPower ? 12 : 24);
          const actionText = asset.action_recommendation ?? asset.recommended_actions?.[0] ?? 'Standard pre-landfall monitoring protocol';

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset?.(asset)}
              className="card p-3.5 hover:border-sky-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded"
                      style={{
                        backgroundColor: `${riskColor}18`,
                        color: riskColor,
                        border: `1px solid ${riskColor}33`,
                      }}
                    >
                      {isHospital && <Hospital className="w-3.5 h-3.5" />}
                      {isPower && <Zap className="w-3.5 h-3.5" />}
                      {isShelter && <Shield className="w-3.5 h-3.5" />}
                      {!isHospital && !isPower && !isShelter && <Navigation className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                        {asset.name}
                      </h3>
                      <span className="text-[10px] text-[#94A3B8] font-mono uppercase">
                        {asset.zone_name} Sector
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div
                    className="font-mono font-bold text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${riskColor}18`,
                      color: riskColor,
                      border: `1px solid ${riskColor}33`,
                    }}
                  >
                    {asset.vulnerability_score}/100
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-[#142036] rounded border border-[#1E2E4A] text-[11px]">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Elevation</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {elevation}m AMSL
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Surge Water Delta</span>
                    <span
                      className={`font-mono font-semibold ${
                        surgeDepth > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {surgeDepth > 0 ? `+${surgeDepth}m (Flood)` : 'Dry (+0m)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Capacity</span>
                    <span className="font-mono font-semibold text-sky-300 truncate block">
                      {asset.capacity_metric || (asset.capacity ? `${asset.capacity} units` : 'Standard')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">Backup Power</span>
                    <span className="font-mono font-semibold text-slate-200 flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-amber-400" />
                      {backupHours ? `${backupHours}h` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Directive */}
              <div className="pt-2 border-t border-[#162238] flex items-center justify-between">
                <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                  {actionText}
                </p>
                <ExternalLink className="w-3 h-3 text-[#64748B] group-hover:text-sky-400 flex-shrink-0 ml-1.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
