'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  CalendarDays,
  BrainCircuit,
  Loader2,
  Sparkles,
  ShieldAlert,
  Target,
  Package,
  ArrowRight,
  Stethoscope,
  Activity,
  Database,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RiskLevel } from '@/lib/types';
import { generateOutreachRecommendation, type OutreachRecommendationOutput } from '@/ai/flows/generate-outreach-recommendation';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

const TOPICS = [
  'HIV Testing',
  'Prep/Pep',
  'Mental Health',
  'GBV Support',
  'Stigma Reduction',
  'Clinical Referrals',
  'Lubricant Distribution',
  'Pregnancy Testing',
];

export default function OutreachTrackingPage() {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<OutreachRecommendationOutput | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const [visitDate, setVisitDate] = useState('');
  const [uin, setUin] = useState('');
  const [risk, setRisk] = useState<RiskLevel>('Unknown');
  const [registered, setRegistered] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  const [services, setServices] = useState({
    mc: 0,
    fc: 0,
    lube: 0,
    hivstDistributed: 0,
    hivstNegative: 0,
    hivstPositive: 0,
    pregDistributed: 0,
    pregNegative: 0,
    pregPositive: 0,
    padsReusable: 0,
    padsDisposable: 0,
  });

  const totalCommodities = useMemo(
    () =>
      services.mc +
      services.fc +
      services.lube +
      services.hivstDistributed +
      services.pregDistributed +
      services.padsReusable +
      services.padsDisposable,
    [services]
  );

  const isHighRiskAlert = useMemo(
    () => risk === 'High' && services.mc + services.fc + services.lube === 0,
    [risk, services]
  );

  const handleSubmit = async () => {
    if (!uin || !visitDate || risk === 'Unknown') {
      toast({
        title: 'Incomplete Data',
        description: 'Unique ID, Visit Date, and Risk Level are mandatory.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({ title: 'Auth Required', description: 'You must be signed in to log visits.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await generateOutreachRecommendation({
        visitDate,
        riskLevel: risk,
        uin,
        commoditiesDistributed: totalCommodities,
        isRegisteredAtClinic: registered,
      });
      setAiResult(result);

      if (firestore) {
        const visitData = {
          peerEducatorId: user.uid,
          peerEducatorName: user.displayName || 'Anonymous Peer',
          uin,
          visitDate,
          riskLevel: risk,
          isRegisteredAtClinic: registered,
          commodities: services,
          topicsDiscussed: topics,
          aiSummary: result.summary,
          aiActions: result.actions,
          timestamp: new Date().toISOString(),
        };

        addDoc(collection(firestore, 'outreachVisits'), visitData)
          .then(() => {
            toast({ title: 'Visit Logged', description: `Outreach for node ${uin} committed to database.` });
          })
          .catch(async (e) => {
            console.error('Failed to save outreach visit to Firestore:', e);
            const permissionError = new FirestorePermissionError({
              path: 'outreachVisits',
              operation: 'create',
              requestResourceData: visitData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              title: 'Database Save Failed',
              description: e?.message || 'Could not save outreach visit.',
              variant: 'destructive',
            });
          });
      } else {
        console.error('Firestore instance is unavailable when logging outreach visit.');
        toast({ title: 'Database Unavailable', description: 'Firestore is not initialized.', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Outreach submission / AI recommendation error:', e);
      toast({ title: 'System Error', description: 'AI recommendation engine unreachable.', variant: 'destructive' });
    } finally {
      setLoading(false);
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
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Outreach Tracking</h1>
            <p className="text-xs text-white/65">Weekly Performance &amp; Caseload Engagement Matrix</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 px-7 rounded-full btn-emerald-gradient font-semibold text-sm w-full md:w-auto gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          <span>Commit &amp; Save Visit</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#6CE429]" />
                <span>Outreach Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Unique ID (UIN) *</Label>
                <Input
                  value={uin}
                  onChange={(e) => setUin(e.target.value)}
                  placeholder="e.g. V-A-80063"
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Visit Date *</Label>
                <Input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="bg-black/30 border-white/20 text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/75">Baseline Risk Level *</Label>
                <Select value={risk} onValueChange={(v: RiskLevel) => setRisk(v)}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High (Weekly Tracking)</SelectItem>
                    <SelectItem value="Medium">Medium (Bi-Monthly)</SelectItem>
                    <SelectItem value="Low">Low (Monthly)</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <Checkbox id="reg" checked={registered} onCheckedChange={(c) => setRegistered(!!c)} />
                <Label htmlFor="reg" className="text-sm font-medium text-white cursor-pointer">
                  Peer Registered at Clinic
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-[#6CE429]" />
                <span>2. Services &amp; Commodities</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/65">
                Log all distributed items and clinical test results
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/70">Male Condoms</Label>
                  <Input
                    type="number"
                    min="0"
                    value={services.mc}
                    onChange={(e) => setServices({ ...services, mc: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-black/30 border-white/20 text-white tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/70">Female Condoms</Label>
                  <Input
                    type="number"
                    min="0"
                    value={services.fc}
                    onChange={(e) => setServices({ ...services, fc: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-black/30 border-white/20 text-white tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/70">Lubricants</Label>
                  <Input
                    type="number"
                    min="0"
                    value={services.lube}
                    onChange={(e) => setServices({ ...services, lube: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-black/30 border-white/20 text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#58D922]/10 rounded-2xl border border-[#6CE429]/25 space-y-3">
                  <div className="flex items-center gap-2 text-[#8BE84A]">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-xs font-bold">HIVST Service</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-white/70">Distributed</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.hivstDistributed}
                        onChange={(e) =>
                          setServices({ ...services, hivstDistributed: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#6CE429]">Negative</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.hivstNegative}
                        onChange={(e) =>
                          setServices({ ...services, hivstNegative: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-red-400">Positive</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.hivstPositive}
                        onChange={(e) =>
                          setServices({ ...services, hivstPositive: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-400/25 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold">Pregnancy Test Service</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-white/70">Distributed</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.pregDistributed}
                        onChange={(e) =>
                          setServices({ ...services, pregDistributed: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#6CE429]">Negative</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.pregNegative}
                        onChange={(e) =>
                          setServices({ ...services, pregNegative: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-red-400">Positive</Label>
                      <Input
                        type="number"
                        min="0"
                        value={services.pregPositive}
                        onChange={(e) =>
                          setServices({ ...services, pregPositive: parseInt(e.target.value) || 0 })
                        }
                        className="h-9 bg-black/30 border-white/15 text-white tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/70">Pads (Reusable)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={services.padsReusable}
                    onChange={(e) => setServices({ ...services, padsReusable: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-black/30 border-white/20 text-white tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/70">Pads (Disposable)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={services.padsDisposable}
                    onChange={(e) => setServices({ ...services, padsDisposable: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-black/30 border-white/20 text-white tabular-nums"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-[#6CE429]" />
                <span>Topics Recommended</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TOPICS.map((t) => (
                  <div key={t} className="flex items-center space-x-2">
                    <Checkbox
                      id={t}
                      checked={topics.includes(t)}
                      onCheckedChange={(c) => setTopics((prev) => (c ? [...prev, t] : prev.filter((x) => x !== t)))}
                    />
                    <label htmlFor={t} className="text-xs font-medium text-white/90 cursor-pointer">
                      {t}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel rounded-3xl border-amber-400/25">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-amber-300 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span>Automated Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {risk === 'High' && (
                <div className="p-3 bg-amber-500/15 border border-amber-400/30 rounded-2xl text-xs font-medium text-white flex gap-2">
                  <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>High-Risk Node: Weekly tracking required</span>
                </div>
              )}
              {!registered && (
                <div className="p-3 bg-amber-500/15 border border-amber-400/30 rounded-2xl text-xs font-medium text-white flex gap-2">
                  <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Alert: Peer not registered at clinic</span>
                </div>
              )}
              {isHighRiskAlert && (
                <div className="p-3 bg-red-500/20 border border-red-400/35 rounded-2xl text-xs font-semibold text-red-200 flex gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>CRITICAL: No commodities distributed to high-risk node</span>
                </div>
              )}
              {services.hivstPositive > 0 && (
                <div className="p-3 bg-red-500/20 border border-red-400/35 rounded-2xl text-xs font-semibold text-red-200 flex gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>URGENT: Reactive HIVST result detected. Initiate referral.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-3xl border-white/15">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#6CE429]" />
                <span>AI Recommendation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {!aiResult ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 text-white/50">
                  <Sparkles className="h-9 w-9 text-[#6CE429]/60" />
                  <p className="text-xs font-medium">Awaiting visit submission...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Performance Summary</Label>
                    <p className="text-sm leading-relaxed text-white/90 border-l-2 border-[#6CE429] pl-3">
                      {aiResult.summary}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#8BE84A]">Microplanning Actions</Label>
                    <ul className="space-y-2">
                      {aiResult.actions.map((act: string, i: number) => (
                        <li key={i} className="text-xs text-white/85 flex gap-2">
                          <span className="text-[#6CE429]">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
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
