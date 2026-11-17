'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Target,
  Crosshair,
  Save,
  AlertTriangle,
  Info,
  ShieldAlert,
  Activity,
  Users,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateHotspotRecommendation, type HotspotRecommendationOutput } from '@/ai/flows/generate-hotspot-recommendation';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

const KP_GROUPS = [
  { id: 'fsw', label: 'Female Sex Workers (FSW)', thresholds: { high: 50, med: 30 } },
  { id: 'msw', label: 'Male Sex Workers (MSW)', thresholds: { high: 30, med: 20 } },
  { id: 'tg', label: 'Transgender Persons (TG)', thresholds: { high: 20, med: 10 } },
  { id: 'pwud', label: 'People Who Use Drugs (PWUD)', thresholds: { high: 20, med: 10 } },
  { id: 'pwid', label: 'People Who Inject Drugs (PWID)', thresholds: { high: 15, med: 10 } },
  { id: 'hrm', label: 'High Risk Men (HRM)', thresholds: { high: 40, med: 20 } },
];

const TYPOLOGIES = [
  'Shebeen',
  'Home-based',
  'Brothel',
  'Hotel',
  'Parlour',
  'Social Media',
  'Street-based',
  'Truck stop',
  'Lodge',
  'Bar',
  'Other',
];

const PE_PROFILE = {
  name: 'Anonymous PE',
  assignedWard: 'Ward 3',
};

export default function SpotProfilingPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const [isNew, setIsNew] = useState('New');
  const [siteName, setSiteName] = useState('');
  const [hotspotName, setHotspotName] = useState('');
  const [area, setArea] = useState('');
  const [cluster, setCluster] = useState('');
  const [profilingDate, setProfilingDate] = useState('');
  const [microplanner, setMicroplanner] = useState('');
  const [coords, setCoords] = useState({ lat: '', lng: '' });

  const [typology, setTypology] = useState<string[]>([]);
  const [socialPlatform, setSocialPlatform] = useState('');
  const [otherTypology, setOtherTypology] = useState('');

  const [popData, setPopData] = useState<Record<string, { a1: number; a2: number; a3: number }>>(() => {
    const init: Record<string, { a1: number; a2: number; a3: number }> = {};
    KP_GROUPS.forEach((kp) => (init[kp.id] = { a1: 0, a2: 0, a3: 0 }));
    return init;
  });

  const [services, setServices] = useState({
    condoms: true,
    lube: true,
    clinicDistance: 2,
    kpFriendly: true,
  });
  const [structural, setStructural] = useState({
    police: 'No',
    violence: 'Low',
    stigma: 'Low',
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<HotspotRecommendationOutput | null>(null);

  const totalsByKP = useMemo(() => {
    const results: Record<string, { total: number; volume: string }> = {};
    Object.entries(popData).forEach(([id, data]) => {
      const sum = Number(data.a1) + Number(data.a2) + Number(data.a3);
      const kp = KP_GROUPS.find((k) => k.id === id)!;
      let volume = 'Low';
      if (sum > kp.thresholds.high) volume = 'High';
      else if (sum >= kp.thresholds.med) volume = 'Medium';
      results[id] = { total: sum, volume };
    });
    return results;
  }, [popData]);

  const riskFlags = useMemo(() => {
    const flags: string[] = [];
    if (!services.condoms) flags.push('CRITICAL GAP: Condoms Inaccessible');
    if (!services.lube) flags.push('PROGRAM GAP: Lubricants Inaccessible');
    if (services.clinicDistance > 5) flags.push('ACCESS RISK: Distance > 5km');
    if (!services.kpFriendly) flags.push('SERVICE QUALITY RISK: Not KP Friendly');
    if (structural.police === 'Yes' || structural.violence === 'High' || structural.stigma === 'High') {
      flags.push('HIGH STRUCTURAL RISK: High Violence/Stigma/Harassment');
    }
    return flags;
  }, [services, structural]);

  const handlePopChange = (kpId: string, ageKey: 'a1' | 'a2' | 'a3', val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setPopData((prev) => ({
      ...prev,
      [kpId]: { ...prev[kpId], [ageKey]: num },
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!siteName) errors.push('Site Name is mandatory');
    if (!hotspotName) errors.push('Hotspot Name is mandatory');
    if (!area) errors.push('Hotspot Area is mandatory');
    if (!cluster) errors.push('Cluster is mandatory');
    if (!profilingDate) errors.push('Date of Profiling is mandatory');
    if (!microplanner) errors.push('Microplanner name is mandatory');
    if (typology.length === 0) errors.push('At least one typology must be selected');
    if (typology.includes('Social Media') && !socialPlatform) errors.push('Social platform name is required');
    if (typology.includes('Other') && !otherTypology) errors.push('Other typology description is required');

    const totalPop = Object.values(totalsByKP).reduce((acc, cur) => acc + cur.total, 0);
    if (totalPop === 0) errors.push('At least one population estimate is required for profiling');

    return errors;
  };

  const handleCaptureGPS = () => {
    const mockLat = (-17.85 + Math.random() * 0.05).toFixed(6);
    const mockLng = (31.04 + Math.random() * 0.05).toFixed(6);
    setCoords({ lat: mockLat, lng: mockLng });
    toast({ title: 'GPS Captured', description: `Coordinates synced: ${mockLat}, ${mockLng}` });
  };

  const handleGenerateAI = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Incomplete Data',
        description: `Please fill all required fields: ${errors[0]}`,
        variant: 'destructive',
      });
      return;
    }

    setAiLoading(true);
    try {
      const result = await generateHotspotRecommendation({
        hotspotName,
        typology,
        totalEstimatedPopulation: Object.values(totalsByKP).reduce((acc, cur) => acc + cur.total, 0),
        riskFlags,
        barriers: 'Analysis based on structural and service gap inputs.',
        serviceGaps: riskFlags.filter((f) => f.includes('GAP')),
      });
      setAiResult(result);
      toast({ title: 'Intelligence Generated', description: 'Programmatic insights ready.' });
    } catch (e) {
      console.error('AI hotspot recommendation generation failed:', e);
      toast({ title: 'AI Generation Failed', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Submission Blocked',
        description: errors[0],
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({ title: 'Auth Required', description: 'Sign in to commit profiles.', variant: 'destructive' });
      return;
    }

    const profileData = {
      peerEducatorId: user.uid,
      siteName,
      hotspotName,
      ward: PE_PROFILE.assignedWard,
      area,
      cluster,
      profilingDate,
      microplanner,
      lat: parseFloat(coords.lat) || 0,
      lng: parseFloat(coords.lng) || 0,
      typology,
      populationData: popData,
      services,
      structural,
      aiAnalysis: aiResult?.analysis || '',
      aiRecommendations: aiResult?.recommendations || [],
      priorityLevel: aiResult?.priorityLevel || 'Standard',
      timestamp: new Date().toISOString(),
    };

    if (firestore) {
      addDoc(collection(firestore, 'hotspotProfiles'), profileData)
        .then(() => {
          toast({
            title: 'Profile Committed',
            description: `Hotspot ${hotspotName} has been saved to the field ledger.`,
          });
        })
        .catch(async (e) => {
          console.error('Failed to save hotspot profile to Firestore:', e);
          const permissionError = new FirestorePermissionError({
            path: 'hotspotProfiles',
            operation: 'create',
            requestResourceData: profileData,
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({
            title: 'Save Failed',
            description: e?.message || 'Could not save hotspot profile to database.',
            variant: 'destructive',
          });
        });
    } else {
      console.error('Firestore instance is unavailable when committing hotspot profile.');
      toast({
        title: 'Database Unavailable',
        description: 'Firestore is not initialized.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/field"
            aria-label="Back to PE Field Kit"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Spot Profiling Hub</h1>
            <p className="text-xs text-white/65">Microplanning &amp; High-Fidelity Hotspot Intelligence</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleGenerateAI}
            variant="outline"
            className="h-11 px-5 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/15 gap-2"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4 text-[#6CE429]" />}
            <span>AI Recommendation</span>
          </Button>
          <Button
            onClick={handleCommit}
            className="h-11 px-6 rounded-full btn-emerald-gradient font-semibold gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Commit Profile</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#6CE429]" />
                  <span>1. Identification Matrix</span>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BE84A]">
                    <Shield className="h-3.5 w-3.5" /> Assigned: {PE_PROFILE.assignedWard}
                  </span>
                  <RadioGroup value={isNew} onValueChange={setIsNew} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="New" id="new" />
                      <Label htmlFor="new" className="text-xs font-semibold text-white">New Site</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Existing" id="old" />
                      <Label htmlFor="old" className="text-xs font-semibold text-white">Existing</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Assigned Ward</Label>
                <Input
                  value={PE_PROFILE.assignedWard}
                  readOnly
                  className="bg-[#58D922]/15 border-[#6CE429]/30 text-[#8BE84A] font-semibold h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Site Name *</Label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Ward HQ / Primary Site"
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Hotspot Name *</Label>
                <Input
                  value={hotspotName}
                  onChange={(e) => setHotspotName(e.target.value)}
                  placeholder="e.g. Mbare Musika"
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Hotspot Area / Cluster *</Label>
                <div className="flex gap-2">
                  <Input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area"
                    className="bg-black/30 border-white/20 text-white h-11"
                  />
                  <Input
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value)}
                    placeholder="Cluster"
                    className="bg-black/30 border-white/20 text-white h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Date of Profiling *</Label>
                <Input
                  type="date"
                  value={profilingDate}
                  onChange={(e) => setProfilingDate(e.target.value)}
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Microplanner / Outreach Worker *</Label>
                <Input
                  value={microplanner}
                  onChange={(e) => setMicroplanner(e.target.value)}
                  placeholder="Enter Names"
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-white/75">GPS Location</Label>
                <div className="flex gap-2">
                  <Input
                    value={coords.lat ? `${coords.lat}, ${coords.lng}` : 'Not Captured'}
                    readOnly
                    className="bg-black/30 border-white/20 text-white/80 h-11 tabular-nums"
                  />
                  <Button
                    type="button"
                    onClick={handleCaptureGPS}
                    variant="outline"
                    className="h-11 px-4 bg-white/10 border-white/20 text-white hover:bg-white/15 gap-2"
                  >
                    <Crosshair className="h-4 w-4 text-[#6CE429]" />
                    <span>Capture GPS</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#6CE429]" />
                <span>2. Typology Classification</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/65">Select at least one site typology</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TYPOLOGIES.map((t) => (
                  <div key={t} className="flex items-center space-x-2">
                    <Checkbox
                      id={t}
                      checked={typology.includes(t)}
                      onCheckedChange={(checked) => {
                        setTypology((prev) => (checked ? [...prev, t] : prev.filter((x) => x !== t)));
                      }}
                    />
                    <label htmlFor={t} className="text-xs font-medium text-white/90 cursor-pointer">
                      {t}
                    </label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typology.includes('Social Media') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Platform Name *</Label>
                    <Input
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                      placeholder="e.g. WhatsApp, Facebook"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                )}
                {typology.includes('Other') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Specify Other Typology *</Label>
                    <Input
                      value={otherTypology}
                      onChange={(e) => setOtherTypology(e.target.value)}
                      placeholder="Enter description"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6CE429]" />
                <span>3. Population Volume &amp; Disaggregation</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/65">
                Age segments sum to total estimate per group
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {KP_GROUPS.map((kp) => {
                const { total, volume } = totalsByKP[kp.id];
                return (
                  <div key={kp.id} className="p-4 glass-panel-soft rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-white">{kp.label}</h4>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          volume === 'High'
                            ? 'text-red-400'
                            : volume === 'Medium'
                            ? 'text-amber-400'
                            : 'text-[#6CE429]'
                        )}
                      >
                        Volume: {volume}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">18-24</Label>
                        <Input
                          type="number"
                          value={popData[kp.id].a1 || ''}
                          onChange={(e) => handlePopChange(kp.id, 'a1', e.target.value)}
                          className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">25-35</Label>
                        <Input
                          type="number"
                          value={popData[kp.id].a2 || ''}
                          onChange={(e) => handlePopChange(kp.id, 'a2', e.target.value)}
                          className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">36+</Label>
                        <Input
                          type="number"
                          value={popData[kp.id].a3 || ''}
                          onChange={(e) => handlePopChange(kp.id, 'a3', e.target.value)}
                          className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                        />
                      </div>
                      <div className="space-y-1 bg-[#58D922]/15 p-2 rounded-xl border border-[#6CE429]/25">
                        <Label className="text-[11px] font-semibold text-[#8BE84A]">Total Est.</Label>
                        <div className="text-base font-bold text-white tabular-nums">{total}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel rounded-3xl border-amber-400/25">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-amber-300 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span>Intelligence Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-white/65">Active Risk Flags</p>
                {riskFlags.length > 0 ? (
                  riskFlags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-3 bg-amber-500/15 rounded-2xl border border-amber-400/30 text-xs font-medium text-white"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-[#58D922]/15 border border-[#6CE429]/30 rounded-2xl text-xs font-medium text-[#8BE84A] flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>No Active Critical Gaps</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-xs font-semibold text-white/65">Service Access</p>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white">Condom Access</Label>
                  <Checkbox
                    checked={services.condoms}
                    onCheckedChange={(c) => setServices((prev) => ({ ...prev, condoms: !!c }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white">Lube Access</Label>
                  <Checkbox
                    checked={services.lube}
                    onCheckedChange={(c) => setServices((prev) => ({ ...prev, lube: !!c }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white">KP Friendly Site</Label>
                  <Checkbox
                    checked={services.kpFriendly}
                    onCheckedChange={(c) => setServices((prev) => ({ ...prev, kpFriendly: !!c }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-white/80 tabular-nums">
                    <span>Dist. to Clinic (km)</span>
                    <span className={services.clinicDistance > 5 ? 'text-amber-400' : 'text-[#6CE429]'}>
                      {services.clinicDistance}km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={services.clinicDistance}
                    onChange={(e) => setServices((prev) => ({ ...prev, clinicDistance: parseInt(e.target.value) }))}
                    className="w-full accent-[#6CE429]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-xs font-semibold text-white/65">Structural Risk</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Police Harassment</Label>
                    <Select
                      value={structural.police}
                      onValueChange={(v) => setStructural((prev) => ({ ...prev, police: v }))}
                    >
                      <SelectTrigger className="h-9 bg-black/30 border-white/15 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Violence Level</Label>
                    <Select
                      value={structural.violence}
                      onValueChange={(v) => setStructural((prev) => ({ ...prev, violence: v }))}
                    >
                      <SelectTrigger className="h-9 bg-black/30 border-white/15 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Stigma Level</Label>
                    <Select
                      value={structural.stigma}
                      onValueChange={(v) => setStructural((prev) => ({ ...prev, stigma: v }))}
                    >
                      <SelectTrigger className="h-9 bg-black/30 border-white/15 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#6CE429]" />
                <span>AI Microplanning</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {!aiResult ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 text-white/50">
                  <Info className="h-10 w-10 text-[#6CE429]/60" />
                  <p className="text-xs font-medium">Awaiting profile data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Programmatic Analysis</Label>
                    <p className="text-sm leading-relaxed text-white/90 border-l-2 border-[#6CE429] pl-3">
                      {aiResult.analysis}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Strategic Recommendations</Label>
                    <ul className="space-y-1.5">
                      {aiResult.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-white/85 flex gap-2">
                          <span className="text-[#6CE429]">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs text-white/60">Priority Protocol</span>
                    <span className="text-xs font-bold text-[#8BE84A]">{aiResult.priorityLevel}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
