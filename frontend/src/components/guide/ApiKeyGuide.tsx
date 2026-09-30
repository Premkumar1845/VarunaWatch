'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Database, 
  Globe, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ApiKeyGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const services = [
    {
      id: 'gemini',
      name: 'Google Gemini 3.7 API',
      category: 'AI Reasoning & Copilot',
      purpose: 'Powers the Gemini Copilot, automated SOP synthesis, and situational analysis.',
      steps: [
        'Visit Google AI Studio (https://aistudio.google.com/app/apikey).',
        'Sign in and click "Create API Key".',
        'Select or create a Google Cloud project.',
        'Copy the key and paste into backend/.env as GEMINI_API_KEY.',
      ],
      envVar: 'GEMINI_API_KEY=AIzaSyD-your-gemini-api-key-here',
      freeTier: 'Free tier: 15 RPM / 1M tokens/min on Gemini 3.7 Flash',
      link: 'https://aistudio.google.com/app/apikey',
      icon: Sparkles,
      color: 'text-sky-400',
    },
    {
      id: 'earthengine',
      name: 'Google Earth Engine (GEE)',
      category: 'Satellite Elevation & SAR Data',
      purpose: 'Provides 30m digital elevation models (Copernicus DEM) and coastal SAR flood extents.',
      steps: [
        'Visit Google Earth Engine (https://earthengine.google.com/signup/).',
        'Create a service account with "Earth Engine Resource Viewer" role.',
        'Download the service account JSON key file to backend/secrets/gee-key.json.',
        'Configure GEE_SERVICE_ACCOUNT in backend/.env.',
      ],
      envVar: 'GEE_SERVICE_ACCOUNT=varuna-gee@your-project.iam.gserviceaccount.com\nGEE_PRIVATE_KEY_PATH=./secrets/gee-key.json',
      freeTier: 'Free for hackathons, academic, and disaster resilience research',
      link: 'https://earthengine.google.com/signup/',
      icon: Globe,
      color: 'text-emerald-400',
    },
    {
      id: 'supabase',
      name: 'Supabase / PostGIS Database',
      category: 'Geospatial Spatial Engine',
      purpose: 'Performs spatial bounding box and distance queries (ST_DWithin, ST_Intersects).',
      steps: [
        'Visit Supabase (https://supabase.com) and create a project in Mumbai (ap-south-1).',
        'Go to Database -> Extensions and enable "postgis".',
        'Copy the URI connection string to backend/.env as DATABASE_URL.',
      ],
      envVar: 'DATABASE_URL=postgresql://postgres.xxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
      freeTier: 'Free tier includes 500MB DB with full PostGIS support',
      link: 'https://supabase.com',
      icon: Database,
      color: 'text-emerald-300',
    },
    {
      id: 'openmeteo',
      name: 'Open-Meteo Cyclone & Marine API',
      category: 'Meteorological & Marine Telemetry',
      purpose: 'Fetches live GFS/ECMWF wind velocity, central pressure, and tidal data.',
      steps: [
        'Zero API key required for non-commercial & development use.',
        'Backend automatically fetches and caches telemetry with a 15-minute TTL.',
      ],
      envVar: 'OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1',
      freeTier: '100% Free with zero registration required',
      link: 'https://open-meteo.com',
      icon: Cloud,
      color: 'text-sky-400',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 bg-[#0E1626]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">External API & Services Setup Guide</h1>
            <p className="text-xs text-[#94A3B8]">
              Step-by-step instructions to configure API keys for Google Cloud, Gemini, Earth Engine, and Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div key={svc.id} className="card p-4 space-y-3 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-2.5 border-b border-[#162238]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-[#142036] border border-[#1E2E4A]">
                      <Icon className={`w-4 h-4 ${svc.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{svc.name}</h3>
                      <span className="text-[10px] font-mono text-sky-400">{svc.category}</span>
                    </div>
                  </div>

                  <a
                    href={svc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm p-1 text-xs text-[#94A3B8] hover:text-sky-400 flex items-center gap-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 mt-2.5">{svc.purpose}</p>

                {/* Steps */}
                <div className="mt-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Setup Instructions:</p>
                  <ol className="space-y-1 text-xs text-slate-300 list-decimal list-inside">
                    {svc.steps.map((step, i) => (
                      <li key={i} className="leading-snug">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Env snippet */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
                    <span>.env entry:</span>
                    <button
                      onClick={() => copyCode(svc.envVar, svc.id)}
                      className="hover:text-sky-400 flex items-center gap-1"
                    >
                      {copiedKey === svc.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-[#070B14] border border-[#1E2E4A] font-mono text-[11px] text-sky-300 overflow-x-auto">
                    {svc.envVar}
                  </pre>
                </div>
              </div>

              {/* Free Tier Info */}
              <div className="mt-3 pt-2.5 border-t border-[#162238] flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{svc.freeTier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
