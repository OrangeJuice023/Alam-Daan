// lib/roadLength.ts
// Geodesic length computation for road geometries (GeoJSON LineStrings).
// Usable both server-side and client-side (e.g. on segments returned
// by /api/osm) — pure math, no dependencies.

import type { RoadSegment } from '@/lib/types';

const EARTH_RADIUS_KM = 6371.0088; // IUGG mean Earth radius

/**
 * Great-circle distance between two [lng, lat] points, in kilometers.
 */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Total length of a GeoJSON LineString in kilometers.
 */
export function lineStringKm(line: GeoJSON.LineString): number {
  const coords = line.coordinates as [number, number][];
  let km = 0;
  for (let i = 1; i < coords.length; i++) {
    km += haversineKm(coords[i - 1], coords[i]);
  }
  return km;
}

/**
 * Total length of a set of road segments in kilometers, rounded to 0.1 km.
 */
export function totalRoadKm(segments: RoadSegment[]): number {
  const km = segments.reduce((sum, seg) => sum + lineStringKm(seg.geometry), 0);
  return parseFloat(km.toFixed(1));
}
