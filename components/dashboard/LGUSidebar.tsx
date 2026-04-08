'use client';

import { useEffect, useMemo } from 'react';
import { useLGUList } from '@/hooks/useLGUData';
import { useDashboardStore } from '@/store/dashboardStore';
import { TierBadge } from '@/components/shared/TierBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { LGUData, PriorityTier } from '@/lib/types';
import { Activity, AlertTriangle, ShieldCheck, Map as MapIcon } from 'lucide-react';

export function LGUSidebar({ initialLGUs }: { initialLGUs: LGUData[] }) {
  const { lguList, isLoading } = useLGUList();
  const { selectedLGU, setSelectedLGU, activeFilter, setActiveFilter } = useDashboardStore();

  // Prefer live data if available, otherwise fallback to server initial data
  const data = lguList.length > 0 ? lguList : initialLGUs;

  // Set initial selected LGU if none selected
  useEffect(() => {
    if (data.length > 0 && !selectedLGU && activeFilter === 'ALL') {
      setSelectedLGU(data[0]);
    }
  }, [data, selectedLGU, setSelectedLGU, activeFilter]);

  const filteredLGUs = useMemo(() => {
    if (activeFilter === 'ALL') return data;
    return data.filter(lgu => lgu.tier === activeFilter);
  }, [data, activeFilter]);

  if (isLoading && data.length === 0) {
    return <LoadingSkeleton variant="sidebar" />;
  }

  const tiers: { id: PriorityTier | 'ALL', label: string, count?: number }[] = [
    { id: 'ALL', label: 'All LGUs', count: data.length },
    { id: 'URGENT', label: 'Urgent', count: data.filter(l => l.tier === 'URGENT').length },
    { id: 'HIGH', label: 'High', count: data.filter(l => l.tier === 'HIGH').length },
  ];

  return (
    <div className="bg-[#132338] border-r border-white/5 h-full flex flex-col overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 border-b border-white/5 shrink-0">
        <h2 className="font-serif font-semibold text-lg text-white mb-4 flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-[#2e86c1]" />
          Regional Status
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {tiers.map(tier => (
            <button
              key={tier.id}
              onClick={() => setActiveFilter(tier.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                ${activeFilter === tier.id 
                  ? 'bg-[#2e86c1] border-[#2e86c1] text-white shadow-[0_0_10px_rgba(46,134,193,0.3)]' 
                  : 'bg-transparent border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'}
              `}
            >
              {tier.label}
              {tier.count !== undefined && (
                <span className={`ml-1.5 inline-flex items-center justify-center min-w-4 px-1 rounded-full text-[9px] 
                  ${activeFilter === tier.id ? 'bg-white/20' : 'bg-white/10'}
                `}>
                  {tier.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LGU List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {filteredLGUs.length === 0 ? (
          <div className="text-center p-8 text-white/40 text-sm">
            No LGUs found for this tier.
          </div>
        ) : (
          filteredLGUs.map((lgu) => {
            const isSelected = selectedLGU?.slug === lgu.slug;
            
            return (
              <button
                key={lgu.slug}
                onClick={() => setSelectedLGU(lgu)}
                className={`
                  w-full text-left p-4 rounded-lg transition-all duration-200 border relative overflow-hidden group
                  ${isSelected
                    ? 'bg-white/10 border-white/20 shadow-card'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-0.5'}
                `}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2e86c1] shadow-[0_0_10px_rgba(46,134,193,0.8)]" />
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`font-serif font-semibold text-base mb-0.5 ${isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                      {lgu.name}
                    </h3>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                      Region {lgu.region}
                    </div>
                  </div>
                  <TierBadge tier={lgu.tier} />
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-1.5 opacity-60">
                    {lgu.tier === 'URGENT' || lgu.tier === 'HIGH' ? (
                      <AlertTriangle className={`w-3.5 h-3.5 ${lgu.tier === 'URGENT' ? 'text-[#c0392b]' : 'text-[#d68910]'}`} />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#27ae60]" />
                    )}
                    <span className="text-xs font-mono">Rank #{lgu.priorityRank}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono mb-[2px]">Stress Score</div>
                    <div className={`font-mono font-medium ${isSelected ? 'text-white' : 'text-[#2e86c1]'}`}>
                      {lgu.urbanStressScore.toFixed(3)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
