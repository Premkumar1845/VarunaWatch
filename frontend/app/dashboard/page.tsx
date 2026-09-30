'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Wind,
  Activity,
  AlertTriangle,
  Droplets,
  ShieldAlert,
  Layers,
  ExternalLink,
  MapPin,
  Compass,
} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useCoastalLane } from '@/context/CoastalLaneContext';
import { CoastalLaneSelector } from '@/components/layout/CoastalLaneSelector';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { CycloneBackground } from '@/components/effects/CycloneBackground';

// Set maplibre worker URL to the public directory copy
if (typeof window !== 'undefined') {
  (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
}

const KPIS = [
  { icon: Wind,          label: 'Active Cyclone',              key: 'cyclone',     sub: 'IMD Coastal Track' },
  { icon: Activity,      label: 'Assets at High/Extreme Risk', key: 'high_risk',   sub: 'Score ≥ 50.0' },
  { icon: AlertTriangle, label: 'Critical Road Bottlenecks',   key: 'bottlenecks', sub: 'Inundation Risk' },
  { icon: Wind,          label: 'Peak Sustained Wind',         key: 'wind',        sub: 'Surface Telemetry' },
];

export default function Dashboard() {
  const { theme } = useTheme();
  const { currentLane } = useCoastalLane();
  const [data, setData] = useState<any>({
    cyclone: 'Cyclone Michaung (Cat 3)',
    high_risk: '5',
    bottlenecks: '3',
    wind: '165 km/h',
    pressure: '962 hPa',
    eta: '6 hours',
  });
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch telemetry whenever currentLane changes
  useEffect(() => {
    setLoading(true);
    const stateParam = currentLane.id;

    // Fetch cyclone current status from backend
    fetch(`/api/cyclone/current?state=${stateParam}`)
      .then((r) => r.json())
      .then((c) => {
        if (c && c.name) {
          setData((prev: any) => ({
            ...prev,
            cyclone: `${c.name} (Cat ${c.category})`,
            wind: `${c.wind_speed} km/h`,
            pressure: `${c.pressure} hPa`,
            eta: c.eta_landfall || '18 hours',
          }));
        }
      })
      .catch(() => {});

    // Fetch risk summary from backend
    fetch(`/api/risk/summary?state=${stateParam}`)
      .then((r) => r.json())
      .then((rs) => {
        if (rs && rs.overall_risk_score !== undefined) {
          setData((prev: any) => ({
            ...prev,
            high_risk: String(rs.hospitals_at_risk + rs.power_assets_at_risk || 5),
          }));
        }
      })
      .catch(() => {});

    // Fetch roads affected from backend
    fetch(`/api/roads/affected?state=${stateParam}`)
      .then((r) => r.json())
      .then((rd) => {
        if (rd && rd.critical_segments !== undefined) {
          setData((prev: any) => ({ ...prev, bottlenecks: String(rd.critical_segments || 3) }));
        }
      })
      .catch(() => {});

    // Fetch infrastructure assets for map markers
    fetch(`/api/infrastructure?state=${stateParam}`)
      .then((r) => r.json())
      .then((inf) => {
        if (inf && inf.assets) {
          setAssetsList(inf.assets);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentLane.id]);

  // Initialize MapLibre with dual tiles
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

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      map.addSource('storm-track', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: 'Cyclone Storm Track' },
          geometry: { type: 'LineString', coordinates: [] },
        },
      });

      map.addLayer({
        id: 'storm-track-line',
        type: 'line',
        source: 'storm-track',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#22d3ee', 'line-width': 4, 'line-dasharray': [2, 1] },
      });
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update map center, track, and markers when currentLane or assets change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Fly to current lane location
    map.flyTo({
      center: currentLane.center,
      zoom: currentLane.defaultZoom,
      speed: 1.2,
      curve: 1.42,
      essential: true,
    });

    // Fetch forecast track for the current lane
    fetch(`/api/cyclone/forecast?state=${currentLane.id}`)
      .then((r) => r.json())
      .then((fc) => {
        if (fc && fc.track && map.isStyleLoaded()) {
          const trackCoords = fc.track.map((t: any) => [t.position.lng, t.position.lat]);
          const source: any = map.getSource('storm-track');
          if (source) {
            source.setData({
              type: 'Feature',
              properties: { name: currentLane.cycloneTrackName },
              geometry: { type: 'LineString', coordinates: trackCoords },
            });
          }
        }
      })
      .catch(() => {});

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers from assetsList
    if (assetsList.length > 0) {
      assetsList.forEach((asset) => {
        const lng = asset.position?.lng ?? asset.lng;
        const lat = asset.position?.lat ?? asset.lat;
        if (!lng || !lat) return;

        const score = asset.vulnerability_score ?? 60;
        const color = score >= 80 ? '#b91c1c' : score >= 60 ? '#ef4444' : score >= 40 ? '#f97316' : '#10b981';

        const el = document.createElement('div');
        el.style.cssText = `
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,.6);
          background: ${color}; cursor: pointer;
          transform: translate(-50%,-50%);
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="font-family:system-ui,sans-serif;padding:3px;color:#0f172a;">
            <div style="font-weight:700;font-size:12px;">${asset.name}</div>
            <div style="font-size:11px;color:#64748b;margin-top:1px;">${asset.state_name || asset.zone_name || ''}</div>
            <div style="font-size:11px;margin-top:3px;">
              Risk: <strong style="color:${color}">${score} / 100</strong> · ${asset.risk_level || 'At Risk'}
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [currentLane, assetsList]);

  // Instant zero-lag map theme switching
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

  const topPriorityAssets = assetsList.filter((a) => (a.vulnerability_score || 0) >= 50).slice(0, 4);

  return (
    <div className="relative p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1600px] mx-auto min-h-full flex flex-col">
      {/* ── Background Cyclone Canvas ── */}
      <CycloneBackground density={40} speedMultiplier={0.8} />

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <BrandLogo size={38} glow={true} />
          <div>
            <h1 className="page-title flex items-center gap-2 text-base sm:text-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
              Command Center — {currentLane.name}
            </h1>
            <p className="page-sub flex flex-wrap items-center gap-2 text-xs">
              <span>Pan-India Coastal Defense &amp; Early Warning System</span>
              <span className="hidden sm:inline">·</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                {currentLane.coastline_km} km Coastline
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CoastalLaneSelector />
          <Link href="/stormtwin" className="btn-ghost btn-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <Layers size={14} />
            <span className="hidden xs:inline">Simulate Scenario</span>
          </Link>
          <Link href="/ai" className="btn-primary btn-sm shadow-sm">
            <Droplets size={14} />
            <span className="hidden xs:inline">Varuna AI</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards Grid ────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {KPIS.map(({ icon: Icon, label, key, sub }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-3.5 sm:p-4 flex items-center justify-between hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all backdrop-blur-sm bg-white/90 dark:bg-[#111827]/90 shadow-xs"
          >
            <div className="space-y-1">
              <div className="label text-[11px] sm:text-xs">{label}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {data[key] ?? '…'}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">{sub}</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700 shadow-xs shrink-0">
              <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid: Spatial Map + Intelligence Panel ───────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[400px]">
        {/* Spatial Map (3 cols on lg) */}
        <div className="lg:col-span-3 card overflow-hidden relative flex flex-col border border-slate-200 dark:border-slate-800 shadow-xs min-h-[350px] sm:min-h-[440px]">
          {/* Map top badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-xs max-w-[90%] truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold truncate">
              Radar Inundation ({currentLane.shortName})
            </span>
          </div>

          <div ref={mapContainer} className="w-full h-full min-h-[350px] sm:min-h-[440px]" />

          {/* Map footer overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 font-medium text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600" /> Extreme</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Very High</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> High</span>
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium font-mono truncate">
              {currentLane.spatialDomain}
            </div>
          </div>
        </div>

        {/* Operational Brief panel (1 col on lg) */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="section-title flex items-center gap-2 text-cyan-700 dark:text-cyan-400 text-sm">
                <ShieldAlert size={16} />
                <span>Operational Brief</span>
              </div>
              <span className="badge-neutral font-mono text-[9px] sm:text-[10px]">AUTO-SYNTHESIS</span>
            </div>

            <div className="mt-3.5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Continuous multi-hazard risk synthesis active for <strong className="text-slate-900 dark:text-slate-200">{currentLane.name}</strong>.
              </p>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
                  <span>Priority Assets:</span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">{topPriorityAssets.length} Flagged</span>
                </div>
                {topPriorityAssets.length > 0 ? (
                  topPriorityAssets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="truncate max-w-[130px] font-medium">{asset.name}</span>
                      <span className={`font-mono font-bold shrink-0 text-[11px] ${asset.vulnerability_score >= 80 ? 'text-red-600 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`}>
                        {asset.vulnerability_score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic text-[11px]">No critical threshold breaches detected.</div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-[11px] text-cyan-800 dark:text-cyan-300">
                <div className="font-bold mb-0.5">SDRF / NDRF Allocation:</div>
                <div className="leading-snug text-[11px]">{currentLane.sdrfForce}</div>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Link href="/ai" className="btn-primary btn-sm w-full shadow-xs text-xs">
              <span>Review AI Advisory</span>
              <ExternalLink size={13} />
            </Link>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
              <span>REFRESH: 60s</span>
              <span>TELEMETRY LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
