// GeoJSON helpers and bbox utilities

export function bboxToString(bbox: [number, number, number, number]): string {
  return bbox.join(',');
}

export function bboxCenter(bbox: [number, number, number, number]): [number, number] {
  return [
    (bbox[0] + bbox[2]) / 2,
    (bbox[1] + bbox[3]) / 2,
  ];
}

export function bboxArea(bbox: [number, number, number, number]): number {
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  return width * height;
}

export function isPointInBbox(
  point: [number, number],
  bbox: [number, number, number, number]
): boolean {
  const [lng, lat] = point;
  return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

export function expandBbox(
  bbox: [number, number, number, number],
  factor: number
): [number, number, number, number] {
  const centerLng = (bbox[0] + bbox[2]) / 2;
  const centerLat = (bbox[1] + bbox[3]) / 2;
  const halfWidth = ((bbox[2] - bbox[0]) / 2) * factor;
  const halfHeight = ((bbox[3] - bbox[1]) / 2) * factor;
  return [
    centerLng - halfWidth,
    centerLat - halfHeight,
    centerLng + halfWidth,
    centerLat + halfHeight,
  ];
}
