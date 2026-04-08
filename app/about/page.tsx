import { Header } from '@/components/shared/Header';

export const metadata = {
  title: 'About | Alam Daan',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto w-full p-8 md:p-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-[#132338] relative rounded-2xl p-12 md:p-16 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-3xl w-full mx-auto text-center overflow-hidden">
          {/* Decorative glowing orb background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c9a84c]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#2e86c1]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full border border-[#c9a84c]/50 bg-[#1c3354] flex items-center justify-center text-[#c9a84c] text-3xl font-serif font-bold mb-8 mx-auto shadow-inner">
              GC
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-tight">Alam Daan</h1>
            <p className="text-[#2e86c1] font-serif text-lg italic mb-10 tracking-wide">Infrastructure Intelligence System</p>
            
            <div className="w-16 h-[1px] bg-white/20 mx-auto mb-10" />
            
            <p className="text-[#aec6cf] text-lg leading-relaxed mb-8 font-light">
              This application was architected and developed by <strong className="text-white font-medium">Gervi Corado</strong>. It serves as an active technical showcase and project resume crafted specifically for application to the <strong className="text-[#c9a84c] font-medium tracking-wide">Philippine Space Agency (PhilSA)</strong>.
            </p>
            
            <div className="bg-[#07111a]/50 border border-white/5 rounded-lg p-6 my-8 text-sm text-[#8ba1b0] leading-loose text-left font-mono">
              <span className="text-[#2e86c1] block mb-2 text-[10px] tracking-widest uppercase">System Stack & Integrations</span>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-white/80">Core Protocol:</span> Automated geospatial intelligence aggregation</li>
                <li><span className="text-white/80">Satellite Analytics:</span> Element84 STAC Sentinel-2 Indexing (NDBI/NDVI)</li>
                <li><span className="text-white/80">Vision-Language Pipeline:</span> OpenRouter VLM (nvidia/nemotron-nano-12b-v2-vl) parsing crowdsourced Mapillary imagery</li>
                <li><span className="text-white/80">Architecture:</span> Next.js 16 Edge runtime, Zustand state, Tailwind styling</li>
              </ul>
            </div>
            
            <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-mono mt-12">
              All data streamed programmatically in real-time.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
