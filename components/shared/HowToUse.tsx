'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, X, MousePointerClick, Palette, Gauge } from 'lucide-react';

const STEPS = [
  { icon: MousePointerClick, title: 'Select a city', text: 'Click any colored boundary on the map, or pick a city from the dashboard sidebar.' },
  { icon: Palette, title: 'Read the colors', text: 'Each city is shaded by its priority tier — green (low stress) through to red (urgent). The legend sits at the bottom-left of the map.' },
  { icon: Gauge, title: 'Inspect the score', text: 'The Urban Stress Score (0–1) blends road decay from street imagery with Sentinel-2 built-up and vegetation indices. Full breakdown on the Methodology page.' },
];

export function HowToUse() {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Trigger — quiet pill, sits inline wherever it's mounted */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-full px-3 py-1.5 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        How to use
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#132338] border border-white/10 rounded-xl shadow-card overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-serif text-white text-lg">How to use this map</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="p-6 space-y-5">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#1c3354] border border-[#2e86c1]/30 flex items-center justify-center text-[#2e86c1] font-mono text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#2e86c1]" />
                      <span className="text-white font-medium text-sm">{title}</span>
                    </div>
                    <p className="text-sm text-[#8ba1b0] leading-relaxed">{text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="px-6 py-3 border-t border-white/10 text-[11px] text-white/40 font-mono">
              Data: Mapillary · OpenStreetMap · Sentinel-2. Refreshed hourly.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
