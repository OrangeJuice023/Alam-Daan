import { Header } from '@/components/shared/Header';
import { Microscope, Satellite, Network, Activity } from 'lucide-react';

export const metadata = {
  title: 'Methodology | Alam Daan',
};

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto w-full p-8 md:p-12 relative flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Scientific Methodology</h1>
              <p className="text-[#aec6cf] text-lg font-light leading-relaxed">
                The core of the Alam Daan intelligence engine relies on the <strong className="text-white">Urban Stress Score (USS)</strong> — a proprietary composite index mathematically weighing physical decay observations gathered via street-level imagery against environmental satellite indicators.
              </p>
            </div>
            
            <div className="bg-[#132338] border border-[#2e86c1]/30 rounded-xl p-6 relative overflow-hidden shadow-card shrink-0">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2e86c1]" />
              <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">Formula</div>
              <code className="block font-mono text-lg text-[#3498db]">
                USS = (w₁×D) + (w₂×I<sub className="text-sm">NDBI</sub>) + (w₃×(1-I<sub className="text-sm">NDVI</sub>)) + (w₄×R<sub className="text-sm">age</sub>)
              </code>
            </div>
          </div>

          <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
            <Activity className="text-[#c9a84c] w-6 h-6" />
            Core Indicators
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1c3354]/40 border border-white/5 p-6 rounded-lg hover:bg-[#1c3354]/60 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#c0392b]/20 rounded text-[#c0392b]">
                  <Microscope className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white">Decay Density (w₁ = 0.45)</h4>
              </div>
              <p className="text-sm text-[#8ba1b0] leading-relaxed">
                Extracted via a Vision-Language Model interacting with crowdsourced Mapillary spatial imagery. Physical potholes, cracking, and utility decay are mathematically pooled into a severity density index.
              </p>
            </div>

            <div className="bg-[#1c3354]/40 border border-white/5 p-6 rounded-lg hover:bg-[#1c3354]/60 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#d68910]/20 rounded text-[#d68910]">
                  <Satellite className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white">NDBI Density (w₂ = 0.25)</h4>
              </div>
              <p className="text-sm text-[#8ba1b0] leading-relaxed">
                The Normalized Difference Built-up Index (NDBI) calculated dynamically using shortwave infrared and near-infrared bands from Element84 STAC Sentinel-2 catalogs to map concrete density.
              </p>
            </div>

            <div className="bg-[#1c3354]/40 border border-white/5 p-6 rounded-lg hover:bg-[#1c3354]/60 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#1e8449]/20 rounded text-[#1e8449]">
                  <Satellite className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white">NDVI Inverse (w₃ = 0.15)</h4>
              </div>
              <p className="text-sm text-[#8ba1b0] leading-relaxed">
                Using the Normalized Difference Vegetation Index as an inverse constraint. High vegetation presence mathematically buffers the overarching stress score, simulating urban canopy cooling.
              </p>
            </div>

            <div className="bg-[#1c3354]/40 border border-white/5 p-6 rounded-lg hover:bg-[#1c3354]/60 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#2e86c1]/20 rounded text-[#2e86c1]">
                  <Network className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white">Road Age Proxy (w₄ = 0.15)</h4>
              </div>
              <p className="text-sm text-[#8ba1b0] leading-relaxed">
                Interpolated timeline topology utilizing OpenStreetMap (OSM) element history endpoints to estimate chronological infrastructure deterioration without requiring physical sensors.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
