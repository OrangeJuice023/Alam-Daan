// app/api/classify/route.ts
// POST /api/classify
// Body: { imageUrl: string } — must be a Mapillary-hosted HTTPS URL
// Returns: ClassificationResult

import { type NextRequest, NextResponse } from 'next/server';
import { classifyImage } from '@/lib/server/lguService';
import { isAllowedImageUrl } from '@/lib/validate';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const imageUrl = (body as { imageUrl?: unknown })?.imageUrl;

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
  }

  // Reject non-Mapillary URLs so this endpoint can't be abused as an
  // open proxy to the OpenRouter API key.
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json(
      { error: 'imageUrl must be an https URL hosted by Mapillary' },
      { status: 400 }
    );
  }

  const result = await classifyImage(imageUrl);
  return NextResponse.json(result);
}
