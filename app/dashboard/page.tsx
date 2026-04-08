import { Suspense } from 'react';
import { Header } from '@/components/shared/Header';
import { LGUSidebar } from '@/components/dashboard/LGUSidebar';
import { DecayBreakdown } from '@/components/dashboard/DecayBreakdown';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { DynamicStressMap } from '@/components/dashboard/DynamicStressMap';
import type { LGUData } from '@/lib/types';

export const revalidate = 3600; // ISR: re-generate every hour

async function getInitialLGUs(): Promise<LGUData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Vercel build environments do not run a localhost server. Recursive fetching crashes the builder.
  if (baseUrl === 'http://localhost:3000' && process.env.VERCEL) {
    return [];
  }

  try {
    const res = await fetch(`${baseUrl}/api/lgu-list`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
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
          
          <div className="p-8 max-w-6xl mx-auto relative z-10">
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
