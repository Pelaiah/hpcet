'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Link as LinkIcon,
  X,
  UserPlus,
  Users,
  Sparkles,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RelationshipStrength, Hotspot, PersonType } from '@/lib/types';
import { INITIAL_HOTSPOTS } from '@/lib/store';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { calculateNetworkIntegrity, countIsolatedNodes } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';

interface SocialNetworkMapProps {
  interactive?: boolean;
  searchQuery?: string;
}

type LinkEdge = {
  from: string;
  to: string;
  strength: RelationshipStrength;
};

type NetworkTab = 'Network' | 'Clusters' | 'Insights';

const INITIAL_NETWORK_PEERS: Hotspot[] = [
  { ...INITIAL_HOTSPOTS[0], x: 50, y: 20 },
  { ...INITIAL_HOTSPOTS[1], x: 70, y: 45 },
  { ...INITIAL_HOTSPOTS[2], x: 30, y: 53 },
  { ...INITIAL_HOTSPOTS[3], x: 50, y: 69 },
  {
    id: 'h5',
    name: 'Tadiwa (Peer)',
    type: 'KP Member',
    lat: -17.856,
    lng: 31.041,
    ward: 'Ward 3',
    reachCount: 28,
    relationshipStrength: 'Moderate',
    influenceScore: 64,
    x: 24,
    y: 26,
  },
  {
    id: 'h6',
    name: 'Nyasha (Influencer)',
    type: 'Influencer',
    lat: -17.861,
    lng: 31.046,
    ward: 'Ward 12',
    reachCount: 52,
    relationshipStrength: 'Strong',
    influenceScore: 81,
    x: 78,
    y: 24,
  },
  {
    id: 'h7',
    name: 'Farai (KP)',
    type: 'KP Member',
    lat: -17.863,
    lng: 31.044,
    ward: 'Ward 4',
    reachCount: 19,
    relationshipStrength: 'Moderate',
    influenceScore: 48,
    x: 78,
    y: 69,
  },
  {
    id: 'h8',
    name: 'Rudo (Leader)',
    type: 'Peer Leader',
    lat: -17.857,
    lng: 31.038,
    ward: 'Ward 11',
    reachCount: 74,
    relationshipStrength: 'Strong',
    influenceScore: 88,
    x: 22,
    y: 72,
  },
];

const INITIAL_LINKS: LinkEdge[] = [
  { from: 'h1', to: 'h2', strength: 'Strong' },
  { from: 'h1', to: 'h5', strength: 'Strong' },
  { from: 'h2', to: 'h3', strength: 'Weak' },
  { from: 'h1', to: 'h4', strength: 'Moderate' },
  { from: 'h2', to: 'h6', strength: 'Strong' },
  { from: 'h4', to: 'h7', strength: 'Moderate' },
  { from: 'h3', to: 'h8', strength: 'Weak' },
  { from: 'h4', to: 'h8', strength: 'Strong' },
  { from: 'h5', to: 'h3', strength: 'Moderate' },
];

export function SocialNetworkMap({ interactive = true, searchQuery = '' }: SocialNetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NetworkTab>('Network');
  const [linkingMode, setLinkingMode] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showStrengthDialog, setShowStrengthDialog] = useState(false);
  const [newLinkStrength, setNewLinkStrength] = useState<RelationshipStrength>('Strong');
  const [focusedPersonId, setFocusedPersonId] = useState<string>('h1');

  const [people, setPeople] = useState<Hotspot[]>(INITIAL_NETWORK_PEERS);
  const [links, setLinks] = useState<LinkEdge[]>(INITIAL_LINKS);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [newNodeData, setNewNodeData] = useState<Partial<Hotspot>>({
    name: '',
    type: 'KP Member',
    ward: 'Ward 3',
    influenceScore: 55,
  });

  const filteredPeople = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) => p.name.toLowerCase().includes(q) || p.ward.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
    );
  }, [people, searchQuery]);

  const handlePointerDown = (id: string) => (e: React.PointerEvent) => {
    setFocusedPersonId(id);
    if (!interactive) return;
    e.stopPropagation();
    if (linkingMode) {
      if (!selectedSourceId) {
        setSelectedSourceId(id);
        toast({ title: 'Source Peer Selected', description: 'Now tap a target peer to establish a trust bridge.' });
      } else if (!selectedTargetId && id !== selectedSourceId) {
        setSelectedTargetId(id);
        setShowStrengthDialog(true);
      }
    } else {
      setDraggingNodeId(id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPeople((prev) =>
        prev.map((p) =>
          p.id === draggingNodeId ? { ...p, x: Math.max(8, Math.min(92, x)), y: Math.max(10, Math.min(88, y)) } : p
        )
      );
    }
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  const handleAddNode = () => {
    if (!newNodeData.name?.trim()) {
      toast({ title: 'Name Required', description: 'Enter a peer name or identifier.', variant: 'destructive' });
      return;
    }
    const id = `n-${Date.now()}`;
    const newNode: Hotspot = {
      id,
      name: newNodeData.name.trim(),
      type: (newNodeData.type as PersonType) || 'KP Member',
      lat: -17.858,
      lng: 31.042,
      ward: newNodeData.ward || 'Ward 3',
      reachCount: 12,
      influenceScore: newNodeData.influenceScore || 50,
      x: 50,
      y: 50,
    };
    setPeople((prev) => [...prev, newNode]);
    setFocusedPersonId(id);
    setShowAddNodeDialog(false);
    setNewNodeData({ name: '', type: 'KP Member', ward: 'Ward 3', influenceScore: 55 });
    toast({ title: 'Peer Node Added', description: `${newNode.name} placed on network map.` });
  };

  const confirmLink = () => {
    if (selectedSourceId && selectedTargetId) {
      const exists = links.some(
        (l) =>
          (l.from === selectedSourceId && l.to === selectedTargetId) ||
          (l.from === selectedTargetId && l.to === selectedSourceId)
      );
      if (exists) {
        toast({ title: 'Trust Bridge Exists', variant: 'destructive' });
      } else {
        setLinks((prev) => [...prev, { from: selectedSourceId, to: selectedTargetId, strength: newLinkStrength }]);
        toast({ title: 'Trust Bridge Established', description: `Connection strength: ${newLinkStrength}` });
      }
    }
    setLinkingMode(false);
    setSelectedSourceId(null);
    setSelectedTargetId(null);
    setShowStrengthDialog(false);
  };

  const isolatedNodes = useMemo(() => countIsolatedNodes(people, links), [people, links]);
  const networkIntegrity = useMemo(() => calculateNetworkIntegrity(links), [links]);

  const getPerson = (id: string) => filteredPeople.find((p) => p.id === id);
  const focusedPerson = people.find((p) => p.id === focusedPersonId) || people[0];

  const getLineStyles = (strength: RelationshipStrength) => {
    switch (strength) {
      case 'Critical':
        return { stroke: '#A7F46C', strokeWidth: '3.5' };
      case 'Strong':
        return { stroke: '#6CE429', strokeWidth: '2.75' };
      case 'Moderate':
        return { stroke: '#F59E0B', strokeWidth: '2.25' };
      case 'Weak':
      default:
        return { stroke: '#38BDF8', strokeWidth: '2', strokeDasharray: '5 4' };
    }
  };

  const getAvatarForPerson = (id: string, index: number) => {
    if (id === 'h1' || index % 3 === 0) return VISUAL_ASSETS.supervisorAvatar;
    if (id === 'h2' || index % 3 === 1) return VISUAL_ASSETS.healthWorkerPortrait;
    return VISUAL_ASSETS.peTeamBanner;
  };

  const wardClusters = useMemo(() => {
    const map: Record<string, Hotspot[]> = {};
    filteredPeople.forEach((p) => {
      if (!map[p.ward]) map[p.ward] = [];
      map[p.ward].push(p);
    });
    return Object.entries(map);
  }, [filteredPeople]);

  return (
    <div className="space-y-5 flex flex-col">
      {/* Top Segmented Tabs + Interactive Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="glass-panel rounded-full p-1.5 grid grid-cols-3 gap-1 w-full sm:w-80">
          {(['Network', 'Clusters', 'Insights'] as NetworkTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'min-h-[40px] rounded-full text-xs sm:text-sm font-semibold transition-all',
                activeTab === tab
                  ? 'btn-emerald-gradient text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {interactive && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddNodeDialog(true)}
              className="min-h-[40px] px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors"
            >
              <UserPlus className="h-4 w-4 text-[#6CE429]" />
              <span>Add Peer</span>
            </button>
            <button
              type="button"
              onClick={() => setLinkingMode(!linkingMode)}
              className={cn(
                'min-h-[40px] px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all border',
                linkingMode
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'btn-emerald-gradient text-white border-[#8BE84A]/40'
              )}
            >
              <LinkIcon className="h-4 w-4" />
              <span>{linkingMode ? 'Cancel Bridge' : 'Establish Bridge'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Network Graph Canvas matching Screen 9 */}
      {activeTab === 'Network' && (
        <div className="space-y-4">
          <div
            ref={containerRef}
            className={cn(
              'relative h-[440px] sm:h-[500px] rounded-3xl glass-panel overflow-hidden select-none',
              linkingMode && 'ring-2 ring-amber-400/60 cursor-crosshair',
              draggingNodeId && 'cursor-grabbing'
            )}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Subtle botanical hills glow inside canvas */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <Image
                src={VISUAL_ASSETS.mbareHillsBg}
                alt="Network atmospheric layer"
                fill
                sizes="100vw"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#09140d]/70" />
            </div>

            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link, idx) => {
                const from = getPerson(link.from);
                const to = getPerson(link.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={`${link.from}-${link.to}-${idx}`}
                    x1={`${from.x ?? 50}%`}
                    y1={`${from.y ?? 50}%`}
                    x2={`${to.x ?? 50}%`}
                    y2={`${to.y ?? 50}%`}
                    {...getLineStyles(link.strength)}
                  />
                );
              })}
            </svg>

            {/* Peer Avatar Nodes */}
            {filteredPeople.map((person, index) => {
              const isIsolated = isolatedNodes.includes(person.id);
              const isSelectedSource = person.id === selectedSourceId;
              const isSelectedTarget = person.id === selectedTargetId;
              const isFocused = person.id === focusedPerson?.id;

              const ringColor =
                person.type === 'Peer Leader'
                  ? 'border-[#6CE429]'
                  : person.type === 'Influencer'
                  ? 'border-amber-400'
                  : 'border-sky-400';

              return (
                <div
                  key={person.id}
                  onPointerDown={handlePointerDown(person.id)}
                  style={{
                    top: `${person.y ?? 50}%`,
                    left: `${person.x ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={cn(
                    'absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform',
                    draggingNodeId === person.id && 'scale-110 z-40',
                    isFocused && 'z-30'
                  )}
                >
                  <div
                    className={cn(
                      'relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-[3px] shadow-xl bg-[#102216] transition-all',
                      ringColor,
                      isIsolated && 'border-red-400',
                      isFocused && 'ring-4 ring-white/25 scale-105',
                      isSelectedSource && 'ring-4 ring-[#6CE429]',
                      isSelectedTarget && 'ring-4 ring-amber-400'
                    )}
                  >
                    <Image
                      src={getAvatarForPerson(person.id, index)}
                      alt={person.name}
                      fill
                      sizes="56px"
                      referrerPolicy="no-referrer"
                      className="object-cover object-top"
                    />
                  </div>
                  <span className="mt-1.5 px-2 py-0.5 rounded-full bg-black/75 border border-white/15 text-[11px] font-semibold text-white whitespace-nowrap">
                    {person.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Linking Mode Instruction Banner */}
            {linkingMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-xl">
                <span>{selectedSourceId ? 'Tap target peer to bridge' : 'Tap source peer'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setLinkingMode(false);
                    setSelectedSourceId(null);
                    setSelectedTargetId(null);
                  }}
                  aria-label="Cancel bridge linking"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Bottom Legend matching Screen 9 */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-center">
              <div className="glass-panel rounded-full px-5 py-2 flex items-center gap-6 text-xs font-semibold text-white">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6CE429]" />
                  Strong
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Moderate
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  Weak
                </span>
              </div>
            </div>
          </div>

          {/* Focused Peer Summary Bar (cleanly outside canvas so nodes never overlap) */}
          {focusedPerson && (
            <div className="glass-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">{focusedPerson.name}</p>
                <p className="text-xs text-white/70">
                  {focusedPerson.type} · {focusedPerson.ward}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold tabular-nums">
                <span className="text-[#8BE84A]">Influence: {focusedPerson.influenceScore ?? 50}</span>
                <span className="text-white/80">Reach: {focusedPerson.reachCount}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Clusters View */}
      {activeTab === 'Clusters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wardClusters.map(([ward, members]) => (
            <div key={ward} className="glass-panel rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#6CE429]" />
                  <span>{ward} Cluster</span>
                </h3>
                <span className="text-xs font-semibold text-[#8BE84A] tabular-nums">
                  {members.length} peers
                </span>
              </div>
              <div className="space-y-2.5">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setFocusedPersonId(member.id);
                      setActiveTab('Network');
                    }}
                    className="w-full glass-panel-soft rounded-2xl p-3 flex items-center justify-between text-left hover:border-[#6CE429]/40 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{member.name}</p>
                      <p className="text-xs text-white/60">{member.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-[#6CE429] tabular-nums">
                        Influence {member.influenceScore ?? 50}
                      </p>
                      <p className="text-[11px] text-white/60 tabular-nums">{member.reachCount} reached</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Insights View */}
      {activeTab === 'Insights' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-hero-green rounded-3xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#A7F46C]" />
              Trust Integrity Score
            </p>
            <p className="text-3xl font-extrabold text-white tabular-nums">
              {networkIntegrity} <span className="text-sm font-medium text-white/70">/ 3.0</span>
            </p>
            <p className="text-xs text-white/80">
              Strong bridges anchor Ward 3 and Ward 4 mobilization channels.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-2">
            <p className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
              <Share2 className="h-4 w-4 text-[#6CE429]" />
              Active Trust Bridges
            </p>
            <p className="text-3xl font-extrabold text-white tabular-nums">{links.length}</p>
            <p className="text-xs text-white/70">
              {links.filter((l) => l.strength === 'Strong' || l.strength === 'Critical').length} Strong ·{' '}
              {links.filter((l) => l.strength === 'Moderate').length} Moderate ·{' '}
              {links.filter((l) => l.strength === 'Weak').length} Weak
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-2">
            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Isolated Peers
            </p>
            <p className="text-3xl font-extrabold text-white tabular-nums">{isolatedNodes.length}</p>
            <p className="text-xs text-white/75">
              {isolatedNodes.length > 0
                ? 'Connect weakly linked peers to a Peer Leader to boost retention.'
                : 'All active peers have strong or moderate trust bridges.'}
            </p>
          </div>
        </div>
      )}

      {/* Establish Bridge Dialog */}
      <Dialog open={showStrengthDialog} onOpenChange={setShowStrengthDialog}>
        <DialogContent className="glass-panel border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Establish Trust Bridge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-white/75">Relationship Strength</Label>
              <Select
                value={newLinkStrength}
                onValueChange={(v: RelationshipStrength) => setNewLinkStrength(v)}
              >
                <SelectTrigger className="bg-black/30 border-white/20 text-white h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strong">Strong (Direct Trust)</SelectItem>
                  <SelectItem value="Moderate">Moderate (Regular Contact)</SelectItem>
                  <SelectItem value="Weak">Weak (New Acquaintance)</SelectItem>
                  <SelectItem value="Critical">Critical (Strategic Leader)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={confirmLink} className="w-full h-11 rounded-full btn-emerald-gradient font-semibold">
              Confirm Trust Bridge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Peer Node Dialog */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent className="glass-panel border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Add Peer Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-white/75">Peer Name / Identifier</Label>
              <Input
                value={newNodeData.name}
                onChange={(e) => setNewNodeData({ ...newNodeData, name: e.target.value })}
                placeholder="e.g. Tendai (Peer Leader)"
                className="bg-black/30 border-white/20 text-white h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Role</Label>
                <Select
                  value={newNodeData.type}
                  onValueChange={(v) => setNewNodeData({ ...newNodeData, type: v as PersonType })}
                >
                  <SelectTrigger className="bg-black/30 border-white/20 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peer Leader">Peer Leader</SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="KP Member">KP Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Ward</Label>
                <Select
                  value={newNodeData.ward}
                  onValueChange={(v) => setNewNodeData({ ...newNodeData, ward: v })}
                >
                  <SelectTrigger className="bg-black/30 border-white/20 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ward 3">Ward 3</SelectItem>
                    <SelectItem value="Ward 4">Ward 4</SelectItem>
                    <SelectItem value="Ward 11">Ward 11</SelectItem>
                    <SelectItem value="Ward 12">Ward 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddNode} className="w-full h-11 rounded-full btn-emerald-gradient font-semibold">
              Add to Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
