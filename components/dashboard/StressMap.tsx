// components/dashboard/StressMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardStore } from '@/store/dashboardStore';
import type { LGUData } from '@/lib/types';
import type {
  Map as LeafletMap,
  GeoJSON as LeafletGeoJSON,
  Layer,
  LeafletMouseEvent,
  PathOptions,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface StressMapProps {
  lguList: LGUData[];
  fullHeight?: boolean;
}

type BoundaryFeature = GeoJSON.Feature<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  { slug?: string; name?: string }
>;

// Whole-archipelago view for the full-screen map page
const PH_BOUNDS: [[number, number], [number, number]] = [
  [4.6, 116.0],
  [21.2, 127.0],
];

const TIER_COLORS: Record<LGUData['tier'], string> = {
  URGENT: '#c0392b',
  HIGH: '#d68910',
  MODERATE: '#2e86c1',
  LOW: '#1e8449',
};

export function StressMap({ lguList, fullHeight }: StressMapProps) {
  const { selectedLGU, setSelectedLGU, activeFilter } = useDashboardStore();
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);
  const hasInteractedRef = useRef(false);

  // Load boundary polygons
  useEffect(() => {
    fetch('/ph-lgu-boundaries.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Missing public/ph-lgu-boundaries.geojson — run: node scripts/fetch-boundaries.mjs');
        return res.json();
      })
      .then(setGeoData)
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  // Initial framing: full map page shows the whole country, regardless of
  // any selection carried over from the dashboard. Embedded map starts on
  // the selection or Metro Manila.
  useEffect(() => {
    if (!map) return;
    if (fullHeight) {
      map.fitBounds(PH_BOUNDS, { animate: false });
    } else if (selectedLGU) {
      map.setView([selectedLGU.centroid[1], selectedLGU.centroid[0]], 12, { animate: false });
    } else {
      map.setView([14.5995, 120.9842], 10, { animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fullHeight]);

  // Fly to a city only when the person actively changes the selection
  // after the map is on screen.
  useEffect(() => {
    if (!map || !selectedLGU) return;
    if (!hasInteractedRef.current) return;
    map.flyTo([selectedLGU.centroid[1], selectedLGU.centroid[0]], 12, { duration: 1.2 });
  }, [map, selectedLGU]);

  const findLGU = (feature: BoundaryFeature): LGUData | undefined => {
    // Prefer exact slug match (set by scripts/fetch-boundaries.mjs);
    // fall back to slugified name for older boundary files.
    if (feature.properties?.slug) {
      return lguList.find((l) => l.slug === feature.properties.slug);
    }
    const nameSlug = feature.properties?.name?.toLowerCase().replace(/\s+/g, '-');
    return lguList.find((l) => nameSlug === l.slug || nameSlug?.includes(l.slug));
  };

  const getStyle = (feature?: GeoJSON.Feature): PathOptions => {
    const lgu = feature ? findLGU(feature as BoundaryFeature) : undefined;

    if (!lgu) {
      return { fillColor: '#1c3354', weight: 1, opacity: 1, color: 'rgba(255,255,255,0.2)', fillOpacity: 0.2 };
    }

    const dimmed = activeFilter !== 'ALL' && lgu.tier !== activeFilter;
    const isSelected = selectedLGU?.slug === lgu.slug;

    return {
      fillColor: TIER_COLORS[lgu.tier],
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.3)',
      fillOpacity: dimmed ? 0.1 : 0.55,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const lgu = findLGU(feature as BoundaryFeature);
    if (!lgu) return;

    layer.bindTooltip(
      `<div class="px-2 py-1">
        <div class="font-serif font-bold text-sm mb-1">${lgu.name}</div>
        <div class="font-mono text-xs text-white/70">Score: ${lgu.urbanStressScore.toFixed(2)} · ${lgu.tier}</div>
      </div>`,
      { direction: 'top', className: 'lgu-tooltip', sticky: true }
    );

    layer.on({
      click: () => {
        hasInteractedRef.current = true;
        setSelectedLGU(lgu);
      },
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.8 });
        e.target.bringToFront();
      },
      mouseout: (e: LeafletMouseEvent) => {
        geoJsonRef.current?.resetStyle(e.target);
      },
    });
  };

  return (
    <div className={`${fullHeight ? 'flex-1 h-full' : 'h-[50vh] min-h-[400px]'} w-full relative z-0 border-b border-white/10`}>
      <MapContainer
        center={[14.5995, 120.9842]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full bg-[#07111a]"
        style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
        ref={setMap}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter tiles - no API key needed, matches navy aesthetic */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {geoData && (
          <GeoJSON
            ref={geoJsonRef}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Zoom + reset controls */}
      <div className="absolute top-4 right-4 z-[400] flex gap-2">
        <button
          onClick={() => map?.zoomIn()}
          aria-label="Zoom in"
          className="w-8 h-8 bg-[#132338] border border-white/10 rounded shadow-card text-white flex items-center justify-center hover:bg-[#1c3354] transition-colors"
        >
          +
        </button>
        <button
          onClick={() => map?.zoomOut()}
          aria-label="Zoom out"
          className="w-8 h-8 bg-[#132338] border border-white/10 rounded shadow-card text-white flex items-center justify-center hover:bg-[#1c3354] transition-colors"
        >
          −
        </button>
        {fullHeight && (
          <button
            onClick={() => map?.fitBounds(PH_BOUNDS)}
            className="h-8 px-3 bg-[#132338] border border-white/10 rounded shadow-card text-white text-xs font-mono flex items-center justify-center hover:bg-[#1c3354] transition-colors"
          >
            Whole PH
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
        <div className="bg-[#132338]/90 border border-white/10 p-3 rounded shadow-card-sm backdrop-blur-sm flex flex-col gap-1.5">
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono mb-1">Stress Levels</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#c0392b] border border-white/20"></span><span className="text-xs text-white/80 font-mono">Urgent (&gt;0.70)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#d68910] border border-white/20"></span><span className="text-xs text-white/80 font-mono">High (0.50-0.69)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#2e86c1] border border-white/20"></span><span className="text-xs text-white/80 font-mono">Moderate (0.30-0.49)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#1e8449] border border-white/20"></span><span className="text-xs text-white/80 font-mono">Low (&lt;0.30)</span></div>
        </div>
      </div>
    </div>
  );
}
