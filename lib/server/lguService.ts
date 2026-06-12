// lib/server/lguService.ts
// Server-only data layer. Pages and API routes call these functions DIRECTLY —
// never via fetch() to our own /api/* routes. This is what makes the app
// buildable and runnable on Vercel without NEXT_PUBLIC_APP_URL hacks.

import { computeUSS, scoreToTier, decayDistributionToDensity } from '@/lib/uss';
import type {
  LGUData,
  MapillaryImage,
  SatelliteIndices,
  ClassificationResult,
  DecayClass,
  PriorityTier,
} from '@/lib/types';
import type { Bbox } from '@/lib/validate';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

// bbox format: [west, south, east, north]
export const LGU_REGISTRY = [
  { slug: 'manila',      name: 'Manila',         region: 'NCR', bbox: [120.961, 14.556, 120.999, 14.615] as Bbox },
  { slug: 'quezon-city', name: 'Quezon City',    region: 'NCR', bbox: [121.030, 14.590, 121.135, 14.750] as Bbox },
  { slug: 'cebu-city',   name: 'Cebu City',      region: 'VII', bbox: [123.848, 10.280, 123.932, 10.385] as Bbox },
  { slug: 'davao-city',  name: 'Davao City',     region: 'XI',  bbox: [125.541, 7.044,  125.640, 7.152]  as Bbox },
  { slug: 'caloocan',    name: 'Caloocan',       region: 'NCR', bbox: [120.953, 14.620, 121.006, 14.763] as Bbox },
  { slug: 'taguig',      name: 'Taguig',         region: 'NCR', bbox: [121.028, 14.485, 121.085, 14.565] as Bbox },
  { slug: 'iloilo-city', name: 'Iloilo City',    region: 'VI',  bbox: [122.526, 10.685, 122.582, 10.735] as Bbox },
  { slug: 'zamboanga',   name: 'Zamboanga City', region: 'IX',  bbox: [122.045, 6.880,  122.120, 6.960]  as Bbox },
];

const IMAGES_PER_LGU = 30;     // Mapillary fetch limit per city
const CLASSIFY_SAMPLE = 5;     // VLM calls per city (free-tier rate-limit budget)

// ---------------------------------------------------------------------------
// Mapillary
// ---------------------------------------------------------------------------

export async function getMapillaryImages(bbox: Bbox, limit = IMAGES_PER_LGU): Promise<MapillaryImage[]> {
  const token = process.env.MAPILLARY_ACCESS_TOKEN;
  if (!token) return []; // graceful degradation: no token configured

  const url = new URL('https://graph.mapillary.com/images');
  url.searchParams.set('access_token', token);
  url.searchParams.set('bbox', bbox.join(','));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fields', 'id,geometry,captured_at,sequence,thumb_2048_url');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.data ?? []).map((img: Record<string, unknown>) => ({
      id: String(img.id),
      coordinates: (img.geometry as { coordinates: [number, number] }).coordinates,
      capturedAt: String(img.captured_at ?? ''),
      thumbUrl: String(img.thumb_2048_url ?? ''),
      sequenceId: String(img.sequence ?? ''),
    }));
  } catch (err) {
    console.error('Mapillary fetch error:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Sentinel-2 STAC
// ---------------------------------------------------------------------------

const STAC_ENDPOINT = process.env.STAC_ENDPOINT || 'https://earth-search.aws.element84.com/v1';

export async function getSatelliteIndices(bbox: Bbox): Promise<SatelliteIndices> {
  const neutral: SatelliteIndices = {
    ndbi: 0.15,
    ndvi: 0.25,
    cloudCoverPct: 100,
    acquisitionDate: 'N/A',
    sceneBounds: bbox,
  };

  const stacSearch = {
    collections: ['sentinel-2-l2a'],
    bbox,
    datetime: getDateRange(180),
    query: { 'eo:cloud_cover': { lt: 20 } },
    limit: 5,
    sortby: [{ field: 'properties.datetime', direction: 'desc' }],
  };

  try {
    const res = await fetch(`${STAC_ENDPOINT}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stacSearch),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return neutral;

    const catalog = await res.json();
    const scene = (catalog.features ?? [])[0];
    if (!scene) return neutral;

    const cloudCover = scene.properties?.['eo:cloud_cover'] ?? 0;

    // NOTE: proxy indices derived from scene metadata.
    // Real implementation would fetch COG bands and compute raster math.
    return {
      ndbi: estimateNDBI(cloudCover),
      ndvi: estimateNDVI(cloudCover),
      cloudCoverPct: cloudCover,
      acquisitionDate: scene.properties?.datetime ?? 'N/A',
      sceneBounds: scene.bbox ?? bbox,
    };
  } catch (err) {
    console.error('STAC fetch error:', err);
    return neutral;
  }
}

function getDateRange(days: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  return `${start.toISOString()}/${end.toISOString()}`;
}

function estimateNDBI(cloudCover: number): number {
  const base = 0.15 + (1 - cloudCover / 100) * 0.1;
  return Math.min(0.8, Math.max(0, parseFloat(base.toFixed(3))));
}

function estimateNDVI(cloudCover: number): number {
  const base = 0.35 - (1 - cloudCover / 100) * 0.05;
  return Math.min(0.9, Math.max(0, parseFloat(base.toFixed(3))));
}

// ---------------------------------------------------------------------------
// Road network statistics (Overpass `make stat` — real lengths, tiny payload)
// ---------------------------------------------------------------------------

export interface RoadNetworkStats {
  totalKm: number;       // sum of way lengths in the bbox, in km
  totalSegments: number; // number of OSM ways
  source: 'osm' | 'estimate';
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

// Overpass fair-use policy allows max 2 concurrent connections per client.
// This limiter ensures all 8 LGU queries respect that even though
// buildLGUData runs in parallel.
const overpassLimit = createLimiter(2);

export async function getRoadStats(bbox: Bbox): Promise<RoadNetworkStats | null> {
  const [west, south, east, north] = bbox;

  // `make stat` aggregates length server-side: the response is a single
  // ~200-byte element instead of megabytes of geometry.
  const query = `
    [out:json][timeout:25];
    way["highway"]["highway"!~"motorway|trunk|motorway_link|trunk_link"]
      (${south},${west},${north},${east});
    make stat ways=count(ways),length_m=sum(length());
    out;
  `;

  try {
    return await overpassLimit(async () => {
      const res = await fetch(
        `${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`,
        {
          next: { revalidate: 86400 }, // road networks change slowly; cache daily
          signal: AbortSignal.timeout(20000),
        }
      );
      if (!res.ok) return null;

      const data = await res.json();
      const stat = (data.elements ?? []).find(
        (el: Record<string, unknown>) => el.type === 'stat'
      );
      if (!stat?.tags) return null;

      const lengthM = Number(stat.tags.length_m);
      const ways = Number(stat.tags.ways);
      if (!Number.isFinite(lengthM) || !Number.isFinite(ways)) return null;

      return {
        totalKm: parseFloat((lengthM / 1000).toFixed(1)),
        totalSegments: ways,
        source: 'osm' as const,
      };
    });
  } catch (err) {
    console.error('Overpass road stats error:', err);
    return null;
  }
}

function createLimiter(concurrency: number) {
  let active = 0;
  const waiting: Array<() => void> = [];

  return async function limit<T>(task: () => Promise<T>): Promise<T> {
    if (active >= concurrency) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    active++;
    try {
      return await task();
    } finally {
      active--;
      waiting.shift()?.();
    }
  };
}

// ---------------------------------------------------------------------------
// VLM classification (OpenRouter, plain fetch — no SDK needed)
// ---------------------------------------------------------------------------

const CLASSIFY_PROMPT = `You are an infrastructure expert classifying road decay. Analyze this street-level image and categorize the road condition.

Respond ONLY with a valid JSON object strictly adhering to this format:
{
  "decayClass": "GOOD" | "MINOR" | "MODERATE" | "SEVERE",
  "confidence": <number between 0 and 1>,
  "probabilities": {
    "GOOD": <number>,
    "MINOR": <number>,
    "MODERATE": <number>,
    "SEVERE": <number>
  }
}
The sum of probabilities must equal 1.0.`;

export async function classifyImage(imageUrl: string): Promise<ClassificationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return simulateClassification(imageUrl);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: CLASSIFY_PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);

    const data = await res.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content received from OpenRouter.');

    const jsonMatch =
      content.match(/```json\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*\})/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);

    return {
      imageId: imageUrl.split('/').pop() || 'unknown',
      decayClass: parsed.decayClass ?? 'GOOD',
      confidence: parsed.confidence ?? 0.5,
      probabilities:
        parsed.probabilities ?? { GOOD: 0.25, MINOR: 0.25, MODERATE: 0.25, SEVERE: 0.25 },
    };
  } catch (err) {
    console.error('Classification error:', err);
    return simulateClassification(imageUrl);
  }
}

export function simulateClassification(imageUrl: string): ClassificationResult {
  const hash = simpleHash(imageUrl);
  const classes: DecayClass[] = ['GOOD', 'MINOR', 'MODERATE', 'SEVERE'];
  const idx = hash % 4;
  const confidence = 0.5 + (hash % 50) / 100;

  return {
    imageId: imageUrl.split('/').pop() || 'unknown',
    decayClass: classes[idx],
    confidence: parseFloat(confidence.toFixed(3)),
    probabilities: {
      GOOD: idx === 0 ? 0.6 : 0.1,
      MINOR: idx === 1 ? 0.5 : 0.15,
      MODERATE: idx === 2 ? 0.55 : 0.12,
      SEVERE: idx === 3 ? 0.65 : 0.08,
    },
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// LGU aggregation
// ---------------------------------------------------------------------------

export async function getLGUList(region?: string | null): Promise<LGUData[]> {
  const registry = region ? LGU_REGISTRY.filter((l) => l.region === region) : LGU_REGISTRY;

  const results = await Promise.allSettled(registry.map((lgu) => buildLGUData(lgu)));

  return results
    .filter((r): r is PromiseFulfilledResult<LGUData> => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => b.urbanStressScore - a.urbanStressScore)
    .map((lgu, i) => ({ ...lgu, priorityRank: i + 1 }));
}

async function buildLGUData(lgu: (typeof LGU_REGISTRY)[0]): Promise<LGUData> {
  const [imagesResult, satelliteResult, roadStatsResult] = await Promise.allSettled([
    getMapillaryImages(lgu.bbox),
    getSatelliteIndices(lgu.bbox),
    getRoadStats(lgu.bbox),
  ]);

  const images = imagesResult.status === 'fulfilled' ? imagesResult.value : [];
  const satellite: SatelliteIndices =
    satelliteResult.status === 'fulfilled'
      ? satelliteResult.value
      : { ndbi: 0.15, ndvi: 0.3, cloudCoverPct: 100, acquisitionDate: 'N/A', sceneBounds: lgu.bbox };
  const roadStats =
    roadStatsResult.status === 'fulfilled' ? roadStatsResult.value : null;

  // Classify a sample of images (direct function calls — no internal HTTP)
  const sample = images.filter((img) => img.thumbUrl).slice(0, CLASSIFY_SAMPLE);
  const classified = await Promise.allSettled(sample.map((img) => classifyImage(img.thumbUrl)));
  const results = classified
    .filter((r): r is PromiseFulfilledResult<ClassificationResult> => r.status === 'fulfilled')
    .map((r) => r.value);

  const distribution: Record<DecayClass, number> = { GOOD: 0, MINOR: 0, MODERATE: 0, SEVERE: 0 };
  if (results.length > 0) {
    results.forEach((r) => { distribution[r.decayClass]++; });
    const total = results.length;
    (Object.keys(distribution) as DecayClass[]).forEach((k) => {
      distribution[k] = parseFloat(((distribution[k] / total) * 100).toFixed(1));
    });
  } else {
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

  // Real OSM road-network length when Overpass responds; otherwise a
  // deterministic estimate from image coverage.
  const assessedKm = roadStats
    ? roadStats.totalKm
    : parseFloat((images.length * 1.8 + 12).toFixed(1));
  const totalSegments = roadStats
    ? roadStats.totalSegments
    : Math.floor(images.length * 3.5);

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
      assessedKm,
      totalSegments,
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
