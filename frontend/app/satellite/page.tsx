'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Satellite } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

const TABS = ['before', 'current', 'projected'] as const;

export default function SatelliteView() {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [tab, setTab] = useState<'before' | 'current' | 'projected'>('current');
  const [exposure, setExposure] = useState<any>({ exposed: 5, total: 8 });

  useEffect(() => {
    fetch('/api/satellite/inundation-summary')
      .then((r) => r.json())
      .then((rows) => {
        if (rows && rows.length > 0) {
          setExposure(rows[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const isDark = document.documentElement.classList.contains('dark');

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJlbWt1bWFyMTg0NSIsImEiOiJjbXVub2FxOHQwY2czMnpxNDZ0ZnZ3eWw1In0.aMIl85gkhoef0gBVCrglTw';

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'base-dark': {
            type: 'raster',
            tiles: [`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`],
            tileSize: 256,
            attribution: '© Mapbox, © OpenStreetMap',
          },
          'base-light': {
            type: 'raster',
            tiles: [`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`],
            tileSize: 256,
            attribution: '© Mapbox, © OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'layer-light',
            type: 'raster',
            source: 'base-light',
            layout: { visibility: isDark ? 'none' : 'visible' },
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: 'layer-dark',
            type: 'raster',
            source: 'base-dark',
            layout: { visibility: isDark ? 'visible' : 'none' },
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [82.2, 16.5],
      zoom: 6.5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      const samplePolygons = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { level: 'high' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [82.1, 16.8],
                  [82.4, 16.9],
                  [82.3, 16.6],
                  [81.9, 16.5],
                  [82.1, 16.8],
                ],
              ],
            },
          },
        ],
      };

      map.addSource('hazard-zones', {
        type: 'geojson',
        data: samplePolygons as any,
      });

      map.addLayer({
        id: 'hazard-fill',
        type: 'fill',
        source: 'hazard-zones',
        paint: {
          'fill-color': tab === 'before' ? '#3b82f6' : tab === 'current' ? '#06b6d4' : '#ef4444',
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'hazard-line',
        type: 'line',
        source: 'hazard-zones',
        paint: {
          'line-color': tab === 'before' ? '#60a5fa' : tab === 'current' ? '#22d3ee' : '#f87171',
          'line-width': 2,
        },
      });
    });

    mapInstance.current = map;
    return () => map.remove();
  }, [tab]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const isDark = theme === 'dark';

    if (map.isStyleLoaded()) {
      if (map.getLayer('layer-dark') && map.getLayer('layer-light')) {
        map.setLayoutProperty('layer-dark', 'visibility', isDark ? 'visible' : 'none');
        map.setLayoutProperty('layer-light', 'visibility', isDark ? 'none' : 'visible');
      }
    }
  }, [theme]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 card rounded-none">
        <div className="flex items-center gap-2">
          <Satellite size={20} className="text-cyan-600" />
          <h1 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            VarunaVision — Earth Observation &amp; Inundation Analysis
          </h1>
        </div>

        {/* Multi-temporal tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                tab === t
                  ? 'bg-white text-cyan-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.toUpperCase()} PHASE
            </button>
          ))}
        </div>

        {/* Exposure Counter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">High Risk Assets:</span>
          <span className="band-extreme">
            {exposure.exposed || 5} / {exposure.total || 8} Exposed
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-100">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 card p-3.5 shadow-sm text-xs space-y-1.5">
          <div className="text-slate-900 font-semibold">Synthetic SAR Inundation:</div>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: tab === 'before' ? '#3b82f6' : tab === 'current' ? '#06b6d4' : '#ef4444',
              }}
            />
            <span>{tab.toUpperCase()} Inundation Boundary</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Source: Sentinel-1 SAR &amp; CHIRPS Daily</div>
        </div>
      </div>
    </div>
  );
}
