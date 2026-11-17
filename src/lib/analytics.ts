import { StockItem, Hotspot } from './types';

export const ACCEPTED_PINS = ['3524', '3524!6'];

export function verifySecurityPin(input: string): boolean {
  const normalized = input.trim();
  return ACCEPTED_PINS.includes(normalized);
}

export function calculateStockAvailabilityPercent(stock: StockItem[]): number {
  const totalReceived = stock.reduce((acc, item) => acc + item.totalReceived, 0);
  const totalInHand = stock.reduce((acc, item) => acc + item.currentStock, 0);
  if (totalReceived <= 0) return 0;
  return Math.round((totalInHand / totalReceived) * 100);
}

export function calculateFacilityStockSummary(stock: StockItem[], facilityName?: string) {
  const filtered = facilityName ? stock.filter((s) => s.facility === facilityName) : stock;
  const totalReceived = filtered.reduce((acc, item) => acc + item.totalReceived, 0);
  const totalDispensed = filtered.reduce((acc, item) => acc + item.totalDispensed, 0);
  const totalInHand = filtered.reduce((acc, item) => acc + item.currentStock, 0);
  const availabilityPercent = totalReceived > 0 ? Math.round((totalInHand / totalReceived) * 100) : 0;

  return {
    items: filtered,
    totalReceived,
    totalDispensed,
    totalInHand,
    availabilityPercent,
  };
}

export type HotspotCategoryFilter = 'All' | 'Shebeens' | 'Bars' | 'Brothels' | 'Social Media';

export interface MapHotspotZone {
  id: string;
  name: string;
  ward: string;
  category: Exclude<HotspotCategoryFilter, 'All'>;
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
  populationEstimate: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
  summary: string;
}

export const MBARE_CENTER: [number, number] = [31.0415, -17.8605];

export const DEFAULT_MAP_HOTSPOTS: MapHotspotZone[] = [
  {
    id: 'zone-market',
    name: 'Mbare Market Zone',
    ward: 'Ward 3',
    category: 'Shebeens',
    riskLevel: 'High Risk',
    populationEstimate: 2500,
    x: 49,
    y: 52,
    lat: -17.8598,
    lng: 31.0412,
    summary: 'High evening foot traffic near transit stalls; elevated HIVST & condom replenishment demand.',
  },
  {
    id: 'zone-matapi',
    name: 'Matapi Flats Hub',
    ward: 'Ward 3',
    category: 'Shebeens',
    riskLevel: 'High Risk',
    populationEstimate: 1850,
    x: 28,
    y: 35,
    lat: -17.8576,
    lng: 31.0389,
    summary: 'Dense residential blocks with active night-shift peer mobilization.',
  },
  {
    id: 'zone-magaba',
    name: 'Magaba Bar Strip',
    ward: 'Ward 4',
    category: 'Bars',
    riskLevel: 'Medium Risk',
    populationEstimate: 1200,
    x: 64,
    y: 33,
    lat: -17.8558,
    lng: 31.0446,
    summary: 'Weekend bar clusters; strong peer leader coverage and moderate lubricant demand.',
  },
  {
    id: 'zone-joburg',
    name: 'Joburg Lines Lodge',
    ward: 'Ward 11',
    category: 'Brothels',
    riskLevel: 'High Risk',
    populationEstimate: 940,
    x: 22,
    y: 65,
    lat: -17.8634,
    lng: 31.0364,
    summary: 'Priority clinic linkage zone; requires weekly peer educator visits.',
  },
  {
    id: 'zone-stodart',
    name: 'Stodart Hall Social',
    ward: 'Ward 12',
    category: 'Social Media',
    riskLevel: 'Medium Risk',
    populationEstimate: 1620,
    x: 78,
    y: 44,
    lat: -17.8591,
    lng: 31.0478,
    summary: 'Digital outreach coordination via local WhatsApp & community channels.',
  },
  {
    id: 'zone-edith',
    name: 'Edith Opperman Node',
    ward: 'Ward 11',
    category: 'Bars',
    riskLevel: 'Low Risk',
    populationEstimate: 1100,
    x: 48,
    y: 79,
    lat: -17.8654,
    lng: 31.0419,
    summary: 'Adjacent to clinic hub; high PrEP uptake and steady stock availability.',
  },
  {
    id: 'zone-national',
    name: 'National Flats Annex',
    ward: 'Ward 4',
    category: 'Brothels',
    riskLevel: 'Medium Risk',
    populationEstimate: 780,
    x: 71,
    y: 72,
    lat: -17.8632,
    lng: 31.0462,
    summary: 'Evening mobile clinic outreach point with strong trust bridges.',
  },
];

export interface WardPolygonProperties {
  id: string;
  ward: string;
  label: string;
  fillColor: string;
  strokeColor: string;
  riskTier: 'High' | 'Moderate' | 'Low';
}

export const MBARE_WARD_POLYGONS: GeoJSON.FeatureCollection<GeoJSON.Polygon, WardPolygonProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'ward-3',
      properties: {
        id: 'ward-3',
        ward: 'Ward 3',
        label: 'Ward 3 · Matapi & Market',
        fillColor: 'rgba(239, 68, 68, 0.16)',
        strokeColor: '#f87171',
        riskTier: 'High',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0365, -17.8555],
            [31.0428, -17.8555],
            [31.0428, -17.8615],
            [31.0365, -17.8615],
            [31.0365, -17.8555],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ward-4',
      properties: {
        id: 'ward-4',
        ward: 'Ward 4',
        label: 'Ward 4 · Magaba & National',
        fillColor: 'rgba(245, 158, 11, 0.16)',
        strokeColor: '#fbbf24',
        riskTier: 'Moderate',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0429, -17.8542],
            [31.0488, -17.8542],
            [31.0488, -17.8602],
            [31.0429, -17.8602],
            [31.0429, -17.8542],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ward-11',
      properties: {
        id: 'ward-11',
        ward: 'Ward 11',
        label: 'Ward 11 · Joburg Lines & Edith',
        fillColor: 'rgba(108, 228, 41, 0.16)',
        strokeColor: '#6CE429',
        riskTier: 'Moderate',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0348, -17.8616],
            [31.0432, -17.8616],
            [31.0432, -17.8672],
            [31.0348, -17.8672],
            [31.0348, -17.8616],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ward-12',
      properties: {
        id: 'ward-12',
        ward: 'Ward 12',
        label: 'Ward 12 · Stodart & Musika East',
        fillColor: 'rgba(56, 189, 248, 0.16)',
        strokeColor: '#38bdf8',
        riskTier: 'Low',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0433, -17.8603],
            [31.0502, -17.8603],
            [31.0502, -17.8658],
            [31.0433, -17.8658],
            [31.0433, -17.8603],
          ],
        ],
      },
    },
  ],
};

export interface ClusterPolygonProperties {
  id: string;
  clusterName: string;
  ward: string;
  fillColor: string;
  strokeColor: string;
}

export const MBARE_CLUSTER_POLYGONS: GeoJSON.FeatureCollection<GeoJSON.Polygon, ClusterPolygonProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'cluster-market-core',
      properties: {
        id: 'cluster-market-core',
        clusterName: 'Market Core Cluster',
        ward: 'Ward 3',
        fillColor: 'rgba(239, 68, 68, 0.22)',
        strokeColor: '#ef4444',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0381, -17.8568],
            [31.0422, -17.8568],
            [31.0422, -17.8608],
            [31.0381, -17.8608],
            [31.0381, -17.8568],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'cluster-magaba-corridor',
      properties: {
        id: 'cluster-magaba-corridor',
        clusterName: 'Magaba Corridor Cluster',
        ward: 'Ward 4',
        fillColor: 'rgba(245, 158, 11, 0.2)',
        strokeColor: '#f59e0b',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0436, -17.8548],
            [31.0472, -17.8548],
            [31.0472, -17.8588],
            [31.0436, -17.8588],
            [31.0436, -17.8548],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'cluster-edith-south',
      properties: {
        id: 'cluster-edith-south',
        clusterName: 'Edith Linkage Cluster',
        ward: 'Ward 11',
        fillColor: 'rgba(108, 228, 41, 0.18)',
        strokeColor: '#6CE429',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0358, -17.8624],
            [31.0431, -17.8624],
            [31.0431, -17.8664],
            [31.0358, -17.8664],
            [31.0358, -17.8624],
          ],
        ],
      },
    },
  ],
};

export interface HotspotGeoPointProperties {
  id: string;
  name: string;
  ward: string;
  category: MapHotspotZone['category'];
  riskLevel: MapHotspotZone['riskLevel'];
  populationEstimate: number;
}

export function hotspotsToGeoJson(
  hotspots: MapHotspotZone[]
): GeoJSON.FeatureCollection<GeoJSON.Point, HotspotGeoPointProperties> {
  return {
    type: 'FeatureCollection',
    features: hotspots.map((zone) => ({
      type: 'Feature',
      id: zone.id,
      properties: {
        id: zone.id,
        name: zone.name,
        ward: zone.ward,
        category: zone.category,
        riskLevel: zone.riskLevel,
        populationEstimate: zone.populationEstimate,
      },
      geometry: {
        type: 'Point',
        coordinates: [zone.lng, zone.lat],
      },
    })),
  };
}

export function filterWardPolygons(ward: string) {
  if (ward === 'All' || ward === 'Mbare') {
    return MBARE_WARD_POLYGONS;
  }
  return {
    ...MBARE_WARD_POLYGONS,
    features: MBARE_WARD_POLYGONS.features.filter((f) => f.properties.ward === ward),
  };
}

export function filterClusterPolygons(ward: string) {
  if (ward === 'All' || ward === 'Mbare') {
    return MBARE_CLUSTER_POLYGONS;
  }
  return {
    ...MBARE_CLUSTER_POLYGONS,
    features: MBARE_CLUSTER_POLYGONS.features.filter((f) => f.properties.ward === ward),
  };
}

export interface PeerLiveLocation {
  educatorId: string;
  educatorName: string;
  ward: string;
  lat: number;
  lng: number;
  accuracy: number;
  isSharing: boolean;
  updatedAt: string;
}

export const ACTIVE_PE_DEFAULT_LOCATIONS: PeerLiveLocation[] = [
  {
    educatorId: 'pe-t-moyo',
    educatorName: 'T. Moyo',
    ward: 'Ward 3',
    lat: -17.8594,
    lng: 31.0405,
    accuracy: 12,
    isSharing: true,
    updatedAt: '2026-02-20T10:15:00.000Z',
  },
  {
    educatorId: 'pe-b-dube',
    educatorName: 'B. Dube',
    ward: 'Ward 4',
    lat: -17.8565,
    lng: 31.0454,
    accuracy: 18,
    isSharing: true,
    updatedAt: '2026-02-20T10:12:00.000Z',
  },
  {
    educatorId: 'pe-s-chikwanda',
    educatorName: 'S. Chikwanda',
    ward: 'Ward 11',
    lat: -17.8641,
    lng: 31.0384,
    accuracy: 15,
    isSharing: true,
    updatedAt: '2026-02-20T10:08:00.000Z',
  },
];

export function createPeerLocationPayload(input: {
  educatorId: string;
  educatorName: string;
  ward: string;
  lat: number;
  lng: number;
  accuracy?: number;
  isSharing: boolean;
}): PeerLiveLocation {
  return {
    educatorId: input.educatorId,
    educatorName: input.educatorName.trim() || 'Peer Educator',
    ward: input.ward || 'Ward 3',
    lat: Number(input.lat.toFixed(6)),
    lng: Number(input.lng.toFixed(6)),
    accuracy: Math.max(1, Math.round(input.accuracy ?? 10)),
    isSharing: input.isSharing,
    updatedAt: new Date().toISOString(),
  };
}

export function filterMapHotspots(
  hotspots: MapHotspotZone[],
  category: HotspotCategoryFilter,
  ward: string,
  search = ''
): MapHotspotZone[] {
  const q = search.trim().toLowerCase();
  return hotspots.filter((h) => {
    const matchesCategory = category === 'All' || h.category === category;
    const matchesWard = ward === 'All' || ward === 'Mbare' || h.ward === ward;
    const matchesQuery =
      !q || h.name.toLowerCase().includes(q) || h.ward.toLowerCase().includes(q) || h.category.toLowerCase().includes(q);
    return matchesCategory && matchesWard && matchesQuery;
  });
}

export function calculateNetworkIntegrity(
  links: Array<{ strength: 'Weak' | 'Moderate' | 'Strong' | 'Critical' }>
): string {
  if (links.length === 0) return '0.0';
  const weights = { Weak: 1, Moderate: 2, Strong: 3, Critical: 4 };
  const total = links.reduce((acc, l) => acc + weights[l.strength], 0);
  return (total / links.length).toFixed(1);
}

export function formatReportCsv(
  rows: Array<{ month: string; reach: number; assessments: number; stockPercent: number }>
): string {
  const header = 'Month,Total Reach,Assessments,Stock Availability (%)';
  const lines = rows.map((r) => `${r.month},${r.reach},${r.assessments},${r.stockPercent}`);
  return [header, ...lines].join('\n');
}

export function countIsolatedNodes(
  people: Hotspot[],
  links: Array<{ from: string; to: string; strength: string }>
): string[] {
  return people
    .filter((node) => {
      const nodeLinks = links.filter((l) => l.from === node.id || l.to === node.id);
      return nodeLinks.length > 0 && nodeLinks.every((l) => l.strength === 'Weak');
    })
    .map((n) => n.id);
}
