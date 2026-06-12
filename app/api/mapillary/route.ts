// app/api/mapillary/route.ts
// GET /api/mapillary?bbox=lng1,lat1,lng2,lat2&limit=50
// Returns: MapillaryImage[]

import { type NextRequest } from 'next/server';
import { getMapillaryImages } from '@/lib/server/lguService';
import { parseBbox, clampLimit } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const bbox = parseBbox(searchParams.get('bbox'));
  if (!bbox) {
    return Response.json(
      { error: 'bbox required: lng1,lat1,lng2,lat2 within the Philippines, max 1.5° span' },
      { status: 400 }
    );
  }

  const limit = clampLimit(searchParams.get('limit'), 50, 100);

  const images = await getMapillaryImages(bbox, limit);
  return Response.json(images, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  });
}
