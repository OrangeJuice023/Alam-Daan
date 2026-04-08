// GET /api/lgu-list?region=NCR (optional filter)
// Returns: LGUData[] sorted by urbanStressScore desc

import { type NextRequest } from 'next/server';
import { computeUSS, scoreToTier, decayDistributionToDensity } from '@/lib/uss';
import type { LGUData, MapillaryImage, SatelliteIndices, ClassificationResult, DecayClass, PriorityTier } from '@/lib/types';

// Seed LGU registry (add more cities over time)
// bbox format: [west, south, east, north]
const LGU_REGISTRY = [
  { slug: 'manila',      name: 'Manila',        region: 'NCR',  bbox: [120.961, 14.556, 120.999, 14.615] as [number,number,number,number] },
  { slug: 'quezon-city', name: 'Quezon City',   region: 'NCR',  bbox: [121.030, 14.590, 121.135, 14.750] as [number,number,number,number] },
  { slug: 'cebu-city',   name: 'Cebu City',     region: 'VII',  bbox: [123.848, 10.280, 123.932, 10.385] as [number,number,number,number] },
  { slug: 'davao-city',  name: 'Davao City',    region: 'XI',   bbox: [125.541, 7.044,  125.640, 7.152]  as [number,number,number,number] },
  { slug: 'caloocan',    name: 'Caloocan',      region: 'NCR',  bbox: [120.953, 14.620, 121.006, 14.763] as [number,number,number,number] },
  { slug: 'taguig',      name: 'Taguig',        region: 'NCR',  bbox: [121.028, 14.485, 121.085, 14.565] as [number,number,number,number] },
  { slug: 'iloilo-city', name: 'Iloilo City',   region: 'VI',   bbox: [122.526, 10.685, 122.582, 10.735] as [number,number,number,number] },
  { slug: 'zamboanga',   name: 'Zamboanga City',region: 'IX',   bbox: [122.045, 6.880,  122.120, 6.960]  as [number,number,number,number] },
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const regionFilter = searchParams.get('region');

  const registry = regionFilter
    ? LGU_REGISTRY.filter(l => l.region === regionFilter)
    : LGU_REGISTRY;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Fetch all LGUs in parallel
  const results = await Promise.allSettled(
    registry.map(lgu => fetchLGUData(lgu, baseUrl))
  );

  const lguList: LGUData[] = results
    .filter((r): r is PromiseFulfilledResult<LGUData> => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => b.urbanStressScore - a.urbanStressScore)
    .map((lgu, i) => ({ ...lgu, priorityRank: i + 1 }));

  return Response.json(lguList, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

async function fetchLGUData(
  lgu: typeof LGU_REGISTRY[0],
  baseUrl: string
): Promise<LGUData> {
  const bboxStr = lgu.bbox.join(',');

  const [mapillaryData, satelliteData] = await Promise.allSettled([
    fetch(`${baseUrl}/api/mapillary?bbox=${bboxStr}&limit=30`).then(r => r.json()),
    fetch(`${baseUrl}/api/satellite?bbox=${bboxStr}`).then(r => r.json()),
  ]);

  const images: MapillaryImage[] = mapillaryData.status === 'fulfilled' && Array.isArray(mapillaryData.value)
    ? mapillaryData.value : [];

  const satellite: SatelliteIndices = satelliteData.status === 'fulfilled' && satelliteData.value && !satelliteData.value.error
    ? satelliteData.value
    : { ndbi: 0.15, ndvi: 0.30, cloudCoverPct: 100, acquisitionDate: 'N/A', sceneBounds: lgu.bbox };

  // Classify a sample of images (classify up to 5 per LGU to avoid rate limits)
  const sampleImages = images.slice(0, 5);
  const classifications = await Promise.allSettled(
    sampleImages.map(img =>
      fetch(`${baseUrl}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: img.thumbUrl }),
      }).then(r => r.json())
    )
  );

  const results: ClassificationResult[] = classifications
    .filter((r): r is PromiseFulfilledResult<ClassificationResult> => r.status === 'fulfilled' && !r.value.error)
    .map(r => r.value);

  // Build decay distribution from classification results
  const distribution: Record<DecayClass, number> = { GOOD: 0, MINOR: 0, MODERATE: 0, SEVERE: 0 };
  if (results.length > 0) {
    results.forEach(r => { distribution[r.decayClass]++; });
    const total = results.length;
    (Object.keys(distribution) as DecayClass[]).forEach(k => {
      distribution[k] = parseFloat(((distribution[k] / total) * 100).toFixed(1));
    });
  } else {
    // No images: distribute neutrally
    distribution.GOOD = 40; distribution.MINOR = 35;
    distribution.MODERATE = 20; distribution.SEVERE = 5;
  }

  const decayDensity = decayDistributionToDensity(distribution);
  const urbanStressScore = computeUSS({ decayDensity, ndbi: satellite.ndbi, ndvi: satellite.ndvi });
  const tier = scoreToTier(urbanStressScore);

  const centroid: [number, number] = [
    (lgu.bbox[0] + lgu.bbox[2]) / 2,
    (lgu.bbox[1] + lgu.bbox[3]) / 2,
  ];

  return {
    slug: lgu.slug,
    name: lgu.name,
    region: lgu.region,
    bbox: lgu.bbox,
    centroid,
    priorityRank: 0, // set after sorting
    tier,
    urbanStressScore,
    decayDensity,
    satellite,
    roadStats: {
      assessedKm: parseFloat((Math.random() * 200 + 20).toFixed(1)), // Replace with OSM road length calc
      totalSegments: Math.floor(images.length * 3.5),
      imagesAnalyzed: images.length,
      distribution,
    },
    lastUpdated: new Date().toISOString(),
    recommendedAction: getRecommendation(tier),
  };
}

function getRecommendation(tier: PriorityTier): string {
  const map: Record<PriorityTier, string> = {
    URGENT:   'Schedule comprehensive road audit within 30 days. Coordinate with DPWH Regional Office for emergency repair funding.',
    HIGH:     'Queue for next quarterly road assessment. Submit maintenance request to LGU engineering office.',
    MODERATE: 'Include in annual maintenance plan. Prioritize sidewalk accessibility for PWD compliance.',
    LOW:      'Maintain standard inspection schedule. Document as reference baseline for future comparisons.',
  };
  return map[tier];
}
