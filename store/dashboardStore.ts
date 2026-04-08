import { create } from 'zustand';
import type { LGUData, PriorityTier } from '@/lib/types';

interface DashboardStore {
  selectedLGU: LGUData | null;
  setSelectedLGU: (lgu: LGUData | null) => void;
  activeFilter: PriorityTier | 'ALL';
  setActiveFilter: (f: PriorityTier | 'ALL') => void;
  mapBounds: [number, number, number, number] | null;
  setMapBounds: (bounds: [number, number, number, number]) => void;
}

export const useDashboardStore = create<DashboardStore>(set => ({
  selectedLGU: null,
  setSelectedLGU: lgu => set({ selectedLGU: lgu }),
  activeFilter: 'ALL',
  setActiveFilter: f => set({ activeFilter: f }),
  mapBounds: null,
  setMapBounds: bounds => set({ mapBounds: bounds }),
}));
