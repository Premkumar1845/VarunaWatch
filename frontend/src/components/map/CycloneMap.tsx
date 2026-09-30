'use client';

import React, { useRef, useState } from 'react';
import { CycloneForecast, HazardZone, InfrastructureAsset, RoadSegment } from '@/lib/api';
import { 
  Wind, 
  Waves, 
  Hospital, 
  Zap, 
  Shield, 
  Navigation,
  Info
} from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

import { useCoastalLane } from '@/context/CoastalLaneContext';

interface CycloneMapProps {
  forecast?: CycloneForecast | null;
  hazardZones?: HazardZone[];
  assets?: InfrastructureAsset[];
  roads?: RoadSegment[];
  onSelectAsset?: (asset: InfrastructureAsset) => void;
  onSelectZone?: (zone: HazardZone) => void;
}

export const CycloneMap: React.FC<CycloneMapProps> = ({
  forecast,
  hazardZones = [],
  assets = [],
  roads = [],
  onSelectAsset,
  onSelectZone,
}) => {
  const { currentLane } = useCoastalLane();
  const [activeLayers, setActiveLayers] = useState({
    track: true,
    cone: true,
    inundation: true,
    hospitals: true,
    power: true,
    shelters: true,
    roads: true,
  });

  const [selectedItem, setSelectedItem] = useState<{
    type: 'asset' | 'zone' | 'cyclone';
    data: any;
  } | null>(null);

  // Region Bounds from active Coastal Lane
  const [minLng, minLat, maxLng, maxLat] = currentLane.bounds || [80.0, 14.0, 84.5, 18.5];

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentEye = forecast?.cyclone
    ? {
        lat: forecast.cyclone.position?.lat ?? forecast.cyclone.current_lat ?? currentLane.center[1],
        lng: forecast.cyclone.position?.lng ?? forecast.cyclone.current_lng ?? currentLane.center[0],
      }
    : { lat: currentLane.center[1], lng: currentLane.center[0] };

  const eyeCoord = project(currentEye.lat, currentEye.lng);

  return (
    <div className="relative w-full h-[500px] lg:h-[580px] bg-[#070B14] rounded-lg overflow-hidden border border-[#162238] flex flex-col">
      {/* Top Map Header */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0E1626]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1E2E4A]">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-200 tracking-wider font-mono uppercase">
          Tactical Grid: {currentLane.name}
        </span>
      </div>

      {/* Layer Controls Top Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap max-w-[320px] gap-1 justify-end">
        {[
          { key: 'cone' as const, label: 'Cone', icon: Wind, color: 'text-amber-400' },
          { key: 'inundation' as const, label: 'Surge', icon: Waves, color: 'text-sky-400' },
          { key: 'hospitals' as const, label: 'Med', icon: Hospital, color: 'text-rose-400' },
          { key: 'power' as const, label: 'Grid', icon: Zap, color: 'text-amber-400' },
          { key: 'shelters' as const, label: 'Shelters', icon: Shield, color: 'text-emerald-400' },
          { key: 'roads' as const, label: 'Roads', icon: Navigation, color: 'text-sky-400' },
        ].map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayers[layer.key];
          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                isActive
                  ? 'bg-[#192742] text-slate-100 border-sky-500/40 shadow-xs'
                  : 'bg-[#0E1626]/80 text-[#64748B] border-[#1E2E4A] hover:text-slate-300'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? layer.color : 'text-slate-500'}`} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Canvas/SVG Grid */}
      <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-gradient-to-b from-[#080E1B] to-[#04070D]">
        {/* Subtle Grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
          <defs>
            <pattern id="tactical-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#38BDF8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
        </svg>

        {/* Coastline and Track */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Bay of Bengal Shoreline */}
          <path
            d="M 62% 0% Q 46% 35% 36% 65% T 22% 100% L 100% 100% L 100% 0% Z"
            fill="rgba(8, 24, 48, 0.4)"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Forecast Cone */}
          {activeLayers.cone && (
            <polygon
              points={`${eyeCoord.x}%,${eyeCoord.y}% 25%,45% 32%,75% 50%,80%`}
              fill="rgba(244, 63, 94, 0.08)"
              stroke="rgba(245, 158, 11, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
          )}

          {/* Cyclone Track */}
          {activeLayers.track && (
            <polyline
              points={`85%,25% 72%,38% 58%,52% ${eyeCoord.x}%,${eyeCoord.y}% 28%,62% 20%,70%`}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Road Network Lines */}
          {activeLayers.roads &&
            roads.map((road) => {
              const startLat = road.start_lat ?? (Array.isArray(road.geometry?.coordinates) && road.geometry.coordinates[0]?.[1]) ?? 16.9;
              const startLng = road.start_lng ?? (Array.isArray(road.geometry?.coordinates) && road.geometry.coordinates[0]?.[0]) ?? 82.2;
              const endLat = road.end_lat ?? (Array.isArray(road.geometry?.coordinates) && road.geometry.coordinates[1]?.[1]) ?? 16.7;
              const endLng = road.end_lng ?? (Array.isArray(road.geometry?.coordinates) && road.geometry.coordinates[1]?.[0]) ?? 82.5;

              const start = project(startLat, startLng);
              const end = project(endLat, endLng);
              const isBlocked = road.accessibility === 'Likely Blocked';
              const isHigh = road.risk_score >= 50;
              const strokeColor = isBlocked ? '#F43F5E' : isHigh ? '#F97316' : '#10B981';

              return (
                <line
                  key={road.id}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isBlocked ? '3' : '1.5'}
                  strokeDasharray={isBlocked ? '3 2' : 'none'}
                />
              );
            })}
        </svg>

        {/* Hazard Inundation Polygons (Zones) */}
        {activeLayers.inundation &&
          hazardZones.map((zone) => {
            const zLat = zone.center?.lat ?? zone.lat ?? 16.9;
            const zLng = zone.center?.lng ?? zone.lng ?? 82.2;
            const center = project(zLat, zLng);
            const riskCol = getRiskColor(zone.risk_score);
            return (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedItem({ type: 'zone', data: zone });
                  onSelectZone?.(zone);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105 z-10"
                style={{ left: `${center.x}%`, top: `${center.y}%` }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border"
                  style={{
                    background: `radial-gradient(circle, ${riskCol}22 0%, ${riskCol}02 70%)`,
                    borderColor: `${riskCol}44`,
                  }}
                >
                  <div className="bg-[#0E1626]/90 px-2 py-0.5 rounded border border-[#1E2E4A] shadow-sm flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-slate-200 uppercase whitespace-nowrap">
                      {zone.name}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color: riskCol }}
                    >
                      {zone.risk_score}/100
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Infrastructure Asset Markers */}
        {assets.map((asset) => {
          if (asset.type === 'hospital' && !activeLayers.hospitals) return null;
          if (asset.type === 'power' && !activeLayers.power) return null;
          if (asset.type === 'shelter' && !activeLayers.shelters) return null;
          if (asset.type === 'bridge' && !activeLayers.roads) return null;

          const aLat = asset.position?.lat ?? asset.lat ?? 16.9;
          const aLng = asset.position?.lng ?? asset.lng ?? 82.2;
          const pos = project(aLat, aLng);

          return (
            <div
              key={asset.id}
              onClick={() => {
                setSelectedItem({ type: 'asset', data: asset });
                onSelectAsset?.(asset);
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={`p-1 rounded flex items-center justify-center border shadow-xs transition-transform group-hover:scale-115 ${
                  asset.type === 'hospital'
                    ? 'bg-rose-950/80 border-rose-500/60 text-rose-400'
                    : asset.type === 'power'
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                    : asset.type === 'shelter'
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                    : 'bg-sky-950/80 border-sky-500/60 text-sky-400'
                }`}
              >
                {asset.type === 'hospital' && <Hospital className="w-3.5 h-3.5" />}
                {asset.type === 'power' && <Zap className="w-3.5 h-3.5" />}
                {asset.type === 'shelter' && <Shield className="w-3.5 h-3.5" />}
                {asset.type === 'bridge' && <Navigation className="w-3.5 h-3.5" />}
              </div>

              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-[#0E1626] border border-[#1E2E4A] px-2 py-1 rounded text-[10px] text-slate-100 whitespace-nowrap shadow-md z-30">
                <p className="font-semibold">{asset.name}</p>
                <p className="text-sky-400 font-mono">Vuln: {asset.vulnerability_score}/100</p>
              </div>
            </div>
          );
        })}

        {/* Cyclone Eye */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          style={{ left: `${eyeCoord.x}%`, top: `${eyeCoord.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-rose-500 opacity-30"></span>
            <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white text-[9px] shadow-sm">
              🌀
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0E1626] border-t border-[#162238] px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-[#94A3B8]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Severe (&gt;75)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>High (50-74)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Shelter / Secure (&lt;50)</span>
          </div>
        </div>

        {selectedItem && (
          <div className="flex items-center gap-2 bg-[#142036] px-2 py-0.5 rounded border border-[#1E2E4A] text-slate-200">
            <Info className="w-3 h-3 text-sky-400" />
            <span className="font-semibold text-sky-300">
              {selectedItem.type === 'asset' ? selectedItem.data.name : selectedItem.data.name + ' Sector'}
            </span>
            <span className="text-[#94A3B8] font-mono">
              Score: {selectedItem.data.vulnerability_score || selectedItem.data.risk_score}/100
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
