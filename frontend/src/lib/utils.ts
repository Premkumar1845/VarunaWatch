/** VarunaWatch — Utility functions */
import { type RiskLevel } from './api';

export const RISK_COLORS: Record<string, string> = {
  Low: '#22C55E',
  Moderate: '#EAB308',
  High: '#F97316',
  'Very High': '#EF4444',
  Extreme: '#B91C1C',
};

export const RISK_BG_COLORS: Record<string, string> = {
  Low: 'rgba(34, 197, 94, 0.15)',
  Moderate: 'rgba(234, 179, 8, 0.15)',
  High: 'rgba(249, 115, 22, 0.15)',
  'Very High': 'rgba(239, 68, 68, 0.15)',
  Extreme: 'rgba(185, 28, 28, 0.15)',
};

export function getRiskColor(score: number | string): string {
  if (typeof score === 'string') {
    return RISK_COLORS[score] || '#22D3EE';
  }
  if (score >= 80) return '#B91C1C';
  if (score >= 65) return '#EF4444';
  if (score >= 50) return '#F97316';
  if (score >= 35) return '#EAB308';
  return '#22C55E';
}

export function getRiskBgColor(score: number | string): string {
  if (typeof score === 'string') {
    return RISK_BG_COLORS[score] || 'rgba(34, 211, 238, 0.15)';
  }
  if (score >= 80) return 'rgba(185, 28, 28, 0.15)';
  if (score >= 65) return 'rgba(239, 68, 68, 0.15)';
  if (score >= 50) return 'rgba(249, 115, 22, 0.15)';
  if (score >= 35) return 'rgba(234, 179, 8, 0.15)';
  return 'rgba(34, 197, 94, 0.15)';
}

export const SEVERITY_COLORS: Record<string, string> = {
  info: '#22D3EE',
  warning: '#EAB308',
  critical: '#EF4444',
  extreme: '#B91C1C',
};

export const ASSET_ICONS: Record<string, string> = {
  hospital: '🏥',
  power: '⚡',
  shelter: '🏛️',
  bridge: '🌉',
  road: '🛤️',
};

export const ASSET_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  power: 'Power',
  shelter: 'Shelter',
  bridge: 'Bridge',
  road: 'Road',
};

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}

export function getCategoryLabel(cat: number): string {
  const labels: Record<number, string> = {
    1: 'Category 1 — Tropical Storm',
    2: 'Category 2 — Severe',
    3: 'Category 3 — Very Severe',
    4: 'Category 4 — Extremely Severe',
    5: 'Category 5 — Super Cyclone',
  };
  return labels[cat] || `Category ${cat}`;
}

export function getTimeSince(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
