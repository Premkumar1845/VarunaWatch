'use client';

import React from 'react';
import { HazardZone } from '@/lib/api';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

interface ZoneRiskTableProps {
  zones: HazardZone[];
  onSelectZone?: (zone: HazardZone) => void;
}

export const ZoneRiskTable: React.FC<ZoneRiskTableProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <h2 className="card-title">Coastal Sector Risk Matrix (Mandal-Level)</h2>
        </div>
        <span className="text-[11px] font-mono text-[#94A3B8]">{zones.length || 4} Operational Sectors</span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-[180px]">Sector / District</th>
              <th className="w-[130px]">Risk Index</th>
              <th className="w-[120px]">Exposed Pop</th>
              <th className="w-[160px]">Surge & Peak Wind</th>
              <th>Primary Threat Vector</th>
              <th className="w-[180px]">Directive</th>
              <th className="w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => {
              const riskColor = getRiskColor(zone.risk_score);
              const isCritical = zone.risk_score >= 75;
              const exposedPop = zone.population_exposed ?? zone.population ?? 350000;
              const surge = zone.surge_height_m ?? (zone.surge_score ? (zone.surge_score / 30).toFixed(1) : '2.4');
              const wind = zone.peak_wind_kmh ?? 165;
              const vulnText = zone.key_vulnerability ?? 'Low-lying estuarine delta subject to tidal surge';
              const actionText = zone.priority_action ?? (isCritical ? 'Evacuate Coastal Band' : 'Pre-position DG Sets');

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone?.(zone)}
                  className="cursor-pointer"
                >
                  <td className="font-semibold text-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: riskColor }}
                      />
                      <span>{zone.name}</span>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${riskColor}18`,
                          color: riskColor,
                          border: `1px solid ${riskColor}33`,
                        }}
                      >
                        {zone.risk_score}/100
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">{zone.risk_level}</span>
                    </div>
                  </td>

                  <td className="font-mono text-xs text-slate-300">
                    {(exposedPop / 1000).toFixed(0)}k
                  </td>

                  <td>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-sky-400">+{surge}m</span>
                      <span className="text-[#94A3B8]">{wind} km/h</span>
                    </div>
                  </td>

                  <td className="text-xs text-slate-300 max-w-[260px] truncate">
                    {vulnText}
                  </td>

                  <td>
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {actionText}
                    </span>
                  </td>

                  <td className="text-right">
                    <ChevronRight className="w-4 h-4 text-[#64748B] hover:text-sky-400 inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
