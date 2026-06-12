// components/shared/HowToUse.tsx
'use client';

import { useState } from 'react';
import { HelpCircle, X, MousePointerClick, Map as MapIcon, Activity } from 'lucide-react';

// Floating "How to use" guide. Mount once per page; it positions itself
// bottom-right above the map attribution.
export function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[320px] bg-[#132338]/95 border border-white/10 rounded-lg shadow-card backdrop-blur-md p-5 text-left">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-serif text-white text-lg">How to use this map</h3>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close guide"
              className="text-white/40 hover:text-white transition-colors -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ol className="space-y-4 text-sm text-[#aec6cf] leading-relaxed">
            <li className="flex gap-3">
              <MousePointerClick className="w-4 h-4 text-[#2e86c1] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Select a city</strong> — click a
                colored boundary on the map, or pick one from the dashboard sidebar.
              </span>
            </li>
            <li className="flex gap-3">
              <MapIcon className="w-4 h-4 text-[#2e86c1] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Read the colors</strong> — each city
                is shaded by its priority tier, from green (low stress) to red (urgent).
                The legend is at the bottom left.
              </span>
            </li>
            <li className="flex gap-3">
              <Activity className="w-4 h-4 text-[#2e86c1] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Inspect the score</strong> — the
                Urban Stress Score (0–1) combines road decay detected in street-level
                imagery with Sentinel-2 built-up and vegetation indices. Details are on
                the Methodology page.
              </span>
            </li>
          </ol>

          <p className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/40 font-mono leading-relaxed">
            Data: Mapillary street imagery · OpenStreetMap · Sentinel-2 (Element84 STAC).
            Scores refresh hourly.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 bg-[#132338] border border-white/10 rounded-full pl-3 pr-4 py-2 shadow-card text-white text-xs font-mono hover:bg-[#1c3354] transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-[#2e86c1]" />
        How to use
      </button>
    </div>
  );
}
