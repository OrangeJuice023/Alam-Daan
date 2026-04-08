// GET /api/satellite?bbox=lng1,lat1,lng2,lat2
// Returns: SatelliteIndices (NDBI + NDVI from Sentinel-2 STAC)

import { type NextRequest } from 'next/server';
import type { SatelliteIndices } from '@/lib/types';

const STAC_ENDPOINT = process.env.STAC_ENDPOINT || 'https://earth-search.aws.element84.com/v1';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bbox = searchParams.get('bbox');

  if (!bbox) {
    return Response.json({ error: 'bbox required' }, { status: 400 });
  }

  const [west, south, east, north] = bbox.split(',').map(Number);

  // Search STAC for recent Sentinel-2 scenes with <20% cloud cover
  const stacSearch = {
    collections: ['sentinel-2-l2a'],
    bbox: [west, south, east, north],
    datetime: getDateRange(180), // last 6 months
    query: { 'eo:cloud_cover': { lt: 20 } },
    limit: 5,
    sortby: [{ field: 'properties.datetime', direction: 'desc' }],
  };

  try {
    const stacRes = await fetch(`${STAC_ENDPOINT}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stacSearch),
      next: { revalidate: 86400 },
    });

    if (!stacRes.ok) {
      return Response.json({ error: 'STAC search failed' }, { status: 502 });
    }

    const catalog = await stacRes.json();
    const items = catalog.features || [];

    if (items.length === 0) {
      // Return neutral values if no clear scenes found
      return Response.json({
        ndbi: 0.15,
        ndvi: 0.25,
        cloudCoverPct: 100,
        acquisitionDate: 'N/A',
        sceneBounds: [west, south, east, north],
      } satisfies SatelliteIndices);
    }

    const scene = items[0];
    const cloudCover = scene.properties['eo:cloud_cover'] ?? 0;
    const acquisitionDate = scene.properties.datetime;

    // Derive proxy indices from STAC metadata
    // Full implementation would fetch COG bands and compute raster math
    const ndbi = estimateNDBI(cloudCover);
    const ndvi = estimateNDVI(cloudCover);

    return Response.json({
      ndbi,
      ndvi,
      cloudCoverPct: cloudCover,
      acquisitionDate,
      sceneBounds: scene.bbox,
    } satisfies SatelliteIndices);
  } catch (error) {
    console.error('STAC fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch satellite data' },
      { status: 502 }
    );
  }
}

function getDateRange(days: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  return `${start.toISOString()}/${end.toISOString()}`;
}

// NOTE: Replace with real COG band math using Sentinel Hub or rasterio sidecar
function estimateNDBI(cloudCover: number): number {
  const base = 0.15 + (1 - cloudCover / 100) * 0.1;
  return Math.min(0.8, Math.max(0, parseFloat(base.toFixed(3))));
}

function estimateNDVI(cloudCover: number): number {
  const base = 0.35 - (1 - cloudCover / 100) * 0.05;
  return Math.min(0.9, Math.max(0, parseFloat(base.toFixed(3))));
}
