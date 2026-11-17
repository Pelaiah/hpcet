'use client';

import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  MapClusterLayer,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
  type MapRef,
} from '@/components/ui/map';
import {
  MBARE_CENTER,
  type MapHotspotZone,
  type PeerLiveLocation,
  filterClusterPolygons,
  filterWardPolygons,
  hotspotsToGeoJson,
} from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { MapPin, Radio, ShieldAlert } from 'lucide-react';

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('MapLibre rendering error in HotspotGeoMap:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface HotspotGeoMapProps {
  zones: MapHotspotZone[];
  selectedZone: MapHotspotZone | undefined;
  selectedWard: string;
  showWards: boolean;
  showClusters: boolean;
  peerLocations: PeerLiveLocation[];
  myLiveLocation: PeerLiveLocation | null;
  onSelectZone: (zoneId: string) => void;
  onSelectWard: (ward: string) => void;
  onControlsLocate: (coords: { longitude: number; latitude: number }) => void;
}

export function HotspotGeoMap({
  zones,
  selectedZone,
  selectedWard,
  showWards,
  showClusters,
  peerLocations,
  myLiveLocation,
  onSelectZone,
  onSelectWard,
  onControlsLocate,
}: HotspotGeoMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  const hotspotGeoJson = useMemo(() => hotspotsToGeoJson(zones), [zones]);
  const wardPolygons = useMemo(() => filterWardPolygons(selectedWard), [selectedWard]);
  const clusterPolygons = useMemo(() => filterClusterPolygons(selectedWard), [selectedWard]);

  useEffect(() => {
    if (!mapRef.current || !selectedZone) return;
    try {
      mapRef.current.easeTo({
        center: [selectedZone.lng, selectedZone.lat],
        duration: 600,
      });
    } catch (error) {
      console.error('Failed to pan map to selected hotspot:', error);
    }
  }, [selectedZone]);

  const activePeers = useMemo(() => {
    const list = [...peerLocations];
    if (myLiveLocation?.isSharing) {
      const idx = list.findIndex((p) => p.educatorId === myLiveLocation.educatorId);
      if (idx >= 0) {
        list[idx] = myLiveLocation;
      } else {
        list.unshift(myLiveLocation);
      }
    }
    return list.filter((p) => p.isSharing);
  }, [peerLocations, myLiveLocation]);

  const fallbackView = (
    <div
      data-testid="mbare-hotspot-map-fallback"
      className="relative h-full w-full bg-[#0b1810] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-white/75">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span>Interactive tactical grid view (WebGL basemap unavailable in this browser)</span>
        </div>
        {myLiveLocation?.isSharing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6CE429]/20 border border-[#6CE429]/40 px-2.5 py-1 text-[11px] font-semibold text-[#8BE84A]">
            <Radio className="h-3 w-3 animate-pulse" />
            PE Live ({myLiveLocation.lat.toFixed(4)}, {myLiveLocation.lng.toFixed(4)})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 my-3">
        {zones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id)}
              className={cn(
                'text-left rounded-2xl p-3 border transition-all',
                isSelected
                  ? 'bg-[#6CE429]/15 border-[#6CE429]/60 text-white'
                  : 'bg-white/5 border-white/10 text-white/85 hover:bg-white/10'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#8BE84A]">{zone.ward}</span>
                <span className="text-[11px] text-white/60 tabular-nums">
                  {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-sm font-bold mt-0.5 truncate">{zone.name}</p>
              <p className="text-xs text-white/65">
                {zone.category} · {zone.riskLevel}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
        {activePeers.map((peer) => (
          <span
            key={peer.educatorId}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 border border-white/15"
          >
            <span className="h-2 w-2 rounded-full bg-[#6CE429]" />
            {peer.educatorName} ({peer.ward})
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <MapErrorBoundary fallback={fallbackView}>
      <div data-testid="mbare-hotspot-map" className="relative h-full w-full">
        <Map
          ref={mapRef}
          theme="dark"
          center={MBARE_CENTER}
          zoom={14}
          minZoom={11}
          maxZoom={18}
          className="h-full w-full"
        >
          {/* Ward Demarcation Polygons (GeoJSON) */}
          {showWards && (
            <MapGeoJSON
              id="mbare-wards"
              data={wardPolygons}
              promoteId="id"
              interactive
              fillPaint={{
                'fill-color': ['get', 'fillColor'] as unknown as string,
                'fill-opacity': 0.55,
              }}
              fillHoverPaint={{
                'fill-opacity': 0.85,
              }}
              linePaint={{
                'line-color': ['get', 'strokeColor'] as unknown as string,
                'line-width': 2,
                'line-opacity': 0.9,
              }}
              onHover={(e) => {
                setHoveredWard((e?.feature?.properties?.label as string) || null);
              }}
              onClick={(e) => {
                const ward = e.feature?.properties?.ward as string | undefined;
                if (ward) onSelectWard(ward);
              }}
            />
          )}

          {/* Hotspot Cluster Polygons (GeoJSON) */}
          {showClusters && (
            <MapGeoJSON
              id="mbare-cluster-polygons"
              data={clusterPolygons}
              promoteId="id"
              interactive
              fillPaint={{
                'fill-color': ['get', 'fillColor'] as unknown as string,
                'fill-opacity': 0.35,
              }}
              fillHoverPaint={{
                'fill-opacity': 0.65,
              }}
              linePaint={{
                'line-color': ['get', 'strokeColor'] as unknown as string,
                'line-width': 1.75,
                'line-dasharray': [3, 2],
                'line-opacity': 0.9,
              }}
            />
          )}

          {/* Clustered Hotspot Points (MapClusterLayer) */}
          <MapClusterLayer
            data={hotspotGeoJson}
            clusterMaxZoom={15}
            clusterRadius={65}
            clusterThresholds={[2, 4]}
            clusterColors={['#22c55e', '#f59e0b', '#ef4444']}
            pointColor="#6CE429"
            onPointClick={(feature) => {
              const id = feature.properties?.id;
              if (id) onSelectZone(id);
            }}
          />

          {/* Selected Hotspot Spotlight Marker */}
          {selectedZone && (
            <MapMarker longitude={selectedZone.lng} latitude={selectedZone.lat}>
              <MarkerContent>
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-10 w-10 rounded-full bg-[#6CE429]/25 animate-ping" />
                  <div className="h-8 w-8 rounded-full bg-[#0d1d13]/90 border-2 border-[#6CE429] shadow-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[#8BE84A]" />
                  </div>
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom" className="bg-[#0d1d13]/90 text-white px-2 py-0.5 rounded-full border border-white/15 shadow">
                {selectedZone.name}
              </MarkerLabel>
            </MapMarker>
          )}

          {/* Live Peer Educator Location Markers (shared with Supervisor) */}
          {activePeers.map((peer) => {
            const isSelf = myLiveLocation?.educatorId === peer.educatorId;
            return (
              <MapMarker
                key={peer.educatorId}
                longitude={peer.lng}
                latitude={peer.lat}
              >
                <MarkerContent>
                  <div className="relative flex items-center justify-center">
                    {isSelf && (
                      <span className="absolute h-8 w-8 rounded-full bg-sky-400/35 animate-ping" />
                    )}
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center',
                        isSelf ? 'bg-sky-500' : 'bg-[#6CE429]'
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <div className="text-xs font-medium">
                    <p className="font-bold">
                      {peer.educatorName} {isSelf ? '(You · Live)' : '(PE Live)'}
                    </p>
                    <p className="opacity-80">
                      {peer.ward} · ±{peer.accuracy}m
                    </p>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            );
          })}

          {/* Built-in MapLibre MapControls (Zoom, Compass, Locate, Fullscreen) */}
          <MapControls
            position="top-right"
            showZoom
            showCompass
            showLocate
            showFullscreen
            onLocate={onControlsLocate}
          />
        </Map>

        {/* Hovered Ward HUD badge */}
        {hoveredWard && (
          <div className="pointer-events-none absolute top-3 left-3 z-20 rounded-full bg-[#0d1d13]/90 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-lg">
            {hoveredWard} · Click to filter
          </div>
        )}
      </div>
    </MapErrorBoundary>
  );
}
