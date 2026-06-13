// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Header } from '@/components/shared/Header';
import { LGUSidebar } from '@/components/dashboard/LGUSidebar';
import { DecayBreakdown } from '@/components/dashboard/DecayBreakdown';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { DynamicStressMap } from '@/components/dashboard/DynamicStressMap';
import { getLGUList } from '@/lib/server/lguService';
import type { LGUData } from '@/lib/types';

export const revalidate = 3600; // ISR: re-generate every hour
export const maxDuration = 60;

async function getInitialLGUs(): Promise<LGUData[]> {
  // Direct server function call — works at build time and at runtime,
  // on localhost and on Vercel, with no NEXT_PUBLIC_APP_URL required.
  try {
    return await getLGUList();
  } catch (err) {
    console.error('Failed to build initial LGU list:', err);
    return [];
  }
}

export default async function DashboardPage() {
  const initialLGUs = await getInitialLGUs();

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#0d1b2a]">

        {/* Sidebar */}
        <div className="w-full md:w-[320px] h-full shrink-0 relative z-20">
          <Suspense fallback={<LoadingSkeleton variant="sidebar" />}>
            <LGUSidebar initialLGUs={initialLGUs} />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto w-full relative z-0">
          <DynamicStressMap lguList={initialLGUs} />

          <div className="px-6 py-8 md:px-8 max-w-6xl mx-auto relative z-10">
            <Suspense fallback={<LoadingSkeleton variant="detail" />}>
              <DecayBreakdown />
              <MetricsGrid />
              <ActionCard />
            </Suspense>
          </div>
        </main>

      </div>
    </>
  );
}
