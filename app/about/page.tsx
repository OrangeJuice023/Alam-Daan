import { PageShell } from '@/components/shared/PageShell';
import { Logo } from '@/components/shared/Logo';

export const metadata = {
  title: 'About | Alam Daan',
};

const STACK = [
  { label: 'Geospatial aggregation', value: 'Mapillary street imagery + OpenStreetMap road network, queried per city bounding box.' },
  { label: 'Satellite analytics', value: 'Sentinel-2 L2A via Element84 STAC; NDBI / NDVI proxy indices from scene metadata.' },
  { label: 'Vision-language pipeline', value: 'OpenRouter VLM (nvidia/nemotron-nano-12b-v2-vl) classifies road decay from street imagery.' },
  { label: 'Architecture', value: 'Next.js 16 App Router with hourly ISR, Zustand state, Tailwind CSS, Leaflet maps.' },
];

export default function AboutPage() {
  return (
    <PageShell width="narrow">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 rounded-2xl border border-[#c9a84c]/50 bg-[#1c3354] flex items-center justify-center text-[#c9a84c] mb-6 shadow-inner">
          <Logo className="w-11 h-11" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Alam Daan</h1>
        <p className="text-[#2e86c1] font-mono text-xs uppercase tracking-[0.2em] mb-8">
          Infrastructure Intelligence System
        </p>
        <p className="text-[#aec6cf] text-lg leading-relaxed font-light max-w-xl">
          An infrastructure decay detection and priority-mapping system, developed by{' '}
          <strong className="text-white font-medium">Gervi Corado</strong> as a technical
          showcase for application to the{' '}
          <strong className="text-[#c9a84c] font-medium">Philippine Space Agency (PhilSA)</strong>.
        </p>
      </div>

      {/* Stack */}
      <div className="bg-[#132338] border border-white/10 rounded-xl overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-white/10">
          <span className="text-[10px] text-[#2e86c1] font-mono tracking-widest uppercase">
            System Stack &amp; Integrations
          </span>
        </div>
        <dl className="divide-y divide-white/5">
          {STACK.map(({ label, value }) => (
            <div key={label} className="px-6 py-4 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-6">
              <dt className="text-white font-medium text-sm">{label}</dt>
              <dd className="text-[#8ba1b0] text-sm leading-relaxed font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-center text-[11px] text-white/30 uppercase tracking-[0.2em] font-mono mt-10">
        Live data from public APIs, refreshed hourly · Satellite indices are metadata-derived proxies
      </p>
    </PageShell>
  );
}
