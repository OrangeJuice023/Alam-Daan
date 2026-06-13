import { PageShell } from '@/components/shared/PageShell';
import { Microscope, Satellite, Network, Activity, Camera, Layers, Calculator, ListOrdered } from 'lucide-react';

export const metadata = {
  title: 'Methodology | Alam Daan',
};

const INDICATORS = [
  { icon: Microscope, color: '#c0392b', title: 'Decay Density', weight: 'w₁ = 0.45', body: 'A vision-language model reviews crowdsourced Mapillary street imagery and classifies each frame into one of four road conditions — good, minor, moderate, or severe. The per-city distribution is pooled into a single severity density between 0 and 1.' },
  { icon: Satellite, color: '#d68910', title: 'NDBI (Built-up)', weight: 'w₂ = 0.25', body: 'The Normalized Difference Built-up Index approximates impervious surface density. Higher built-up coverage raises the stress score, reflecting heat retention and reduced drainage. Derived from recent Sentinel-2 scene metadata via the Element84 STAC catalog.' },
  { icon: Layers, color: '#1e8449', title: 'NDVI Inverse', weight: 'w₃ = 0.15', body: 'Vegetation cover acts as a buffer. The Normalized Difference Vegetation Index enters the formula inverted, so greener cities receive a lower stress contribution — a proxy for urban canopy cooling and permeable ground.' },
  { icon: Network, color: '#2e86c1', title: 'Road Age Proxy', weight: 'w₄ = 0.15', body: 'A lightweight proxy for network maturity, estimated from OpenStreetMap road metadata. It nudges the score where older, denser networks suggest accumulated deferred maintenance, without requiring physical sensors.' },
];

const PIPELINE = [
  { icon: Camera, label: 'Collect', text: 'Pull street-level images (Mapillary), road network (OpenStreetMap), and the latest low-cloud Sentinel-2 scene (STAC) for each city bounding box.' },
  { icon: Microscope, label: 'Classify', text: 'Sample street images through the vision-language model to produce a road-condition distribution per city.' },
  { icon: Calculator, label: 'Score', text: 'Combine decay density with the satellite and road indices using the weighted USS formula, then assign a priority tier.' },
  { icon: ListOrdered, label: 'Rank', text: 'Order all cities by score and surface the result on the map and dashboard. Outputs are cached and refreshed hourly.' },
];

const TIERS = [
  { tier: 'Urgent', range: '≥ 0.70', color: '#c0392b' },
  { tier: 'High', range: '0.50 – 0.69', color: '#d68910' },
  { tier: 'Moderate', range: '0.30 – 0.49', color: '#2e86c1' },
  { tier: 'Low', range: '< 0.30', color: '#1e8449' },
];

export default function MethodologyPage() {
  return (
    <PageShell width="wide">

          <div className="mb-14 border-b border-white/10 pb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div className="max-w-3xl">
              <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-3">Methodology</div>
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Scientific Methodology</h1>
              <p className="text-[#aec6cf] text-lg font-light leading-relaxed">
                Alam Daan ranks cities by an <strong className="text-white">Urban Stress Score (USS)</strong> — a composite index that weighs road decay observed in street-level imagery against satellite-derived built-up and vegetation indices.
              </p>
            </div>
            <div className="bg-[#132338] border border-[#2e86c1]/30 rounded-xl p-6 relative overflow-hidden shadow-card shrink-0">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2e86c1]" />
              <div className="text-[10px] text-[#6c8394] font-mono tracking-widest uppercase mb-2">Formula</div>
              <code className="block font-mono text-base text-[#3498db] whitespace-nowrap">
                USS = (w₁·D) + (w₂·I<sub className="text-sm">NDBI</sub>) + (w₃·(1−I<sub className="text-sm">NDVI</sub>)) + (w₄·R<sub className="text-sm">age</sub>)
              </code>
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
              <Activity className="text-[#c9a84c] w-6 h-6" />
              Core Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {INDICATORS.map(({ icon: Icon, color, title, weight, body }) => (
                <div key={title} className="bg-[#1c3354]/40 border border-white/5 p-6 rounded-lg hover:bg-[#1c3354]/60 transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded shrink-0" style={{ backgroundColor: `${color}22`, color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-white leading-tight">{title}</h3>
                      <span className="font-mono text-[11px] text-[#6c8394]">{weight}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#8ba1b0] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
              <Network className="text-[#c9a84c] w-6 h-6" />
              How a Score Is Built
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PIPELINE.map(({ icon: Icon, label, text }, i) => (
                <div key={label} className="relative bg-[#132338]/60 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-3xl text-white/10 font-bold leading-none">{i + 1}</span>
                    <Icon className="w-5 h-5 text-[#2e86c1]" />
                  </div>
                  <div className="font-serif text-white text-lg mb-1">{label}</div>
                  <p className="text-sm text-[#8ba1b0] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                <ListOrdered className="text-[#c9a84c] w-6 h-6" />
                Priority Tiers
              </h2>
              <div className="bg-[#1c3354]/30 border border-white/5 rounded-lg divide-y divide-white/5">
                {TIERS.map(({ tier, range, color }) => (
                  <div key={tier} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-white font-medium">{tier}</span>
                    </div>
                    <span className="font-mono text-sm text-[#8ba1b0]">USS {range}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                <Microscope className="text-[#c9a84c] w-6 h-6" />
                Scope &amp; Limitations
              </h2>
              <div className="space-y-4 text-sm text-[#8ba1b0] leading-relaxed">
                <p>Coverage is scoped to <strong className="text-white">eight Highly Urbanized Cities</strong> across Luzon, the Visayas, and Mindanao, selected for sufficient Mapillary street-imagery density. Scores are only published where ground-level data exists; scaling to all 33 HUCs is planned via on-demand classification.</p>
                <p>Satellite indices are <strong className="text-white">proxies derived from scene metadata</strong>, not full raster band math. The road-age term is a heuristic from OSM metadata rather than a verified construction record. The USS is a prioritization signal, not an engineering assessment.</p>
                <p className="text-[#6c8394] font-mono text-xs pt-2 border-t border-white/5">Sources: Mapillary · OpenStreetMap (Overpass) · Sentinel-2 L2A via Element84 STAC. Refreshed hourly.</p>
              </div>
            </div>
          </section>

    </PageShell>
  );
}
