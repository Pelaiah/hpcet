'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Layers,
  MapPin,
  Navigation as NavigationIcon,
  Radio,
  Search,
  Users,
  ShieldAlert,
  X,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import {
  errorEmitter,
  FirestorePermissionError,
  useCollection,
  useFirestore,
  useUser,
} from '@/firebase';
import { cn } from '@/lib/utils';
import { VISUAL_ASSETS } from '@/lib/visual-assets';

const HotspotGeoMap = dynamic(
  () => import('@/components/HotspotGeoMap').then((mod) => mod.HotspotGeoMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-[#09130c] text-xs text-white/65">
        Loading Mbare geospatial map...
      </div>
    ),
  }
);
import {
  ACTIVE_PE_DEFAULT_LOCATIONS,
  DEFAULT_MAP_HOTSPOTS,
  MBARE_CENTER,
  type HotspotCategoryFilter,
  type MapHotspotZone,
  type PeerLiveLocation,
  createPeerLocationPayload,
  filterMapHotspots,
} from '@/lib/analytics';

const WARDS = ['Mbare', 'Ward 3', 'Ward 4', 'Ward 11', 'Ward 12', 'All'];

const CATEGORY_COLORS: Record<
  Exclude<HotspotCategoryFilter, 'All'>,
  { dot: string }
> = {
  Shebeens: { dot: 'bg-red-500' },
  Bars: { dot: 'bg-amber-400' },
  Brothels: { dot: 'bg-violet-500' },
  'Social Media': { dot: 'bg-sky-400' },
};

export default function HotspotMonitoringPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { data: profiles } = useCollection('hotspotProfiles');
  const { data: livePeerDocs } = useCollection('peerLocations');

  const [selectedWard, setSelectedWard] = useState('Mbare');
  const [categoryFilter, setCategoryFilter] = useState<HotspotCategoryFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWards, setShowWards] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-market');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [myLiveLocation, setMyLiveLocation] = useState<PeerLiveLocation | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const educatorId = user?.uid || 'pe-field-active';
  const educatorName = user?.displayName || 'Peer Educator (You)';

  const syncLocationToFirestore = useCallback(
    async (payload: PeerLiveLocation) => {
      if (!firestore || !user?.uid) return;
      const locationRef = doc(firestore, 'peerLocations', payload.educatorId);
      try {
        await setDoc(locationRef, payload, { merge: true });
      } catch (err) {
        console.error('Error updating live Peer Educator location in Firestore:', err);
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `peerLocations/${payload.educatorId}`,
            operation: 'write',
            requestResourceData: payload,
          })
        );
      }
    },
    [firestore, user?.uid]
  );

  const publishLiveCoordinates = useCallback(
    (lat: number, lng: number, accuracy = 10, sharing = true, notice?: string) => {
      const targetWard = selectedWard === 'Mbare' || selectedWard === 'All' ? 'Ward 3' : selectedWard;
      const payload = createPeerLocationPayload({
        educatorId,
        educatorName,
        ward: targetWard,
        lat,
        lng,
        accuracy,
        isSharing: sharing,
      });
      setMyLiveLocation(sharing ? payload : null);
      setLocationNotice(notice ?? null);
      void syncLocationToFirestore(payload);
    },
    [educatorId, educatorName, selectedWard, syncLocationToFirestore]
  );

  const stopLiveSharing = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharingLocation(false);
    setLocationNotice(null);
    if (myLiveLocation) {
      const offPayload = createPeerLocationPayload({
        educatorId,
        educatorName,
        ward: myLiveLocation.ward,
        lat: myLiveLocation.lat,
        lng: myLiveLocation.lng,
        accuracy: myLiveLocation.accuracy,
        isSharing: false,
      });
      setMyLiveLocation(null);
      void syncLocationToFirestore(offPayload);
    }
  }, [educatorId, educatorName, myLiveLocation, syncLocationToFirestore]);

  const toggleLiveSharing = useCallback(() => {
    if (isSharingLocation) {
      stopLiveSharing();
      return;
    }

    setIsSharingLocation(true);
    // Provide immediate Mbare GPS fix so supervisor sees live feed even before GPS lock
    publishLiveCoordinates(
      MBARE_CENTER[1],
      MBARE_CENTER[0],
      14,
      true,
      'Live location active · Shared with Supervisor'
    );

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            publishLiveCoordinates(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.accuracy,
              true,
              'GPS live location synced with Supervisor'
            );
          },
          (err) => {
            console.error('Geolocation watchPosition error; keeping Mbare field coordinates:', err);
            setLocationNotice('Using Mbare field GPS coordinates · Shared with Supervisor');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
        );
      } catch (err) {
        console.error('Failed to initialize geolocation watchPosition:', err);
      }
    }
  }, [isSharingLocation, publishLiveCoordinates, stopLiveSharing]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleControlsLocate = useCallback(
    (coords: { longitude: number; latitude: number }) => {
      setIsSharingLocation(true);
      publishLiveCoordinates(
        coords.latitude,
        coords.longitude,
        12,
        true,
        'Location locked via map control · Shared with Supervisor'
      );
    },
    [publishLiveCoordinates]
  );

  const allZones: MapHotspotZone[] = useMemo(() => {
    const liveZones: MapHotspotZone[] = (profiles || []).map((p: any, idx: number) => {
      const totalPop = Object.values(p.populationData || {}).reduce(
        (acc: number, cur: any) => acc + (cur.total || 0),
        0
      );
      const typology0 = p.typology?.[0] || '';
      let cat: MapHotspotZone['category'] = 'Shebeens';
      if (typology0.includes('Bar')) cat = 'Bars';
      else if (typology0.includes('Brothel') || typology0.includes('Lodge') || typology0.includes('Hotel'))
        cat = 'Brothels';
      else if (typology0.includes('Social')) cat = 'Social Media';

      return {
        id: p.id || `live-${idx}`,
        name: p.hotspotName || 'Mapped Hotspot',
        ward: p.ward || 'Ward 3',
        category: cat,
        riskLevel:
          p.priorityLevel === 'Critical' || p.priorityLevel === 'High'
            ? 'High Risk'
            : p.priorityLevel === 'Medium'
            ? 'Medium Risk'
            : 'Low Risk',
        populationEstimate: totalPop || 450,
        x: 20 + ((idx * 19) % 60),
        y: 25 + ((idx * 23) % 50),
        lat: typeof p.lat === 'number' ? p.lat : MBARE_CENTER[1] + ((idx % 3) - 1) * 0.0022,
        lng: typeof p.lng === 'number' ? p.lng : MBARE_CENTER[0] + ((idx % 4) - 1.5) * 0.0024,
        summary: p.aiAnalysis || 'Site profile synchronized from PE Field Kit.',
      };
    });
    return [...DEFAULT_MAP_HOTSPOTS, ...liveZones];
  }, [profiles]);

  const visibleZones = useMemo(
    () => filterMapHotspots(allZones, categoryFilter, selectedWard, searchTerm),
    [allZones, categoryFilter, selectedWard, searchTerm]
  );

  const selectedZone = useMemo(
    () => visibleZones.find((z) => z.id === selectedZoneId) || visibleZones[0] || DEFAULT_MAP_HOTSPOTS[0],
    [visibleZones, selectedZoneId]
  );

  const peerLocations: PeerLiveLocation[] = useMemo(() => {
    const synced: PeerLiveLocation[] = (livePeerDocs || [])
      .filter((d: any) => typeof d.lat === 'number' && typeof d.lng === 'number' && d.isSharing)
      .map((d: any) => ({
        educatorId: d.educatorId || d.id,
        educatorName: d.educatorName || 'Peer Educator',
        ward: d.ward || 'Ward 3',
        lat: d.lat,
        lng: d.lng,
        accuracy: d.accuracy || 15,
        isSharing: Boolean(d.isSharing),
        updatedAt: d.updatedAt || new Date().toISOString(),
      }));

    const merged = [...ACTIVE_PE_DEFAULT_LOCATIONS];
    for (const entry of synced) {
      const idx = merged.findIndex((p) => p.educatorId === entry.educatorId);
      if (idx >= 0) merged[idx] = entry;
      else merged.push(entry);
    }
    return merged;
  }, [livePeerDocs]);

  const totalLivePeers = useMemo(() => {
    const ids = new Set(peerLocations.filter((p) => p.isSharing).map((p) => p.educatorId));
    if (myLiveLocation?.isSharing) ids.add(myLiveLocation.educatorId);
    return ids.size;
  }, [peerLocations, myLiveLocation]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header matching Screen 4 */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="min-h-[44px] min-w-[44px] rounded-full glass-panel-soft flex items-center justify-center text-white hover:border-[#6CE429]/40 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Hotspot Map</h1>
            <p className="text-xs text-white/65">
              Clustered risk zones, ward polygons &amp; live PE tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative hidden sm:block">
            <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search zones..."
              aria-label="Search hotspot zones"
              className="h-10 pl-9 pr-3 rounded-full bg-black/40 border border-white/15 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#6CE429]"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Select ward area"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="h-10 pl-3.5 pr-8 rounded-full glass-panel-soft text-sm font-medium text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6CE429]"
            >
              {WARDS.map((w) => (
                <option key={w} value={w} className="bg-[#0e1e14] text-white">
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-white/70 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <Link
            href="/ai-insights"
            aria-label="View risk alerts"
            className="min-h-[44px] min-w-[44px] rounded-full glass-panel-soft flex items-center justify-center text-white hover:border-[#6CE429]/40"
          >
            <Bell className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Polygon Layer Toggles + Share Live Location with Supervisor Bar */}
      <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWards((prev) => !prev)}
            aria-pressed={showWards}
            className={cn(
              'min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors',
              showWards
                ? 'bg-[#6CE429]/20 border-[#6CE429]/50 text-[#8BE84A]'
                : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Ward Polygons</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClusters((prev) => !prev)}
            aria-pressed={showClusters}
            className={cn(
              'min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors',
              showClusters
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Cluster Polygons</span>
          </button>

          <span className="text-xs text-white/65 px-2 tabular-nums">
            {totalLivePeers} PEs live for Supervisor
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {locationNotice && (
            <span className="text-xs text-[#8BE84A] flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>{locationNotice}</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleLiveSharing}
            aria-pressed={isSharingLocation}
            className={cn(
              'min-h-[40px] px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all',
              isSharingLocation
                ? 'bg-sky-500/25 border border-sky-400/60 text-sky-200 hover:bg-sky-500/35'
                : 'btn-emerald-gradient'
            )}
          >
            <NavigationIcon className={cn('h-3.5 w-3.5', isSharingLocation && 'animate-pulse')} />
            <span>{isSharingLocation ? 'Stop Live Location' : 'Share Live Location'}</span>
          </button>
        </div>
      </div>

      {/* Interactive mapcn Geo Map (Clusters + Ward/Cluster Polygons + MapControls + Live PE Pins) */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#09130c] h-[440px] sm:h-[520px] shadow-2xl">
        <HotspotGeoMap
          zones={visibleZones}
          selectedZone={selectedZone}
          selectedWard={selectedWard}
          showWards={showWards}
          showClusters={showClusters}
          peerLocations={peerLocations}
          myLiveLocation={myLiveLocation}
          onSelectZone={(id) => setSelectedZoneId(id)}
          onSelectWard={(ward) => setSelectedWard((cur) => (cur === ward ? 'Mbare' : ward))}
          onControlsLocate={handleControlsLocate}
        />
      </div>

      {/* Bottom Split Cards matching Screen 4 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Hotspot Types Legend & Filter */}
        <div className="md:col-span-5 glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Hotspot Types</h2>
            {categoryFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('All')}
                className="text-xs font-medium text-[#6CE429] hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {(['Shebeens', 'Bars', 'Brothels', 'Social Media'] as const).map((cat) => {
              const active = categoryFilter === cat;
              const count = allZones.filter((z) => z.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(active ? 'All' : cat)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors',
                    active ? 'bg-white/15 text-white font-semibold' : 'text-white/80 hover:bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn('h-2.5 w-2.5 rounded-full', CATEGORY_COLORS[cat].dot)} />
                    <span>{cat}</span>
                  </span>
                  <span className="text-xs text-white/55 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Hotspot Spotlight */}
        {selectedZone && (
          <div className="md:col-span-7 glass-panel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="relative h-40 sm:h-auto sm:w-52 rounded-2xl overflow-hidden shrink-0">
              <Image
                src={VISUAL_ASSETS.mbareStreetHero}
                alt={selectedZone.name}
                fill
                sizes="(max-width: 640px) 100vw, 208px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-white/60">
                  {selectedZone.ward} · {selectedZone.category}
                </p>
                <h2 className="text-xl font-bold text-white">{selectedZone.name}</h2>
                <p
                  className={cn(
                    'text-sm font-bold',
                    selectedZone.riskLevel === 'High Risk'
                      ? 'text-red-400'
                      : selectedZone.riskLevel === 'Medium Risk'
                      ? 'text-amber-400'
                      : 'text-[#6CE429]'
                  )}
                >
                  {selectedZone.riskLevel}
                </p>
                <p className="text-xs text-white/75 tabular-nums">
                  Population: ~{selectedZone.populationEstimate.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-sm font-semibold text-white transition-colors"
                >
                  View Details
                </button>
                <Link
                  href="/field/profiling"
                  className="px-5 py-2.5 rounded-full btn-emerald-gradient text-sm font-semibold transition-transform active:scale-[0.98]"
                >
                  Profile Site
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone Detail Modal */}
      {detailsOpen && selectedZone && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#8BE84A] font-medium">
                  {selectedZone.ward} · {selectedZone.category}
                </p>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedZone.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close zone details"
                className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-3.5">
                <p className="text-xs text-white/60 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                  Risk Status
                </p>
                <p className="text-base font-bold text-white mt-1">{selectedZone.riskLevel}</p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-3.5">
                <p className="text-xs text-white/60 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#6CE429]" />
                  Estimated Reach
                </p>
                <p className="text-base font-bold text-white tabular-nums mt-1">
                  ~{selectedZone.populationEstimate.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">{selectedZone.summary}</p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2.5 rounded-full bg-white/10 text-sm font-medium text-white"
              >
                Close
              </button>
              <Link
                href="/ai-insights"
                className="px-5 py-2.5 rounded-full btn-emerald-gradient text-sm font-semibold"
              >
                View AI Strategy
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
