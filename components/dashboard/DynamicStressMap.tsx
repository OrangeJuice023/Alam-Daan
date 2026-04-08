'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

// Important: Avoid SSR for Leaflet map wrapper
export const DynamicStressMap = dynamic(
  () => import('@/components/dashboard/StressMap').then((mod) => mod.StressMap),
  { 
    ssr: false,
    loading: () => <LoadingSkeleton variant="map" />
  }
);
