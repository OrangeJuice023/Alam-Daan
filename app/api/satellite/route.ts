// app/api/satellite/route.ts
// GET /api/satellite?bbox=lng1,lat1,lng2,lat2
// Returns: SatelliteIndices (NDBI + NDVI proxies from Sentinel-2 STAC metadata)

import { type NextRequest } from 'next/server';
import { getSatelliteIndices } from '@/lib/server/lguService';
import { parseBbox } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const bbox = parseBbox(req.nextUrl.searchParams.get('bbox'));
  if (!bbox) {
    return Response.json(
      { error: 'bbox required: lng1,lat1,lng2,lat2 within the Philippines, max 1.5° span' },
      { status: 400 }
    );
  }

  const indices = await getSatelliteIndices(bbox);
  return Response.json(indices, {
    headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' },
  });
}
