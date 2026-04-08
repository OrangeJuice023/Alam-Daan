'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { Camera, Satellite, TrendingDown, ThermometerSun } from 'lucide-react';

export function MetricsGrid() {
  const { selectedLGU } = useDashboardStore();

  if (!selectedLGU) return null;

  const sat = selectedLGU.satellite;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      <div className="white-card p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-black/5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
          <Camera size={80} />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-1">Observation Dens.</div>
            <div className="text-3xl font-serif text-[#1a2332] font-semibold">{selectedLGU.decayDensity.toFixed(2)}</div>
          </div>
          <div className="text-[10px] text-[#4a5568] mt-3 bg-gray-50 px-2 py-1 rounded inline-flex border border-gray-100 self-start">
            Weighted severity index
          </div>
        </div>
      </div>

      <div className="white-card p-5 relative overflow-hidden group">
         <div className="absolute -right-4 -top-4 text-[#1a5276]/5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
          <Satellite size={80} />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-[#1a5276] font-mono tracking-widest uppercase mb-1">STAC Extracted NDBI</div>
            <div className="text-3xl font-serif text-[#1a5276] font-semibold">{sat.ndbi.toFixed(3)}</div>
          </div>
          <div className="text-[10px] text-[#4a5568] mt-3">
            Built-up / Urban Density
          </div>
        </div>
      </div>

      <div className="white-card p-5 relative overflow-hidden group">
         <div className="absolute -right-4 -top-4 text-[#1e8449]/5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
          <TrendingDown size={80} />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-[#1e8449] font-mono tracking-widest uppercase mb-1">STAC Extracted NDVI</div>
            <div className="text-3xl font-serif text-[#1e8449] font-semibold">{sat.ndvi.toFixed(3)}</div>
          </div>
          <div className="text-[10px] text-[#4a5568] mt-3">
            Vegetation / Tree Cover
          </div>
        </div>
      </div>

      <div className="white-card p-5 relative overflow-hidden group">
         <div className="absolute -right-4 -top-4 text-[#d68910]/5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
          <ThermometerSun size={80} />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-[#d68910] font-mono tracking-widest uppercase mb-1">Urban Stress Index</div>
            <div className="text-3xl font-serif text-[#d68910] font-semibold">{selectedLGU.urbanStressScore.toFixed(3)}</div>
          </div>
          <div className="text-[10px] text-[#4a5568] mt-3 flex items-center justify-between">
            <span>Composite Indicator</span>
            <span className="font-mono bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider border border-orange-100">Live</span>
          </div>
        </div>
      </div>

    </div>
  );
}
