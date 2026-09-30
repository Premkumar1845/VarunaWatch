'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Bot, Waves, Shield, Activity, Radio, MapPin } from 'lucide-react';
import { useCoastalLane } from '@/context/CoastalLaneContext';

export const SystemInfoDrawer: React.FC = () => {
  const { isInfoOpen, setIsInfoOpen, currentLane } = useCoastalLane();

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInfoOpen) {
        setIsInfoOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInfoOpen, setIsInfoOpen]);

  return (
    <AnimatePresence>
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsInfoOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    System Intelligence Specs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Engine &amp; Telemetry Status
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsInfoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-6 flex-1 text-sm">
              {/* Active Sector Quick Summary */}
              <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-800 dark:text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-cyan-500" />
                    Active Sector
                  </span>
                  <span className="font-mono text-[11px] bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-800 dark:text-cyan-200">
                    {currentLane.id.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                  {currentLane.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex justify-between pt-1 border-t border-cyan-200/60 dark:border-cyan-800/40">
                  <span>Coastline Length:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentLane.coastline_km} km</strong>
                </div>
              </div>

              {/* System Specs List */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  Core Technical Architecture
                </h4>

                {/* Coastline Lanes */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="p-2 rounded bg-indigo-500/10 text-indigo-500 shrink-0">
                    <Waves size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Coastline Lanes Coverage
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex justify-between">
                      <span>9 States + UTs</span>
                      <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">7,516+ km</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu, AP, Odisha, WB &amp; UTs.
                    </div>
                  </div>
                </div>

                {/* Model Engine */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-500 shrink-0">
                    <Activity size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Hydrodynamic Model Engine
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex justify-between">
                      <span>Deterministic v2.0</span>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">60 FPS Hydro</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Calculates storm surge, tidal coincidence, and coastal road accessibility.
                    </div>
                  </div>
                </div>

                {/* AI Advisory */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="p-2 rounded bg-cyan-500/10 text-cyan-500 shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      AI Reasoning &amp; Advisory Engine
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex justify-between">
                      <span>Gemini 2.0 Flash</span>
                      <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Generates real-time multilingual SMS bulletins, evacuation plans &amp; advisories.
                    </div>
                  </div>
                </div>

                {/* Telemetry Status */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Radio size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Telemetry &amp; Earth Observation
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex justify-between">
                      <span>Sentinel-1 SAR / Open-Meteo</span>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Live Sync</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      High-frequency satellite microwave radar &amp; surface telemetry ingestion.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-center text-slate-500 dark:text-slate-400 font-mono">
              VarunaWatch v2.4 · Pan-India Coastal Intelligence
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
