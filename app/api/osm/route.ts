// app/api/osm/route.ts
// GET /api/osm?bbox=lng1,lat1,lng2,lat2
// Returns: GeoJSON FeatureCollection of road segments

import { type NextRequest } from 'next/server';
import type { RoadSegment } from '@/lib/types';
import { parseBbox } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const bbox = parseBbox(req.nextUrl.searchParams.get('bbox'));
  if (!bbox) {
    return Response.json(
      { error: 'bbox required: lng1,lat1,lng2,lat2 within the Philippines, max 1.5° span' },
      { status: 400 }
    );
  }

  const [west, south, east, north] = bbox;

  const query = `
    [out:json][timeout:30];
    (
      way["highway"]["highway"!~"motorway|trunk|motorway_link|trunk_link"]
        (${south},${west},${north},${east});
    );
    out geom;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return Response.json({ error: 'Overpass API error' }, { status: 502 });
    }

    const osm = await res.json();

    const segments: RoadSegment[] = osm.elements
      .filter((el: Record<string, unknown>) => el.type === 'way' && el.geometry)
      .map((el: Record<string, unknown>) => ({
        osmId: String(el.id),
        geometry: {
          type: 'LineString' as const,
          coordinates: (el.geometry as Array<{ lon: number; lat: number }>).map(
            (pt) => [pt.lon, pt.lat]
          ),
        },
        tags: {
          highway: (el.tags as Record<string, string>)?.highway || 'unclassified',
          surface: (el.tags as Record<string, string>)?.surface,
          name: (el.tags as Record<string, string>)?.name,
          maxspeed: (el.tags as Record<string, string>)?.maxspeed,
        },
      }));

    return Response.json(
      { type: 'FeatureCollection', features: segments },
      { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch (err) {
    console.error('Overpass fetch error:', err);
    return Response.json({ error: 'Failed to fetch from Overpass' }, { status: 502 });
  }
}
