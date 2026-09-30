'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ShieldCheck, Clock, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getAlerts } from '@/lib/api';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { CoastalLaneSelector } from '@/components/layout/CoastalLaneSelector';
import { ParametricSentinel } from '@/components/sentinel/ParametricSentinel';

export default function Advisories() {
  const { currentLane } = useCoastalLane();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getAlerts(currentLane.id)
      .then((data) => {
        const rows = data?.alerts;
        if (Array.isArray(rows) && rows.length > 0) {
          setHistory(rows.map((a: any) => ({
            id: a.id,
            threat_level: a.title,
            body: a.message,
            zone: a.zone,
            source: 'gemini',
            created_at: a.timestamp,
          })));
        }
      })
      .catch(() => {});
  }, [currentLane.id]);

  const TRIGGERS = [
    { label: 'Wind Velocity Trigger (≥ 120 km/h)', active: true, value: '165 km/h', district: `${currentLane.keyDistricts[0] || 'Coastal Corridor'}` },
    { label: '24h Precipitation Surge (≥ 100 mm)', active: true, value: '265 mm', district: `${currentLane.keyDistricts[1] || 'Littoral Basin'}` },
    { label: 'Coastal Storm Surge (≥ 2.0 m)', active: true, value: '+3.5 m', district: `${currentLane.keyPorts[0] || 'Port Terminal'}` },
    { label: 'Power Grid Feeder Risk (≥ 70)', active: true, value: '84.5', district: `${currentLane.shortName} Grid Substation` },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="page-title flex items-center gap-2.5 text-cyan-700 dark:text-cyan-400">
            <Bell size={22} />
            Sentinel — Pan-India Early Warning &amp; Parametric Triggers
          </h1>
          <p className="page-sub">
            Automated multi-hazard threshold detection &amp; pre-approved disaster liquidity release for <strong className="text-slate-900 dark:text-slate-200">{currentLane.name}</strong>
          </p>
        </div>

        <CoastalLaneSelector />
      </div>

      {/* Embedded High-Fidelity Parametric Sentinel Component */}
      <ParametricSentinel />

      {/* Active State Parametric Triggers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title uppercase tracking-wide flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <AlertTriangle size={16} className="text-amber-500" />
            <span>Active Parametric Alert Triggers ({currentLane.shortName})</span>
          </h2>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
            {currentLane.sdrfForce}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRIGGERS.map((t) => (
            <div
              key={t.label}
              className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-amber-200 dark:border-amber-900/60 flex items-center justify-between shadow-xs"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Corridor: {t.district}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">{t.value}</div>
                <span className="band-extreme uppercase text-[10px]">TRIGGERED</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Timeline */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="section-title uppercase tracking-wide flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Clock size={16} className="text-cyan-600 dark:text-cyan-400" />
            <span>State Emergency Dispatch &amp; Alert History</span>
          </h2>
          <Link href="/ai" className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium flex items-center gap-1">
            Generate state SOP advisory &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {history.map((adv) => (
            <div
              key={adv.id}
              className="card p-5 space-y-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                  {adv.threat_level}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(adv.created_at || Date.now()).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {adv.body}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                <span>Corridor: {adv.zone || currentLane.name}</span>
                <span>·</span>
                <span>Engine: Deterministic PostGIS / Varuna AI</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
