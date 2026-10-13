'use client';

import Link from 'next/link';
import {
  Wind, BrainCircuit, MapPinned, ArrowRight, Radio, ShieldAlert, Globe, Compass, ShieldCheck, Activity, Bell, Layers
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { CycloneBackground } from '@/components/effects/CycloneBackground';

const FEATURES = [
  {
    icon: Wind,
    title: 'StormTwin Sandbox',
    desc: 'Category 1–5 digital twin scenarios with deterministic asset impact deltas across all 9 Indian coastal states in real-time.',
    badge: 'Simulation Engine',
    link: '/stormtwin',
  },
  {
    icon: BrainCircuit,
    title: 'Varuna AI Decision Copilot',
    desc: 'Automated operational advisories, district collector SOPs, and telemetry-grounded intelligence for all Indian coastal sectors.',
    badge: 'Advisory Engine',
    link: '/ai',
  },
  {
    icon: MapPinned,
    title: 'ImpactGrid Asset Register',
    desc: 'Every hospital, substation, port terminal, shelter, and bridge scored 0–100 with comprehensive multi-hazard vulnerability assessment.',
    badge: 'Asset Register',
    link: '/infrastructure',
  },
  {
    icon: Bell,
    title: 'Parametric Sentinel',
    desc: 'Zero-friction parametric trigger detection & automated pre-approved SDRF/NDRF liquidity disbursements before landfall.',
    badge: 'Financing Engine',
    link: '/advisories',
  },
  {
    icon: Compass,
    title: 'Storm Intelligence',
    desc: 'Dual-basin storm tracking across Bay of Bengal and Arabian Sea with live radar Doppler and barometric pressure feeds.',
    badge: 'Radar Tracking',
    link: '/storm',
  },
  {
    icon: Activity,
    title: 'VarunaVision GIS',
    desc: 'Multi-layer spatial GIS overlay integrating high-voltage power grids, highway bottlenecks, and storm surge inundation zones.',
    badge: 'Geospatial Grid',
    link: '/satellite',
  },
];

const COASTAL_STATES = [
  { name: 'Gujarat', km: 1600, basin: 'Arabian Sea' },
  { name: 'Tamil Nadu', km: 1076, basin: 'Bay of Bengal' },
  { name: 'Andhra Pradesh', km: 974, basin: 'Bay of Bengal' },
  { name: 'Maharashtra', km: 720, basin: 'Arabian Sea' },
  { name: 'Kerala', km: 590, basin: 'Arabian Sea' },
  { name: 'Odisha', km: 480, basin: 'Bay of Bengal' },
  { name: 'Karnataka', km: 320, basin: 'Arabian Sea' },
  { name: 'West Bengal', km: 157, basin: 'Bay of Bengal' },
  { name: 'Goa', km: 101, basin: 'Arabian Sea' },
  { name: 'UTs & Islands', km: 1000, basin: 'Pan-India' },
];

export default function Landing() {
  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center overflow-hidden transition-colors duration-200">
      {/* ── Realistic Interactive Cyclone & Breeze Motion Canvas Background ── */}
      <CycloneBackground density={80} speedMultiplier={1.1} interactive={true} />

      {/* Hero Container with backdrop polish */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* Brand Logo with cyan atmospheric glow */}
        <div className="mb-5 transform hover:scale-105 transition-transform duration-300">
          <BrandLogo size={80} glow={true} />
        </div>

        {/* Hero Badge */}
        <span className="badge-accent gap-2 mb-4 text-xs font-semibold px-3.5 py-1.5 shadow-sm border border-cyan-500/30">
          <Radio size={13} className="animate-pulse text-cyan-500" />
          <span>PAN-INDIA PARAMETRIC CYCLONE INTELLIGENCE SYSTEM</span>
        </span>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          VarunaWatch
        </h1>

        {/* Hero Tagline */}
        <p className="mt-3 text-xl sm:text-2xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl">
          Intelligence Before Impact.
        </p>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          AI-powered early warning &amp; infrastructure resilience engine safeguarding all <strong className="text-slate-800 dark:text-slate-200">9 Indian Coastal States &amp; Union Territories</strong> across <strong className="text-cyan-600 dark:text-cyan-400 font-mono">7,516+ km</strong> of littoral corridors.
        </p>

        {/* Indian Coastal States Strip */}
        <div className="mt-7 flex flex-wrap gap-2 justify-center max-w-4xl">
          {COASTAL_STATES.map((st) => (
            <span
              key={st.name}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs hover:border-cyan-500/50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-semibold">{st.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({st.km} km)</span>
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-3.5 justify-center">
          <Link href="/dashboard" className="btn-primary px-6 py-3 text-sm shadow-md">
            <span>Launch Command Center</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/infrastructure" className="btn-ghost px-5 py-3 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <MapPinned size={17} className="text-cyan-600 dark:text-cyan-400" />
            <span>ImpactGrid Assets</span>
          </Link>
          <Link href="/ai" className="btn-ghost px-5 py-3 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <BrainCircuit size={17} className="text-cyan-600 dark:text-cyan-400" />
            <span>Varuna AI Copilot</span>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl w-full text-left">
        {FEATURES.map(({ icon: Icon, title, desc, badge, link }) => (
          <div
            key={title}
            className="card p-6 flex flex-col justify-between hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all hover:shadow-lg backdrop-blur-md bg-white/85 dark:bg-[#111827]/85 border border-slate-200 dark:border-slate-800 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700 group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <span className="badge-neutral font-mono text-[10px]">{badge}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>

            <Link
              href={link}
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold group/link"
            >
              <span>Explore module</span>
              <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
