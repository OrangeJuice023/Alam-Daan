import { Header } from '@/components/shared/Header';
import { Server, Database } from 'lucide-react';

export const metadata = {
  title: 'API Documentation | Alam Daan',
};

export default function ApiDocsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto w-full p-8 md:p-12 relative flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">API Documentation</h1>
            <p className="text-[#aec6cf] text-lg font-light">Internal data provisioning endpoints and architectural routing.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Endpoint 1 */}
            <div className="bg-[#132338] border border-white/10 rounded-xl overflow-hidden shadow-card hover:border-white/20 transition-all">
              <div className="bg-[#07111a] px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="bg-[#1e8449] text-white px-3 py-1 rounded text-xs font-mono font-bold tracking-wider shadow">GET</span>
                  <span className="font-mono text-white text-lg tracking-wide">/api/lgu-list</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                  <Server className="w-3.5 h-3.5" /> Edge Infrastructure
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-[15px] text-[#aec6cf] mb-6 leading-relaxed">
                  The primary orchestration endpoint. Parallely executes downstream requests to Overpass, Mapillary, STAC, and OpenRouter to compute live stress indicators for all registered Local Government Units.
                </p>
                <div className="bg-black/30 rounded-lg p-4 border border-black/50">
                  <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">Query Parameters</div>
                  <div className="flex items-center gap-4 border-b border-white/5 pb-3 mb-3">
                    <code className="text-[#2e86c1] font-mono whitespace-nowrap text-sm">?region=[string]</code>
                    <span className="text-xs text-[#8ba1b0]">Optional. Filters explicitly by geometric region (e.g., NCR).</span>
                  </div>
                  <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2 mt-4">Caching</div>
                  <div className="text-xs text-white/60 font-mono">s-maxage=3600, stale-while-revalidate=86400</div>
                </div>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="bg-[#132338] border border-white/10 rounded-xl overflow-hidden shadow-card hover:border-white/20 transition-all">
              <div className="bg-[#07111a] px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="bg-[#c0392b] text-white px-3 py-1 rounded text-xs font-mono font-bold tracking-wider shadow">POST</span>
                  <span className="font-mono text-white text-lg tracking-wide">/api/classify</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#c9a84c]">
                  <Database className="w-3.5 h-3.5" /> VLM Accelerated
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-[15px] text-[#aec6cf] mb-6 leading-relaxed">
                  Triggers the OpenRouter Vision-Language pipeline (Nemotron-12b) to analyze an image payload and force output into a strict mathematical JSON taxonomy mapping severity.
                </p>
                <div className="bg-black/30 rounded-lg p-4 border border-black/50">
                  <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">JSON Body Payload</div>
                  <pre className="text-[#27ae60] font-mono text-sm overflow-x-auto">
{`{
  "imageUrl": "https://scontent.mapillary.com/.../img"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Endpoint 3 */}
            <div className="bg-[#132338] border border-white/10 rounded-xl overflow-hidden shadow-card hover:border-white/20 transition-all">
              <div className="bg-[#07111a] px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="bg-[#1e8449] text-white px-3 py-1 rounded text-xs font-mono font-bold tracking-wider shadow">GET</span>
                  <span className="font-mono text-white text-lg tracking-wide">/api/satellite</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                  <Server className="w-3.5 h-3.5" /> External Proxy
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-[15px] text-[#aec6cf] mb-6 leading-relaxed">
                  Queries the AWS Element84 STAC layer for recently captured Sentinel-2 L2A scene catalogs bounded to the provided geometries.
                </p>
                <div className="bg-black/30 rounded-lg p-4 border border-black/50">
                  <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">Query Parameters</div>
                  <div className="flex justify-between items-center">
                    <code className="text-[#2e86c1] font-mono text-sm">?bbox=[lng1,lat1,lng2,lat2]</code>
                    <span className="text-xs text-[#c0392b] font-bold tracking-widest uppercase px-2 py-0.5 border border-[#c0392b]/30 rounded">REQUIRED</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
