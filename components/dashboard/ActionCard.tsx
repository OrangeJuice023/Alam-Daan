'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { ArrowRight, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export function ActionCard() {
  const { selectedLGU } = useDashboardStore();

  if (!selectedLGU) return null;

  return (
    <div className="bg-[#132338] rounded-lg p-6 border border-white/5 relative overflow-hidden">
      {/* Decorative seal/crest mark placeholder in background */}
      <div className="absolute -right-16 -bottom-16 w-64 h-64 border-[1px] border-white/5 rounded-full flex items-center justify-center">
        <div className="w-48 h-48 border-[1px] border-white/5 rounded-full flex items-center justify-center">
          <div className="text-white/5 font-serif text-9xl">PH</div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#c9a84c]/20 p-2 rounded shrink-0">
            {selectedLGU.tier === 'URGENT' || selectedLGU.tier === 'HIGH' ? (
              <AlertTriangle className="w-5 h-5 text-[#c9a84c]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#c9a84c]" />
            )}
          </div>
          <div>
            <h3 className="text-white font-serif text-xl tracking-wide">Bureau Recommendation</h3>
            <div className="text-[10px] text-white/50 tracking-widest font-mono uppercase">System-Generated Directive</div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded border border-black/20 my-5">
          <p className="text-white/80 leading-relaxed font-medium">
            {selectedLGU.recommendedAction}
          </p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-[10px] text-white/30 tracking-widest font-mono uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Last Sync: {new Date(selectedLGU.lastUpdated).toLocaleString('en-US', { timeZone: 'Asia/Manila' })} PST
          </div>
          
          <button className="flex items-center gap-2 bg-[#2e86c1] hover:bg-[#3498db] transition-colors text-white text-xs font-semibold px-4 py-2 rounded">
            Generate Detail Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
