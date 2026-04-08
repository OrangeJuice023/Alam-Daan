// GET /api/mapillary?bbox=lng1,lat1,lng2,lat2&limit=50
// Returns: MapillaryImage[]

import { type NextRequest } from 'next/server';

const MAPILLARY_BASE = 'https://graph.mapillary.com';
const TOKEN = process.env.MAPILLARY_ACCESS_TOKEN || '';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bbox = searchParams.get('bbox');
  const limit = searchParams.get('limit') || '50';

  if (!bbox) {
    return Response.json({ error: 'bbox required' }, { status: 400 });
  }

  if (!TOKEN) {
    // Return empty array if no token configured (graceful degradation)
    return Response.json([]);
  }

  const [west, south, east, north] = bbox.split(',').map(Number);

  const url = new URL(`${MAPILLARY_BASE}/images`);
  url.searchParams.set('access_token', TOKEN);
  url.searchParams.set('bbox', `${west},${south},${east},${north}`);
  url.searchParams.set('limit', limit);
  url.searchParams.set('fields', 'id,geometry,captured_at,sequence,thumb_2048_url');

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return Response.json(
        { error: 'Mapillary API error', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    const images = (data.data || []).map((img: Record<string, unknown>) => ({
      id: img.id,
      coordinates: (img.geometry as { coordinates: [number, number] }).coordinates,
      capturedAt: img.captured_at,
      thumbUrl: img.thumb_2048_url,
      sequenceId: img.sequence,
    }));

    return Response.json(images);
  } catch (error) {
    console.error('Mapillary fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch from Mapillary' },
      { status: 502 }
    );
  }
}
