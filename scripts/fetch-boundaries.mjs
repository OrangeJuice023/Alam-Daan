// scripts/fetch-boundaries.mjs
// Fetches real administrative boundary polygons for the 8 registered LGUs
// from OSM Nominatim and writes public/ph-lgu-boundaries.geojson.
//
// Usage (Node 18+):  node scripts/fetch-boundaries.mjs
// Run once locally, review the output file, commit it. Re-run only if you
// add cities to the registry.
//
// Respects Nominatim usage policy: 1 request/second, descriptive User-Agent.

import { writeFileSync } from 'node:fs';

const CITIES = [
  { slug: 'manila',      name: 'Manila',         queries: ['City of Manila, Metro Manila, Philippines', 'Manila, Philippines'] },
  { slug: 'quezon-city', name: 'Quezon City',    queries: ['Quezon City, Metro Manila, Philippines'] },
  { slug: 'cebu-city',   name: 'Cebu City',      queries: ['Cebu City, Cebu, Philippines'] },
  { slug: 'davao-city',  name: 'Davao City',     queries: ['Davao City, Davao del Sur, Philippines', 'Davao City, Philippines'] },
  { slug: 'caloocan',    name: 'Caloocan',       queries: ['Caloocan, Metro Manila, Philippines'] },
  { slug: 'taguig',      name: 'Taguig',         queries: ['Taguig, Metro Manila, Philippines'] },
  { slug: 'iloilo-city', name: 'Iloilo City',    queries: ['Iloilo City, Iloilo, Philippines'] },
  { slug: 'zamboanga',   name: 'Zamboanga City', queries: ['Zamboanga City, Philippines'] },
];

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const HEADERS = {
  // Nominatim requires an identifying User-Agent
  'User-Agent': 'AlamDaan-LGU-StressMap/1.0 (PhilSA portfolio project; github.com/OrangeJuice023/Alam-Daan)',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBoundary(city) {
  for (const q of city.queries) {
    const url = new URL(NOMINATIM);
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'geojson');
    url.searchParams.set('polygon_geojson', '1');
    url.searchParams.set('polygon_threshold', '0.001'); // ~100 m simplification
    url.searchParams.set('limit', '1');

    const res = await fetch(url, { headers: HEADERS });
    await sleep(1100); // 1 req/sec policy

    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for "${q}", trying next query...`);
      continue;
    }

    const data = await res.json();
    const feature = data.features?.[0];
    const geomType = feature?.geometry?.type;

    if (feature && (geomType === 'Polygon' || geomType === 'MultiPolygon')) {
      return {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          slug: city.slug,
          name: city.name,
          osmDisplayName: feature.properties?.display_name ?? q,
        },
      };
    }
    console.warn(`  "${q}" returned ${geomType ?? 'nothing'}, trying next query...`);
  }
  return null;
}

const features = [];
for (const city of CITIES) {
  console.log(`Fetching boundary: ${city.name}`);
  const feature = await fetchBoundary(city);
  if (feature) {
    features.push(feature);
    console.log(`  ✓ ${feature.geometry.type}`);
  } else {
    console.error(`  ✗ FAILED for ${city.name} — map will show no polygon for this city`);
  }
}

const collection = { type: 'FeatureCollection', features };
const out = 'public/ph-lgu-boundaries.geojson';
writeFileSync(out, JSON.stringify(collection));

const sizeKb = (Buffer.byteLength(JSON.stringify(collection)) / 1024).toFixed(0);
console.log(`\nWrote ${out} (${features.length}/${CITIES.length} cities, ${sizeKb} kB)`);
if (features.length < CITIES.length) process.exitCode = 1;
