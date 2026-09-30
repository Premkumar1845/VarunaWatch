'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { MapPin, ChevronDown, Compass, Check } from 'lucide-react';

interface CoastalLaneSelectorProps {
  compact?: boolean;
}

export const CoastalLaneSelector: React.FC<CoastalLaneSelectorProps> = ({ compact = false }) => {
  const { currentLane, setLaneId, lanes } = useCoastalLane();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium text-xs transition-all shadow-xs"
        aria-label="Select Coastal State / Lane"
      >
        <MapPin size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
        <span className="font-semibold tracking-tight whitespace-nowrap">
          {compact ? currentLane.shortName : currentLane.name}
        </span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-800 dark:text-cyan-200">
          {currentLane.coastline_km} km
        </span>
        <ChevronDown size={14} className={`text-cyan-600 dark:text-cyan-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-84 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 py-2 max-h-[85vh] overflow-y-auto">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Indian Coastal Lanes Grid
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">
                7,516 km
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Select an Indian coastal state or national grid to isolate telemetry, hazard models, and SDRF windows.
            </p>
          </div>

          <div className="py-1">
            {lanes.map((lane) => {
              const isSelected = lane.id === currentLane.id;
              return (
                <button
                  key={lane.id}
                  onClick={() => {
                    setLaneId(lane.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                    isSelected
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate">{lane.name}</span>
                      {isSelected && <Check size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 dark:text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Compass size={10} />
                        {lane.basin}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{lane.coastline_km} km coast</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {lane.id === 'all' ? 'PAN-INDIA' : 'SDRF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
