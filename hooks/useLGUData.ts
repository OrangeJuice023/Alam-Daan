import useSWR from 'swr';
import type { LGUData, MapillaryImage, RoadSegment } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useLGUList(region?: string) {
  const url = region ? `/api/lgu-list?region=${region}` : '/api/lgu-list';
  const { data, error, isLoading } = useSWR<LGUData[]>(url, fetcher, {
    refreshInterval: 3600000, // re-fetch every hour
    revalidateOnFocus: false,
  });
  return { lguList: data ?? [], error, isLoading };
}

export function useMapillaryImages(bbox: string | null) {
  const url = bbox ? `/api/mapillary?bbox=${bbox}&limit=20` : null;
  const { data, error, isLoading } = useSWR<MapillaryImage[]>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { images: data ?? [], error, isLoading };
}

export function useOSMRoads(bbox: string | null) {
  const url = bbox ? `/api/osm?bbox=${bbox}` : null;
  const { data, error, isLoading } = useSWR<{ type: 'FeatureCollection', features: RoadSegment[] }>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { roads: data?.features ?? [], error, isLoading };
}
