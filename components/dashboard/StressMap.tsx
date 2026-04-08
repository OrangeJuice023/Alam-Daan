'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardStore } from '@/store/dashboardStore';
import type { LGUData } from '@/lib/types';
import type { Map as LeafletMap } from 'leaflet';
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

export function StressMap({ lguList, fullHeight }: StressMapProps) {
  const { selectedLGU, setSelectedLGU, activeFilter } = useDashboardStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch('/ph-lgu-boundaries.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load boundaries file; make sure public/ph-lgu-boundaries.geojson exists');
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  // Fly to selected LGU
  useEffect(() => {
    if (map && selectedLGU) {
      map.flyTo([selectedLGU.centroid[1], selectedLGU.centroid[0]], 12, {
        duration: 1.5,
      });
    } else if (map && !selectedLGU) {
      // Default to Manila area
      map.flyTo([14.5995, 120.9842], 10, { duration: 1.5 });
    }
  }, [map, selectedLGU]);

  // Color mapping based on tier
  const getStyle = (feature: any) => {
    const slug = feature.properties.name?.toLowerCase().replace(/\s+/g, '-');
    const lgu = lguList.find((l) => l.slug === slug || slug?.includes(l.slug));
    
    // Default inactive style
    let fillColor = '#1c3354';
    let weight = 1;
    let fillOpacity = 0.2;
    let color = 'rgba(255,255,255,0.2)';

    if (lgu) {
      // If filtering, dim non-matching
      if (activeFilter !== 'ALL' && lgu.tier !== activeFilter) {
        fillOpacity = 0.1;
      } else {
        fillOpacity = 0.6;
        weight = selectedLGU?.slug === lgu.slug ? 3 : 1.5;
        color = selectedLGU?.slug === lgu.slug ? '#ffffff' : 'rgba(255,255,255,0.3)';
        
        switch (lgu.tier) {
          case 'URGENT': fillColor = '#c0392b'; break;
          case 'HIGH': fillColor = '#d68910'; break;
          case 'MODERATE': fillColor = '#2e86c1'; break;
          case 'LOW': fillColor = '#1e8449'; break;
        }
      }
    }

    return {
      fillColor,
      weight,
      opacity: 1,
      color,
      fillOpacity,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const slug = feature.properties.name?.toLowerCase().replace(/\s+/g, '-');
    const lgu = lguList.find((l) => l.slug === slug || slug?.includes(l.slug));

    if (lgu) {
      layer.bindTooltip(`
        <div class="px-2 py-1">
          <div class="font-serif font-bold text-sm mb-1">${lgu.name}</div>
          <div class="font-mono text-xs text-white/70">Score: ${lgu.urbanStressScore.toFixed(2)}</div>
        </div>
      `, { direction: 'top', className: 'lgu-tooltip' });

      layer.on({
        click: () => setSelectedLGU(lgu),
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({ weight: 3, fillOpacity: 0.8 });
          l.bringToFront();
        },
        mouseout: (e: any) => {
          const l = e.target;
          GeoJSONLayer?.resetStyle(l);
          if (selectedLGU?.slug === lgu.slug) {
             l.setStyle({ weight: 3 });
          }
        },
      });
    }
  };

  // Keep a reference to the layer to reset styles on mouseout
  let GeoJSONLayer: any;

  return (
    <div className={`${fullHeight ? 'flex-1 h-full' : 'h-[50vh] min-h-[400px]'} w-full relative z-0 border-b border-white/10`}>
      <MapContainer
        center={[14.5995, 120.9842]} // Manila default
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
            ref={(ref) => { GeoJSONLayer = ref; }}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      
      {/* Map overlay UI */}
      <div className="absolute top-4 right-4 z-[400] flex gap-2">
        <button 
          onClick={() => map?.zoomIn()}
          className="w-8 h-8 bg-[#132338] border border-white/10 rounded shadow-card text-white flex items-center justify-center hover:bg-[#1c3354] transition-colors"
        >
          +
        </button>
        <button 
          onClick={() => map?.zoomOut()}
          className="w-8 h-8 bg-[#132338] border border-white/10 rounded shadow-card text-white flex items-center justify-center hover:bg-[#1c3354] transition-colors"
        >
          -
        </button>
      </div>

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
