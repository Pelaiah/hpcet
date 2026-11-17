'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { generateRiskAssessmentSummary } from '@/ai/flows/generate-risk-assessment-summary';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase';
import { SentinelLogo } from '@/components/SentinelLogo';
import { SocialNetworkMap } from '@/components/SocialNetworkMap';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RISK_FACTORS = [
  'Inconsistent condom use',
  'High number of sexual partners',
  'Reported alcohol/substance use before sex',
  'Experience of gender-based violence (GBV)',
  'Lack of access to health facilities',
  'Frequent travel away from home ward',
];

const SAMPLE_RECENT_ASSESSMENTS = [
  { id: 'r1', title: 'Zone A - High Risk', time: '2h ago', level: 'High' as const, uin: 'V-A-80063' },
  { id: 'r2', title: 'Zone B - Medium Risk', time: '3h ago', level: 'Medium' as const, uin: 'M-B-91022' },
  { id: 'r3', title: 'Zone C - Low Risk', time: '4h ago', level: 'Low' as const, uin: 'V-C-77210' },
];

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<'Risk' | 'Hotspot' | 'SNA'>('Risk');
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: visits } = useCollection('outreachVisits');
  const { data: hotspotProfiles } = useCollection('hotspotProfiles');

  // Interactive Risk Assessment Engine
  const [uin, setUin] = useState('V-A-80063');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([
    'Inconsistent condom use',
    'Lack of access to health facilities',
  ]);
  const [assignedLevel, setAssignedLevel] = useState<'Low' | 'Medium' | 'High'>('High');
  const [loading, setLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<{ summary: string; rationale: string } | null>(null);

  const recentAssessments = useMemo(() => {
    if (visits && visits.length > 0) {
      return visits.slice(0, 6).map((v: any, idx: number) => ({
        id: v.id || `v-${idx}`,
        title: `${v.uin || 'Peer'} - ${v.riskLevel || 'Medium'} Risk`,
        time: v.visitDate || 'Recent',
        level: (v.riskLevel === 'High' || v.riskLevel === 'Low' ? v.riskLevel : 'Medium') as
          | 'High'
          | 'Medium'
          | 'Low',
        uin: v.uin || 'N/A',
      }));
    }
    return SAMPLE_RECENT_ASSESSMENTS;
  }, [visits]);

  const handleAssessment = async () => {
    if (!uin.trim()) {
      toast({ title: 'UIN Required', description: 'Enter a peer UIN before running AI analysis.', variant: 'destructive' });
      return;
    }
    if (selectedFactors.length === 0) {
      toast({ title: 'Select Risk Factors', description: 'Choose at least one risk factor.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const output = await generateRiskAssessmentSummary({
        identifiedRiskFactors: selectedFactors,
        assignedRiskLevel: assignedLevel,
      });
      setRiskResult(output);
      toast({ title: 'Risk Assessment Ready', description: `Clinical rationale generated for ${uin}.` });
    } catch (error) {
      console.error('Risk assessment summary generation failed:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate assessment rationale. Check your API configuration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 6 */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="min-h-[44px] min-w-[44px] rounded-full glass-panel-soft flex items-center justify-center text-white hover:border-[#6CE429]/40 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Assessments</h1>
            <p className="text-xs text-white/65">Risk screening, hotspot profiling, and social network analysis</p>
          </div>
        </div>
      </header>

      {/* Segmented Tabs: Risk | Hotspot | SNA */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-full glass-panel-soft max-w-md">
        {(['Risk', 'Hotspot', 'SNA'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'h-10 rounded-full text-sm font-semibold transition-all',
              activeTab === tab ? 'btn-emerald-gradient text-white' : 'text-white/75 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            {/* Featured Risk Assessment Card */}
            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="w-full text-left glass-panel rounded-3xl p-5 flex items-center justify-between gap-4 hover:border-[#6CE429]/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center shrink-0">
                  <SentinelLogo size={38} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Risk Assessment</h2>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                    AI-powered clinical rationales for prioritization
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>New Assessment</span>
            </button>

            {/* Recent Assessments List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Recent Assessments</h2>
                <Link href="/field/assess" className="text-xs font-medium text-[#6CE429] hover:underline">
                  View All &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentAssessments.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                          item.level === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : item.level === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-[#58D922]/20 text-[#6CE429]'
                        )}
                      >
                        {item.level === 'Low' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/60">{item.time}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Risk Assessment Builder */}
          <div className="lg:col-span-6">
            <div
              className={cn(
                'glass-panel rounded-3xl p-5 sm:p-6 space-y-5',
                !showBuilder && 'hidden lg:block'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Clinical Rationale Engine</h2>
                  <p className="text-xs text-white/65">Select observed risk factors and assign risk tier</p>
                </div>
                {showBuilder && (
                  <button
                    type="button"
                    onClick={() => setShowBuilder(false)}
                    className="lg:hidden min-h-[40px] min-w-[40px] rounded-full bg-white/10 flex items-center justify-center text-white"
                    aria-label="Close builder"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assess-uin" className="text-xs font-medium text-white/80">
                  Peer Unique ID (UIN)
                </Label>
                <Input
                  id="assess-uin"
                  value={uin}
                  onChange={(e) => setUin(e.target.value)}
                  placeholder="e.g. V-A-80063"
                  className="bg-black/35 border-white/15 text-white h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-white/80">Observed Risk Factors</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RISK_FACTORS.map((factor) => {
                    const checked = selectedFactors.includes(factor);
                    return (
                      <label
                        key={factor}
                        className={cn(
                          'flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors',
                          checked
                            ? 'bg-[#58D922]/15 border-[#6CE429]/40 text-white'
                            : 'bg-black/25 border-white/10 text-white/75'
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            setSelectedFactors((prev) =>
                              prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
                            )
                          }
                        />
                        <span>{factor}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-white/80">Assigned Risk Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAssignedLevel(lvl)}
                      className={cn(
                        'h-10 rounded-xl text-xs font-semibold border transition-colors',
                        assignedLevel === lvl
                          ? 'btn-emerald-gradient text-white border-[#6CE429]'
                          : 'bg-black/30 border-white/15 text-white/75'
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssessment}
                disabled={loading}
                className="w-full h-11 rounded-full btn-emerald-gradient font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                <span>Generate Clinical Rationale</span>
              </button>

              {riskResult && (
                <div className="rounded-2xl bg-black/40 border border-[#6CE429]/30 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#8BE84A]">Automated Summary</p>
                    <p className="text-sm text-white/85 mt-1 leading-relaxed">{riskResult.summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#8BE84A]">Clinical Rationale</p>
                    <p className="text-sm text-white/80 mt-1 leading-relaxed">{riskResult.rationale}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Hotspot' && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Hotspot Profiling Repository</h2>
              <p className="text-xs text-white/65">
                {hotspotProfiles?.length || 0} live field profiles synced · Mbare surveillance wards
              </p>
            </div>
            <Link
              href="/field/profiling"
              className="px-5 py-2.5 rounded-full btn-emerald-gradient text-sm font-semibold"
            >
              Open Spot Profiler
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(hotspotProfiles && hotspotProfiles.length > 0
              ? hotspotProfiles
              : [
                  { id: 'hp1', hotspotName: 'Mbare Market Zone', ward: 'Ward 3', priorityLevel: 'High' },
                  { id: 'hp2', hotspotName: 'Matapi Flats Hub', ward: 'Ward 3', priorityLevel: 'High' },
                  { id: 'hp3', hotspotName: 'Magaba Bar Strip', ward: 'Ward 4', priorityLevel: 'Medium' },
                ]
            ).map((hp: any) => (
              <div key={hp.id} className="rounded-2xl bg-black/35 border border-white/10 p-4 space-y-1.5">
                <p className="text-xs text-[#8BE84A]">{hp.ward || 'Ward 3'}</p>
                <p className="text-base font-bold text-white">{hp.hotspotName}</p>
                <p className="text-xs text-white/70">Priority: {hp.priorityLevel || 'Standard'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SNA' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Social Network Analysis</h2>
              <p className="text-xs text-white/65">Drag peer nodes or establish trust bridges</p>
            </div>
            <Link href="/field/network" className="text-xs font-medium text-[#6CE429] hover:underline">
              Full Screen Map &rarr;
            </Link>
          </div>
          <div className="h-[520px]">
            <SocialNetworkMap interactive={true} />
          </div>
        </div>
      )}
    </div>
  );
}
