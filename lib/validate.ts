// lib/validate.ts
// Input validation shared by API routes.

export type Bbox = [number, number, number, number]; // [west, south, east, north]

// Rough envelope of the Philippines — rejects requests outside national territory.
const PH_ENVELOPE: Bbox = [116.0, 4.0, 127.5, 21.5];

// Max span per axis (degrees). Keeps Overpass/Mapillary queries city-sized.
const MAX_SPAN_DEG = 1.5;

export function parseBbox(raw: string | null): Bbox | null {
  if (!raw) return null;

  const parts = raw.split(',').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;

  const [west, south, east, north] = parts;

  if (west >= east || south >= north) return null;
  if (east - west > MAX_SPAN_DEG || north - south > MAX_SPAN_DEG) return null;
  if (
    west < PH_ENVELOPE[0] || south < PH_ENVELOPE[1] ||
    east > PH_ENVELOPE[2] || north > PH_ENVELOPE[3]
  ) {
    return null;
  }

  return [west, south, east, north];
}

export function clampLimit(raw: string | null, fallback = 30, max = 100): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return fallback;
  return Math.min(n, max);
}

// Only allow classifying images actually hosted by Mapillary's CDN,
// so /api/classify can't be abused as a free proxy to the OpenRouter key.
export function isAllowedImageUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string') return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    return (
      url.hostname === 'mapillary.com' ||
      url.hostname.endsWith('.mapillary.com') ||
      url.hostname.endsWith('.mapillary.com.cdn.fbsbx.com') ||
      url.hostname.endsWith('.fbcdn.net') // Mapillary thumbs are served from Meta CDN
    );
  } catch {
    return false;
  }
}
