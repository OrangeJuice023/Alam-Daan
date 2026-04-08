// Urban Stress Score — composite 0–1 index
// USS = (w1 × decay_density) + (w2 × norm_ndbi) + (w3 × (1 - norm_ndvi)) + (w4 × road_age_proxy)

import { type DecayClass, type PriorityTier } from './types';

export interface USSInput {
  decayDensity: number;       // 0–1: weighted average severity from image classifier
  ndbi: number;               // raw NDBI value, typically -0.5 to 0.8
  ndvi: number;               // raw NDVI value, typically -0.2 to 0.9
  roadAgeProxy?: number;      // 0–1: estimated from OSM last_edit and highway class
}

export interface USSWeights {
  decayDensity: number;
  ndbi: number;
  ndviInverse: number;
  roadAgeProxy: number;
}

const DEFAULT_WEIGHTS: USSWeights = {
  decayDensity: 0.45,
  ndbi:         0.25,
  ndviInverse:  0.15,
  roadAgeProxy: 0.15,
};

export function computeUSS(input: USSInput, weights = DEFAULT_WEIGHTS): number {
  const { decayDensity, ndbi, ndvi, roadAgeProxy = 0.3 } = input;

  // Normalize NDBI from [-0.5, 0.8] to [0, 1]
  const normNDBI = clamp((ndbi + 0.5) / 1.3, 0, 1);

  // Normalize NDVI from [-0.2, 0.9] to [0, 1], then invert (low NDVI = high stress)
  const normNDVI = clamp((ndvi + 0.2) / 1.1, 0, 1);
  const ndviInverse = 1 - normNDVI;

  const uss =
    weights.decayDensity * clamp(decayDensity, 0, 1) +
    weights.ndbi         * normNDBI +
    weights.ndviInverse  * ndviInverse +
    weights.roadAgeProxy * clamp(roadAgeProxy, 0, 1);

  return parseFloat(clamp(uss, 0, 1).toFixed(4));
}

export function scoreToTier(uss: number): PriorityTier {
  if (uss >= 0.70) return 'URGENT';
  if (uss >= 0.50) return 'HIGH';
  if (uss >= 0.30) return 'MODERATE';
  return 'LOW';
}

export function decayDistributionToDensity(
  distribution: Record<DecayClass, number>
): number {
  // Weighted average: GOOD=0, MINOR=0.33, MODERATE=0.67, SEVERE=1.0
  const weights: Record<DecayClass, number> = {
    GOOD: 0, MINOR: 0.33, MODERATE: 0.67, SEVERE: 1.0,
  };
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return Object.entries(distribution).reduce(
    (sum, [cls, pct]) => sum + weights[cls as DecayClass] * (pct / total), 0
  );
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
