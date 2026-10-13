'use client';

import React from 'react';
import { CycloneStatus } from '@/lib/api';
import { Radio, Wind, Compass, Clock, MapPin } from 'lucide-react';

interface HeaderProps {
  cyclone?: CycloneStatus | null;
  activeScenario?: number;
  onScenarioChange?: (cat: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cyclone,
  activeScenario = 3,
  onScenarioChange,
}) => {
  const windSpeed = cyclone?.wind_speed ?? cyclone?.max_wind_kmh ?? 165;
  const speedOfMovement = cyclone?.speed_of_movement ?? cyclone?.movement_speed_kmh ?? 16;
  const heading = cyclone?.direction ?? cyclone?.heading ?? 'WNW';
  const categoryName = cyclone?.category_name ?? `Category ${cyclone?.category ?? activeScenario} Severe`;
  const etaText = cyclone?.eta_landfall ?? `${cyclone?.hours_to_landfall ?? 14}h`;

  return (
    <header className="status-bar">
      {/* Left: Live status & storm name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            LIVE SURVEILLANCE
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#1E2E4A]" />

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#142036] border border-[#1E2E4A] text-slate-200">
            {cyclone?.name || 'CYCLONE VARUNA'}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Center: Structured Telemetry */}
      <div className="hidden lg:flex items-center gap-6 text-[12px] text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-sky-400" />
          <span>Max Winds:</span>
          <span className="font-mono font-semibold text-slate-100">{windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Movement:</span>
          <span className="font-mono font-semibold text-slate-100">{speedOfMovement} km/h ({heading})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Landfall Est:</span>
          <span className="font-mono font-semibold text-amber-300">T - {etaText}</span>
        </div>
      </div>

      {/* Right: Category Selector & Region */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0B1220] p-1 rounded-md border border-[#1E2E4A]">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase px-1.5">Intensity:</span>
          {[1, 2, 3, 4, 5].map((cat) => (
            <button
              key={cat}
              onClick={() => onScenarioChange?.(cat)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition-colors ${
                activeScenario === cat
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-[#94A3B8] hover:text-slate-100 hover:bg-[#142036]'
              }`}
            >
              C{cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E1626] border border-[#1E2E4A] text-[11px] font-mono text-sky-300">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span>ANDHRA COAST</span>
        </div>
      </div>
    </header>
  );
};
