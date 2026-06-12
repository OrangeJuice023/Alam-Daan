// app/api/lgu-list/route.ts
// GET /api/lgu-list?region=NCR (optional filter)
// Returns: LGUData[] sorted by urbanStressScore desc

import { type NextRequest } from 'next/server';
import { getLGUList } from '@/lib/server/lguService';

// VLM classification across 8 LGUs can be slow; raise the function ceiling.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region');

  const lguList = await getLGUList(region);

  return Response.json(lguList, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
