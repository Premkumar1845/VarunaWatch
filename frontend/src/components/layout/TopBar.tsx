'use client';

import React from 'react';
import { Wifi, Globe, Shield, SlidersHorizontal, Menu, X } from 'lucide-react';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { CoastalLaneSelector } from './CoastalLaneSelector';

export const TopBar: React.FC = () => {
  const { currentLane, toggleInfo, isInfoOpen, isMobileMenuOpen, toggleMobileMenu } = useCoastalLane();

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md shrink-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle button (visible < lg) */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <CoastalLaneSelector />
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Globe size={13} className="text-cyan-500 shrink-0" />
          <span className="font-mono text-[11px] truncate max-w-xs xl:max-w-md">
            {currentLane.spatialDomain}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          <Shield size={12} className="text-cyan-500 shrink-0" />
          <span className="truncate max-w-[180px] xl:max-w-[240px]">{currentLane.sdrfForce}</span>
        </div>

        <button
          onClick={toggleInfo}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isInfoOpen
              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
          title="Open System Architecture & Engine Details"
        >
          <SlidersHorizontal size={14} className={isInfoOpen ? 'text-white' : 'text-cyan-500'} />
          <span className="hidden sm:inline">Engine Specs</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
          <Wifi size={13} className="animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase">Live</span>
        </div>
      </div>
    </header>
  );
};
