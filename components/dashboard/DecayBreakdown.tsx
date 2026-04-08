'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DecayBreakdown() {
  const { selectedLGU } = useDashboardStore();

  if (!selectedLGU) return null;

  const dist = selectedLGU.roadStats.distribution;
  const data = [
    { name: 'Severe', value: dist.SEVERE, color: '#c0392b' },
    { name: 'Moderate', value: dist.MODERATE, color: '#d68910' },
    { name: 'Minor', value: dist.MINOR, color: '#1a5276' },
    { name: 'Good', value: dist.GOOD, color: '#1e8449' },
  ];

  return (
    <div className="white-card p-6 mb-8 relative group overflow-hidden">
      <div className="h-1 bg-[#2e86c1] absolute top-0 left-0 right-0" />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Detail text */}
        <div className="md:w-1/3">
          <div className="text-sm font-mono text-[#6c8394] tracking-widest uppercase mb-2">Analysis Result</div>
          <h2 className="font-serif text-[#1a2332] text-2xl font-semibold mb-3">
            Infrastructure Decay Distribution
          </h2>
          <p className="text-sm text-[#4a5568] leading-relaxed mb-6">
            Based on the analysis of {selectedLGU.roadStats.imagesAnalyzed.toLocaleString()} recent crowdsourced road images, 
            extrapolated across <strong>{selectedLGU.roadStats.assessedKm} km</strong> of assessed 
            primary and secondary roadways within the {selectedLGU.name} area.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-[#6c8394] uppercase tracking-wider font-mono">Assessed Dist</div>
              <div className="text-lg font-semibold text-[#1a2332] font-mono">{selectedLGU.roadStats.assessedKm} km</div>
            </div>
            <div>
              <div className="text-[10px] text-[#6c8394] uppercase tracking-wider font-mono">Images</div>
              <div className="text-lg font-semibold text-[#1a2332] font-mono">{selectedLGU.roadStats.imagesAnalyzed}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="md:w-2/3 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#4a5568', fontSize: 12, fontFamily: 'Inter' }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: '#f7fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#132338] text-white p-2 rounded text-xs font-mono shadow-xl border border-white/10">
                        {payload[0].payload.name}: {payload[0].value?.toString()}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]} 
                barSize={32}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
