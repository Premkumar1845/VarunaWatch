'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wind,
  Grid3x3,
  Satellite,
  Bot,
  Bell,
  LayoutDashboard,
  Layers,
  X
} from 'lucide-react';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { BrandLogo } from '@/components/layout/BrandLogo';

const NAV = [
  { href: '/dashboard',      label: 'Command Center',    icon: LayoutDashboard },
  { href: '/storm',          label: 'Storm Intelligence', icon: Wind },
  { href: '/infrastructure', label: 'ImpactGrid',         icon: Grid3x3 },
  { href: '/stormtwin',      label: 'Scenarios',          icon: Layers },
  { href: '/ai',             label: 'Varuna AI',          icon: Bot },
  { href: '/satellite',      label: 'VarunaVision',       icon: Satellite },
  { href: '/advisories',     label: 'Sentinel',           icon: Bell },
];

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu } = useCoastalLane();

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header / Logo */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-2 py-2 group"
            >
              <BrandLogo size={34} glow={true} />
              <div>
                <div className="text-slate-900 dark:text-slate-100 font-bold text-base tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  VarunaWatch
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  Pan-India Defense
                </div>
              </div>
            </Link>

            {/* Close button on mobile */}
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close navigation sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-2">
            {NAV.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Live Status */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>System Status</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
