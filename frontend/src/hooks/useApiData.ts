'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getCycloneCurrent, 
  getCycloneForecast, 
  getHazards, 
  getInfrastructure, 
  getRoadsAffected, 
  getRiskSummary,
  getTriggerStatus,
  getAlerts,
  CycloneStatus,
  CycloneForecast,
  HazardResponse,
  InfrastructureResponse,
  RoadsResponse,
  RiskSummary,
  TriggerWatchResponse,
  Alert,
  InfraFilters
} from '@/lib/api';

/**
 * Generic data fetching hook with loading, error, and cached-data states
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Polling hook for live data
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 30000,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: string | null } {
  const { data, loading, error, refetch } = useApiData(fetcher, deps);

  useEffect(() => {
    const interval = setInterval(refetch, intervalMs);
    return () => clearInterval(interval);
  }, [refetch, intervalMs]);

  return { data, loading, error };
}

// Specialized Typed Data Hooks
export function useCycloneCurrent() {
  return usePolling<CycloneStatus>(() => getCycloneCurrent(), 15000);
}

export function useCycloneForecast() {
  return useApiData<CycloneForecast>(() => getCycloneForecast());
}

export function useHazards(minRisk?: number, category?: number) {
  return useApiData<HazardResponse>(() => getHazards(minRisk, category), [minRisk, category]);
}

export function useInfrastructure(filters?: InfraFilters) {
  return useApiData<InfrastructureResponse>(() => getInfrastructure(filters), [
    filters?.assetType,
    filters?.minRisk,
    filters?.zoneId,
    filters?.category,
  ]);
}

export function useRoads(minRisk?: number, category?: number) {
  return useApiData<RoadsResponse>(() => getRoadsAffected(minRisk, category), [minRisk, category]);
}

export function useRiskSummary(category?: number) {
  return useApiData<RiskSummary>(() => getRiskSummary(category), [category]);
}

export function useTriggerStatus() {
  return usePolling<TriggerWatchResponse>(() => getTriggerStatus(), 10000);
}

export function useAlerts() {
  return usePolling<{ alerts: Alert[] }>(() => getAlerts(), 10000);
}
