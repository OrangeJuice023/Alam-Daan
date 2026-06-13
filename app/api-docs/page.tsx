import { Header } from '@/components/shared/Header';
import { Server, Image as ImageIcon, Satellite, Route, Cpu } from 'lucide-react';

export const metadata = {
  title: 'API Documentation | Alam Daan',
};

type Endpoint = {
  method: 'GET' | 'POST';
  path: string;
  tag: string;
  icon: typeof Server;
  desc: string;
  params?: { name: string; required?: boolean; note: string }[];
  body?: string;
  caching?: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET', path: '/api/lgu-list', tag: 'Orchestrator', icon: Cpu,
    desc: 'Primary endpoint. Aggregates Overpass, Mapillary, STAC, and the VLM classifier to compute stress scores for all registered cities, sorted by priority.',
    params: [{ name: '?region=[string]', note: 'Optional. Filter by region code (e.g. NCR).' }],
    caching: 's-maxage=3600, stale-while-revalidate=86400',
  },
  {
    method: 'POST', path: '/api/classify', tag: 'VLM', icon: Cpu,
    desc: 'Sends a Mapillary-hosted image to the OpenRouter vision-language model and returns a road-condition class with a confidence distribution. Image URLs are allowlisted to Mapillary hosts.',
    body: '{\n  "imageUrl": "https://images.mapillary.com/<id>/thumb-2048.jpg"\n}',
  },
  {
    method: 'GET', path: '/api/mapillary', tag: 'Street imagery', icon: ImageIcon,
    desc: 'Returns crowdsourced street-level image metadata within a bounding box, including thumbnail URLs used by the classifier.',
    params: [{ name: '?bbox=[w,s,e,n]', required: true, note: 'Within the Philippines, max 1.5° span.' }, { name: '?limit=[1-100]', note: 'Default 50.' }],
    caching: 's-maxage=3600, stale-while-revalidate=86400',
  },
  {
    method: 'GET', path: '/api/satellite', tag: 'STAC proxy', icon: Satellite,
    desc: 'Queries the Element84 STAC catalog for the most recent low-cloud Sentinel-2 L2A scene in the bounding box and derives NDBI / NDVI proxy indices from scene metadata.',
    params: [{ name: '?bbox=[w,s,e,n]', required: true, note: 'Within the Philippines, max 1.5° span.' }],
    caching: 's-maxage=86400, stale-while-revalidate=86400',
  },
  {
    method: 'GET', path: '/api/osm', tag: 'Road network', icon: Route,
    desc: 'Fetches the road network for a bounding box from OpenStreetMap via Overpass, returned as a GeoJSON FeatureCollection of segments.',
    params: [{ name: '?bbox=[w,s,e,n]', required: true, note: 'Within the Philippines, max 1.5° span.' }],
    caching: 's-maxage=86400, stale-while-revalidate=86400',
  },
];

const methodColor = (m: string) => (m === 'POST' ? '#c0392b' : '#1e8449');

export default function ApiDocsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto w-full px-6 py-12 md:px-12 md:py-16 relative">
        <div className="w-full max-w-5xl mx-auto">

          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-3">Reference</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">API Documentation</h1>
            <p className="text-[#aec6cf] text-lg font-light max-w-2xl">
              Internal data-provisioning endpoints. The dashboard calls these server-side; they are documented here for transparency.
            </p>
          </div>

          <div className="space-y-5">
            {ENDPOINTS.map((ep) => {
              const Icon = ep.icon;
              return (
                <div key={ep.path} className="bg-[#132338] border border-white/10 rounded-xl overflow-hidden shadow-card hover:border-white/20 transition-colors">
                  <div className="bg-[#07111a] px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-white px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wider shrink-0" style={{ backgroundColor: methodColor(ep.method) }}>{ep.method}</span>
                      <span className="font-mono text-white text-base md:text-lg tracking-wide truncate">{ep.path}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-white/40 shrink-0">
                      <Icon className="w-3.5 h-3.5" /> {ep.tag}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10">
                    <p className="text-[15px] text-[#aec6cf] leading-relaxed">{ep.desc}</p>

                    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                      {ep.params && (
                        <>
                          <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-3">Parameters</div>
                          <div className="space-y-3">
                            {ep.params.map((p) => (
                              <div key={p.name} className="flex flex-col gap-1 border-b border-white/5 last:border-0 pb-3 last:pb-0">
                                <div className="flex items-center gap-2">
                                  <code className="text-[#2e86c1] font-mono text-sm">{p.name}</code>
                                  {p.required && <span className="text-[9px] text-[#c0392b] font-bold tracking-widest uppercase">required</span>}
                                </div>
                                <span className="text-xs text-[#8ba1b0]">{p.note}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {ep.body && (
                        <>
                          <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">Request Body</div>
                          <pre className="text-[#27ae60] font-mono text-xs overflow-x-auto leading-relaxed">{ep.body}</pre>
                        </>
                      )}
                      {ep.caching && (
                        <>
                          <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2 mt-4">Caching</div>
                          <div className="text-xs text-white/60 font-mono break-all">{ep.caching}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </>
  );
}
