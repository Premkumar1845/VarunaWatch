'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wind, 
  Waves, 
  CloudRain, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Landmark,
  MapPin
} from 'lucide-react';
import { dispatchEmergencyCall } from '@/lib/api';
import { useCoastalLane } from '@/context/CoastalLaneContext';

export const ParametricSentinel: React.FC = () => {
  const { currentLane } = useCoastalLane();
  const [payoutClaimed, setPayoutClaimed] = useState<boolean>(false);
  const [calling, setCalling] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const triggers = [
    {
      id: 'wind',
      name: 'Wind Velocity Trigger',
      threshold: '>= 140 km/h Sustained',
      current: '165 km/h',
      status: 'TRIGGERED',
      icon: Wind,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'surge',
      name: 'Storm Surge Inundation',
      threshold: '>= 2.2m Surge Height',
      current: '+3.5m Above Tide',
      status: 'TRIGGERED',
      icon: Waves,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'rainfall',
      name: '24h Precipitation Intensity',
      threshold: '>= 200mm Heavy Rainfall',
      current: '265mm Forecast Basin',
      status: 'TRIGGERED',
      icon: CloudRain,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  const auditLog = [
    { time: '11:20:15 IST', event: `INCOIS & IMD Radar Telemetry: 165 km/h sustained surface winds validated for ${currentLane.name}`, hash: '0x8f2a...c4e1' },
    { time: '11:22:30 IST', event: `Doppler Radar Coastal Feed: Eye diameter 34km confirmed on ${currentLane.basin} littoral track`, hash: '0x91d2...aa78' },
    { time: '11:25:00 IST', event: `VarunaWatch AI Sentinel executes deterministic consensus validation for ${currentLane.sdrfForce}`, hash: '0x3c99...e2f0' },
    { time: '11:25:02 IST', event: 'Parametric smart contract auto-qualifies 100% payout liquidity', hash: '0x5b11...99aa' },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="card p-5 bg-[#0E1626] border border-[#162238]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h1 className="text-base font-bold text-white">
                Parametric Disaster Financing Sentinel ({currentLane.shortName})
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% QUALIFIED
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] max-w-2xl">
              Deterministic, zero-friction disaster relief funding triggered 12-24 hours before landfall across <strong className="text-slate-200">{currentLane.name}</strong> ({currentLane.coastline_km} km Coastline).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setCalling(true);
                try {
                  const res = await dispatchEmergencyCall();
                  if (res.success) {
                    setCallStatus(`Call Dispatched! SID: ${res.call_sid?.slice(0, 10)}...`);
                  } else {
                    setCallStatus(`Dispatch Failed: ${res.error || res.status}`);
                  }
                } catch (e: any) {
                  setCallStatus('Error connecting to alert service');
                } finally {
                  setCalling(false);
                }
              }}
              disabled={calling}
              className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1.5"
            >
              <span>{calling ? 'Dialing Twilio...' : '🚨 Dispatch Emergency Alert Call'}</span>
            </button>
            <button
              onClick={() => setPayoutClaimed(true)}
              disabled={payoutClaimed}
              className={`btn btn-sm ${
                payoutClaimed
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'btn-primary'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{payoutClaimed ? `Funds Disbursed to ${currentLane.shortName} SDRF` : 'Authorize Liquidity Release'}</span>
            </button>
          </div>
        </div>
        {callStatus && (
          <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-800/40 flex items-center justify-between">
            <span>{callStatus}</span>
            <span className="text-[10px] text-slate-400">Target: Emergency Command</span>
          </div>
        )}
      </div>

      {/* Triggers Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {triggers.map((trig) => {
          const Icon = trig.icon;
          return (
            <div key={trig.id} className="card p-4 space-y-3 bg-[#0E1626] border border-[#162238]">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded border ${trig.bgColor} ${trig.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">{trig.name}</h3>
                  <p className="text-[10px] text-[#94A3B8] font-mono">{trig.threshold}</p>
                </div>
              </div>

              {/* Measured Value */}
              <div className="p-2.5 bg-[#0B1220] rounded border border-[#1E2E4A] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#94A3B8] block">Live Telemetry</span>
                  <span className="text-sm font-bold text-white font-mono">{trig.current}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {trig.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Breached
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                  QUALIFIED
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liquidity Breakdown & Consensus Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Funds Pool */}
        <div className="lg:col-span-6 card p-5 space-y-3.5 bg-[#0E1626] border border-[#162238]">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#162238]">
            <Landmark className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pre-Approved Liquidity Allocations</h3>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#142036] rounded border border-[#1E2E4A] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-100">{currentLane.sdrfForce}</p>
                <p className="text-[10px] text-[#94A3B8]">Emergency diesel fuel, shelter rations, and mobile medical units</p>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">₹250 Cr</span>
            </div>

            <div className="p-3 bg-[#142036] rounded border border-[#1E2E4A] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-100">National Disaster Response (NDRF)</p>
                <p className="text-[10px] text-[#94A3B8]">Airlift contingencies & coastal highway heavy de-watering pumps</p>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">₹500 Cr</span>
            </div>

            <div className="p-3 bg-[#142036] rounded border border-[#1E2E4A] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-100">Municipal &amp; Port Parametric Facility</p>
                <p className="text-[10px] text-[#94A3B8]">Direct municipal transfer to {currentLane.keyPorts.slice(0, 2).join(' & ')}</p>
              </div>
              <span className="font-mono font-bold text-sky-300 text-sm">$50.0M</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Audit Trail */}
        <div className="lg:col-span-6 card p-5 space-y-3.5 bg-[#0E1626] border border-[#162238]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#162238]">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Consensus Verification Trail</h3>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8]">SHA-256</span>
          </div>

          <div className="space-y-2">
            {auditLog.map((log, i) => (
              <div key={i} className="p-2.5 bg-[#0B1220] rounded border border-[#1E2E4A] text-xs space-y-0.5">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span className="font-mono text-sky-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> {log.time}
                  </span>
                  <span className="font-mono text-[10px] text-[#64748B]">{log.hash}</span>
                </div>
                <p className="text-slate-200">{log.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
