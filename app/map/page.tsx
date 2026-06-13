// app/map/page.tsx
import { Suspense } from 'react';
import { Header } from '@/components/shared/Header';
import { DynamicStressMap } from '@/components/dashboard/DynamicStressMap';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { HowToUse } from '@/components/shared/HowToUse';
import { getLGUList } from '@/lib/server/lguService';
import type { LGUData } from '@/lib/types';

export const metadata = {
  title: 'Full LGU Map | Alam Daan',
};

export const revalidate = 3600;
export const maxDuration = 60;

async function getInitialLGUs(): Promise<LGUData[]> {
  try {
    return await getLGUList();
  } catch (err) {
    console.error('Failed to build initial LGU list:', err);
    return [];
  }
}

export default async function MapPage() {
  const initialLGUs = await getInitialLGUs();

  return (
    <>
      <Header />
      <main className="flex-1 w-full h-[calc(100vh-64px)] relative flex flex-col">
        <Suspense fallback={<LoadingSkeleton variant="map" />}>
          <DynamicStressMap lguList={initialLGUs} fullHeight={true} />
        </Suspense>

        {/* Overlay Title */}
        <div className="absolute top-6 left-6 z-[400]">
          <div className="bg-[#132338]/90 border border-white/10 p-5 rounded-lg shadow-card backdrop-blur-md">
            <h1 className="text-xl font-serif text-white mb-1">National LGU Stress Map</h1>
            <p className="text-xs font-mono text-[#2e86c1] tracking-wider uppercase mb-3">Full Interactive Explorer</p>
            <HowToUse />
          </div>
        </div>
      </main>
    </>
  );
}
