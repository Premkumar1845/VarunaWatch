'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Wind, AlertOctagon, Compass, MapPin } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { CoastalLaneSelector } from '@/components/layout/CoastalLaneSelector';

// Set maplibre worker URL to the public directory copy
if (typeof window !== 'undefined') {
  (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
}

const CATS = [
  ['Tropical Depression', '<63 km/h', '#22c55e'],
  ['Tropical Storm', '63–118 km/h', '#eab308'],
  ['Category 1–2 Cyclone', '119–177 km/h', '#f97316'],
  ['Category 3–4 Cyclone', '178–249 km/h', '#ef4444'],
  ['Category 5 Super Cyclone', '≥250 km/h', '#b91c1c'],
] as const;

export default function Storm() {
  const { theme } = useTheme();
  const { currentLane } = useCoastalLane();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const eyeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [telemetry, setTelemetry] = useState({
    name: 'Cyclone Michaung',
    category: 3,
    wind_kph: 165,
    pressure_hpa: 962,
    gust_kph: 195,
    speed_kph: 18,
    heading: 'NNW (335°)',
    eta: '14 hours',
  });

  useEffect(() => {
    fetch(`/api/cyclone/current?state=${currentLane.id}`)
      .then((r) => r.json())
      .then((c) => {
        if (c && c.name) {
          setTelemetry({
            name: c.name || 'Cyclone Active',
            category: c.category || 3,
            wind_kph: c.wind_speed || 165,
            pressure_hpa: c.pressure || 962,
            gust_kph: Math.round((c.wind_speed || 165) * 1.25),
            speed_kph: c.speed_of_movement || 18,
            heading: c.direction ? `${c.direction} (${c.direction === 'WNW' ? '295°' : '330°'})` : 'NNW (335°)',
            eta: c.eta_landfall || '14 hours',
          });
        }
      })
      .catch(() => {});
  }, [currentLane.id]);

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
      center: currentLane.center,
      zoom: currentLane.defaultZoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource('track', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
      });

      map.addLayer({
        id: 'track-glow',
        type: 'line',
        source: 'track',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 8,
          'line-opacity': 0.4,
        },
      });

      map.addLayer({
        id: 'track-line',
        type: 'line',
        source: 'track',
        paint: {
          'line-color': '#22d3ee',
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
      });
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update track and map bounds on lane change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.flyTo({
      center: currentLane.center,
      zoom: currentLane.defaultZoom,
      speed: 1.2,
      curve: 1.4,
    });

    fetch(`/api/cyclone/forecast?state=${currentLane.id}`)
      .then((r) => r.json())
      .then((data) => {
        const track = data?.track?.map((tp: any) => [
          tp.position?.lng ?? tp.lng,
          tp.position?.lat ?? tp.lat,
        ]).filter((c: any) => c[0] && c[1]) || [];

        if (track.length > 0 && map.isStyleLoaded()) {
          const src: any = map.getSource('track');
          if (src) {
            src.setData({
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: track },
            });
          }

          // Update eye marker
          if (eyeMarkerRef.current) {
            eyeMarkerRef.current.remove();
          }

          const eyeCoords = track[Math.min(6, track.length - 1)] || track[0];
          const eyeEl = document.createElement('div');
          eyeEl.className = 'w-7 h-7 rounded-full border-2 border-red-500 bg-red-500/30 flex items-center justify-center animate-ping';
          const innerEl = document.createElement('div');
          innerEl.className = 'w-3 h-3 rounded-full bg-red-600 shadow-lg';
          eyeEl.appendChild(innerEl);

          const marker = new maplibregl.Marker({ element: eyeEl })
            .setLngLat(eyeCoords as [number, number])
            .addTo(map);

          eyeMarkerRef.current = marker;
        }
      })
      .catch(() => {});
  }, [currentLane]);

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
    <div className="flex h-full flex-col lg:flex-row overflow-hidden">
      {/* Map View */}
      <div className="flex-1 relative bg-slate-100 dark:bg-[#070b14]">
        <div ref={mapContainer} className="w-full h-full min-h-[400px]" />

        {/* Floating Telemetry Box on Map */}
        <div className="absolute top-4 left-4 z-10 card p-4 max-w-sm shadow-xl space-y-2.5 border border-slate-200 dark:border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm block">{telemetry.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{currentLane.name}</span>
            </div>
            <span className="band-extreme shrink-0">CAT {telemetry.category}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <div>Wind: <strong className="text-slate-900 dark:text-slate-100">{telemetry.wind_kph} km/h</strong></div>
            <div>Pressure: <strong className="text-slate-900 dark:text-slate-100">{telemetry.pressure_hpa} hPa</strong></div>
            <div>Gusts: <strong className="text-slate-900 dark:text-slate-100">{telemetry.gust_kph} km/h</strong></div>
            <div>Speed: <strong className="text-slate-900 dark:text-slate-100">{telemetry.speed_kph} km/h</strong></div>
          </div>
        </div>

        {/* Floating State Switcher in Map Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10">
          <CoastalLaneSelector />
        </div>
      </div>

      {/* Sidebar Info & Saffir-Simpson Reference */}
      <aside className="w-full lg:w-84 card border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0 space-y-6 overflow-y-auto bg-white dark:bg-[#111827]">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title text-cyan-700 dark:text-cyan-400 text-base flex items-center gap-2">
              <Wind size={18} />
              Storm Intelligence
            </h2>
            <span className="badge-neutral font-mono text-[10px]">{currentLane.basin}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Saffir–Simpson Hurricane Scale &amp; State Vector Telemetry
          </p>

          <div className="space-y-2">
            {CATS.map(([name, speed, color]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <span className="flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {name}
                </span>
                <span className="text-slate-400 dark:text-slate-400 text-[11px] font-medium font-mono">{speed}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-700 dark:text-amber-400">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertOctagon size={14} />
            <span>Landfall Proximity Warning ({currentLane.shortName})</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300">
            Projected landfall corridor targeting <strong className="font-semibold">{currentLane.name}</strong> within {telemetry.eta}. Severe storm surge hazard active across coastal lowlands.
          </p>
        </div>
      </aside>
    </div>
  );
}
