'use client';

import React from 'react';
import { InfrastructureAsset } from '@/lib/api';
import { 
  X, 
  Hospital, 
  Zap, 
  Shield, 
  Navigation, 
  MapPin, 
  Fuel, 
  Waves, 
  ArrowUp,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

interface AssetDetailModalProps {
  asset: InfrastructureAsset | null;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  const riskColor = getRiskColor(asset.vulnerability_score);
  const isHospital = asset.type === 'hospital';
  const isPower = asset.type === 'power';
  const isShelter = asset.type === 'shelter';

  const aLat = asset.position?.lat ?? asset.lat ?? 16.9;
  const aLng = asset.position?.lng ?? asset.lng ?? 82.2;
  const elevation = asset.elevation_m ?? (isHospital ? 8 : isPower ? 5 : 12);
  const surgeDepth = asset.surge_flood_depth_m ?? (asset.vulnerability_score > 60 ? 1.4 : 0);
  const backupHours = asset.backup_power_hours ?? (isHospital ? 36 : isPower ? 12 : 24);
  const actionText = asset.action_recommendation ?? asset.recommended_actions?.[0] ?? 'Standard pre-landfall monitoring protocol';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#0E1626] border border-[#1E2E4A] rounded-lg p-5 shadow-xl space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded bg-[#142036] text-[#94A3B8] hover:text-white hover:bg-[#192742] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded border"
            style={{
              backgroundColor: `${riskColor}18`,
              color: riskColor,
              borderColor: `${riskColor}33`,
            }}
          >
            {isHospital && <Hospital className="w-5 h-5" />}
            {isPower && <Zap className="w-5 h-5" />}
            {isShelter && <Shield className="w-5 h-5" />}
            {!isHospital && !isPower && !isShelter && <Navigation className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{asset.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#94A3B8] flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-sky-400" />
                {asset.zone_name} Sector ({aLat.toFixed(3)}°N, {aLng.toFixed(3)}°E)
              </span>
            </div>
          </div>
        </div>

        {/* Vulnerability Score Banner */}
        <div
          className="p-3 rounded border flex items-center justify-between"
          style={{
            backgroundColor: `${riskColor}10`,
            borderColor: `${riskColor}28`,
          }}
        >
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
              Resilience Score
            </span>
            <p className="text-xs font-bold text-slate-100">{asset.risk_level} Threat Tier</p>
          </div>
          <div className="text-right">
            <span
              className="text-2xl font-bold font-mono"
              style={{ color: riskColor }}
            >
              {asset.vulnerability_score}
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">/100</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
            <span className="text-[#94A3B8] block text-[10px]">Ground Elevation</span>
            <span className="font-mono font-semibold text-slate-100 flex items-center gap-1 mt-0.5">
              <ArrowUp className="w-3 h-3 text-sky-400" />
              {elevation}m AMSL
            </span>
          </div>

          <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
            <span className="text-[#94A3B8] block text-[10px]">Surge Flood Depth</span>
            <span
              className={`font-mono font-semibold flex items-center gap-1 mt-0.5 ${
                surgeDepth > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              <Waves className="w-3 h-3" />
              {surgeDepth > 0 ? `+${surgeDepth}m (Flood)` : 'Dry (+0m)'}
            </span>
          </div>

          <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
            <span className="text-[#94A3B8] block text-[10px]">Operational Metric</span>
            <span className="font-mono font-semibold text-sky-300 mt-0.5 block truncate">
              {asset.capacity_metric || (asset.capacity ? `${asset.capacity} units` : 'Standard Unit')}
            </span>
          </div>

          <div className="bg-[#142036] p-2.5 rounded border border-[#1E2E4A]">
            <span className="text-[#94A3B8] block text-[10px]">Backup Generator Fuel</span>
            <span className="font-mono font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
              <Fuel className="w-3 h-3" />
              {backupHours ? `${backupHours}h Remaining` : 'None Installed'}
            </span>
          </div>
        </div>

        {/* Action Directives */}
        <div className="bg-[#0B1220] p-3 rounded border border-[#1E2E4A] space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-bold uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pre-Landfall Action Directive</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {actionText}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#162238]">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Alert dispatched to ${asset.name} Response Unit.`);
              onClose();
            }}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Dispatch Direct Alert
          </button>
        </div>
      </div>
    </div>
  );
};
