export type DecayClass = 'GOOD' | 'MINOR' | 'MODERATE' | 'SEVERE';

export type PriorityTier = 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW';

export interface MapillaryImage {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  capturedAt: string;
  thumbUrl: string;
  sequenceId: string;
}

export interface ClassificationResult {
  imageId: string;
  decayClass: DecayClass;
  confidence: number;
  probabilities: Record<DecayClass, number>;
}

export interface RoadSegment {
  osmId: string;
  geometry: GeoJSON.LineString;
  tags: {
    highway: string;
    surface?: string;
    name?: string;
    maxspeed?: string;
  };
  decayScore?: number;
  decayDistribution?: Record<DecayClass, number>;
  imageCount?: number;
}

export interface SatelliteIndices {
  ndbi: number;
  ndvi: number;
  cloudCoverPct: number;
  acquisitionDate: string;
  sceneBounds: [number, number, number, number];
}

export interface LGUData {
  slug: string;
  name: string;
  region: string;
  bbox: [number, number, number, number];
  centroid: [number, number];
  priorityRank: number;
  tier: PriorityTier;
  urbanStressScore: number;
  decayDensity: number;
  satellite: SatelliteIndices;
  roadStats: {
    assessedKm: number;
    totalSegments: number;
    imagesAnalyzed: number;
    distribution: Record<DecayClass, number>;
  };
  lastUpdated: string;
  recommendedAction: string;
}

export interface StressMapFeature {
  type: 'Feature';
  geometry: GeoJSON.Polygon;
  properties: Pick<LGUData,
    'slug' | 'name' | 'region' | 'priorityRank' | 'tier' |
    'urbanStressScore' | 'decayDensity'
  >;
}
