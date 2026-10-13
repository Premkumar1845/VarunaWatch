'use client';

import React from 'react';
import { RiskSummary, CycloneStatus } from '@/lib/api';
import { 
  AlertTriangle, 
  Users, 
  Hospital, 
  Zap, 
  Navigation, 
  Shield 
} from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

interface KPIBarProps {
  summary?: RiskSummary | null;
  cyclone?: CycloneStatus | null;
}

export const KPIBar: React.FC<KPIBarProps> = ({ summary, cyclone }) => {
  const overallRisk = summary?.overall_risk_score ?? 76;
  const exposedPop = summary?.population_exposed ?? 1280000;
  const hospitalsAtRisk = summary?.hospitals_at_risk ?? 8;
  const totalHospitals = summary?.total_hospitals ?? summary?.hospitals_total ?? 12;
  const powerAtRisk = summary?.power_assets_at_risk ?? 6;
  const totalPower = summary?.total_power_assets ?? summary?.power_assets_total ?? 8;
  const roadKm = summary?.road_km_affected ?? 142;
  const shelters = summary?.active_shelters_count ?? summary?.shelters_available ?? 14;

  const kpis = [
    {
      label: 'Vulnerability Index',
      value: `${overallRisk}/100`,
      sub: overallRisk > 70 ? 'CRITICAL THREAT' : 'ELEVATED RISK',
      color: getRiskColor(overallRisk),
      icon: AlertTriangle,
    },
    {
      label: 'Exposed Population',
      value: (exposedPop / 1000000).toFixed(2) + 'M',
      sub: '4 Coastal Mandals',
      color: '#38BDF8',
      icon: Users,
    },
    {
      label: 'Hospitals at Risk',
      value: `${hospitalsAtRisk} / ${totalHospitals}`,
      sub: `${totalHospitals - hospitalsAtRisk} Facilities Secure`,
      color: hospitalsAtRisk > 4 ? '#F43F5E' : '#F59E0B',
      icon: Hospital,
    },
    {
      label: 'Power Grid Threat',
      value: `${powerAtRisk} / ${totalPower}`,
      sub: 'Substations in Flood Basin',
      color: '#F97316',
      icon: Zap,
    },
    {
      label: 'Inundated Corridors',
      value: `${roadKm} km`,
      sub: 'NH-16 & Coastal Arterials',
      color: '#F43F5E',
      icon: Navigation,
    },
    {
      label: 'Shelter Readiness',
      value: `${shelters} Units`,
      sub: '74% Capacity Available',
      color: '#10B981',
      icon: Shield,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="kpi-card"
          >
            <div className="flex items-center justify-between">
              <span className="kpi-label">{kpi.label}</span>
              <Icon className="w-3.5 h-3.5 text-[#64748B]" />
            </div>

            <div
              className="kpi-value"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </div>

            <div className="text-[11px] text-[#94A3B8] truncate pt-1 border-t border-[#162238]">
              {kpi.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
