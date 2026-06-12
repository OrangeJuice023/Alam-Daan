'use client';

import { useEffect, useMemo } from 'react';
import { useLGUList } from '@/hooks/useLGUData';
import { useDashboardStore } from '@/store/dashboardStore';
import { TierBadge } from '@/components/shared/TierBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { LGUData, PriorityTier } from '@/lib/types';
import { Map as MapIcon } from 'lucide-react';

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
            
            const tierColor =
              lgu.tier === 'URGENT' ? '#c0392b' :
              lgu.tier === 'HIGH' ? '#d68910' :
              lgu.tier === 'MODERATE' ? '#2e86c1' : '#1e8449';

            return (
              <button
                key={lgu.slug}
                onClick={() => setSelectedLGU(lgu)}
                className={`
                  w-full text-left rounded-md transition-colors duration-150 border flex items-stretch gap-3 px-3 py-2.5
                  ${isSelected
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                `}
              >
                <span
                  className="w-1 rounded-full shrink-0 self-stretch"
                  style={{ backgroundColor: tierColor, opacity: isSelected ? 1 : 0.6 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`font-serif font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-white/90'}`}>
                      {lgu.name}
                    </h3>
                    <span className={`font-mono text-sm shrink-0 ${isSelected ? 'text-white' : 'text-[#5fa8d3]'}`}>
                      {lgu.urbanStressScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                      #{lgu.priorityRank} · {lgu.region}
                    </span>
                    <TierBadge tier={lgu.tier} />
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
