'use client';

import React from 'react';
import { 
  Activity, 
  Layers, 
  Building2, 
  Bot, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

export type NavTab = 'overview' | 'stormtwin' | 'infrastructure' | 'sentinel' | 'copilot' | 'apiguide';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Command', icon: Activity },
    { id: 'stormtwin' as NavTab, label: 'StormTwin', icon: Layers },
    { id: 'infrastructure' as NavTab, label: 'Assets', icon: Building2 },
    { id: 'sentinel' as NavTab, label: 'Triggers', icon: ShieldCheck },
    { id: 'copilot' as NavTab, label: 'Copilot', icon: Bot },
    { id: 'apiguide' as NavTab, label: 'API Keys', icon: HelpCircle },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Icon */}
      <div className="sidebar-logo">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
          V
        </div>
      </div>

      {/* Nav Buttons */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Indicator */}
      <div className="mt-auto flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity pb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] font-mono text-[#64748B]">ONLINE</span>
      </div>
    </aside>
  );
};
