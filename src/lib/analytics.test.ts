import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifySecurityPin,
  calculateStockAvailabilityPercent,
  calculateFacilityStockSummary,
  filterMapHotspots,
  DEFAULT_MAP_HOTSPOTS,
  calculateNetworkIntegrity,
  formatReportCsv,
  hotspotsToGeoJson,
  filterWardPolygons,
  filterClusterPolygons,
  MBARE_WARD_POLYGONS,
  MBARE_CLUSTER_POLYGONS,
  createPeerLocationPayload,
} from './analytics';
import { INITIAL_STOCK } from './store';

test('verifySecurityPin accepts 3524 and legacy PIN and rejects invalid PINs', () => {
  assert.equal(verifySecurityPin('3524'), true);
  assert.equal(verifySecurityPin('3524!6'), true);
  assert.equal(verifySecurityPin('0000'), false);
  assert.equal(verifySecurityPin(''), false);
});

test('calculateStockAvailabilityPercent computes rounded percentage safely', () => {
  const pct = calculateStockAvailabilityPercent(INITIAL_STOCK);
  assert.ok(pct > 0 && pct <= 100);
  assert.equal(calculateStockAvailabilityPercent([]), 0);
});

test('calculateFacilityStockSummary filters by facility correctly', () => {
  const matapi = calculateFacilityStockSummary(INITIAL_STOCK, 'Matapi Youth Hub');
  const edith = calculateFacilityStockSummary(INITIAL_STOCK, 'Edith Opperman Clinic');
  assert.equal(matapi.items.every((i) => i.facility === 'Matapi Youth Hub'), true);
  assert.equal(edith.items.every((i) => i.facility === 'Edith Opperman Clinic'), true);
  assert.ok(matapi.totalInHand > 0);
  assert.ok(edith.totalInHand > 0);
});

test('filterMapHotspots filters by category, ward, and search term', () => {
  const shebeens = filterMapHotspots(DEFAULT_MAP_HOTSPOTS, 'Shebeens', 'Mbare');
  assert.equal(shebeens.length, 2);
  assert.equal(shebeens.every((h) => h.category === 'Shebeens'), true);

  const ward3 = filterMapHotspots(DEFAULT_MAP_HOTSPOTS, 'All', 'Ward 3');
  assert.equal(ward3.every((h) => h.ward === 'Ward 3'), true);

  const search = filterMapHotspots(DEFAULT_MAP_HOTSPOTS, 'All', 'All', 'Market');
  assert.equal(search.length, 1);
  assert.equal(search[0].name, 'Mbare Market Zone');
});

test('hotspotsToGeoJson and GeoJSON ward/cluster polygons produce valid closed rings', () => {
  const geo = hotspotsToGeoJson(DEFAULT_MAP_HOTSPOTS);
  assert.equal(geo.type, 'FeatureCollection');
  assert.equal(geo.features.length, DEFAULT_MAP_HOTSPOTS.length);
  assert.equal(geo.features[0].geometry.type, 'Point');
  assert.equal(geo.features[0].geometry.coordinates.length, 2);

  for (const poly of [...MBARE_WARD_POLYGONS.features, ...MBARE_CLUSTER_POLYGONS.features]) {
    const ring = poly.geometry.coordinates[0];
    assert.ok(ring.length >= 4);
    assert.deepEqual(ring[0], ring[ring.length - 1]);
  }

  assert.equal(filterWardPolygons('Ward 3').features.length, 1);
  assert.equal(filterWardPolygons('Mbare').features.length, 4);
  assert.equal(filterClusterPolygons('Ward 4').features.length, 1);
});

test('createPeerLocationPayload formats coordinates and clamps accuracy', () => {
  const payload = createPeerLocationPayload({
    educatorId: 'pe-1',
    educatorName: '  T. Moyo ',
    ward: 'Ward 3',
    lat: -17.86051234,
    lng: 31.04151234,
    accuracy: 0,
    isSharing: true,
  });
  assert.equal(payload.educatorName, 'T. Moyo');
  assert.equal(payload.lat, -17.860512);
  assert.equal(payload.lng, 31.041512);
  assert.equal(payload.accuracy, 1);
  assert.equal(payload.isSharing, true);
});

test('calculateNetworkIntegrity and formatReportCsv return expected outputs', () => {
  assert.equal(calculateNetworkIntegrity([]), '0.0');
  assert.equal(calculateNetworkIntegrity([{ strength: 'Strong' }, { strength: 'Weak' }]), '2.0');

  const csv = formatReportCsv([{ month: 'Jul', reach: 8200, assessments: 34, stockPercent: 94 }]);
  assert.ok(csv.includes('Month,Total Reach,Assessments,Stock Availability (%)'));
  assert.ok(csv.includes('Jul,8200,34,94'));
});
