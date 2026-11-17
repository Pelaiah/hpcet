'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Loader2,
  MapPin,
  Package,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { generateHotspotRecommendation, type HotspotRecommendationOutput } from '@/ai/flows/generate-hotspot-recommendation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ZONES = [
  {
    id: 'market',
    name: 'Mbare Market Zone',
    delta: '+28%',
    alertText: 'Increased risk in Mbare Market Zone (+28%)',
    actionText: 'Increase outreach and distribute more HIVST kits.',
    typology: ['Shebeen', 'Bar'],
    population: 2500,
    riskFlags: ['CRITICAL GAP: High evening foot traffic', 'HIVST demand spike (+28%)'],
    defaultStrategy: {
      analysis:
        'Evening pedestrian density around Mbare Musika stalls and adjacent shebeens has increased HIVST and condom demand by 28% over the past 7 days.',
      recommendations: [
        'Deploy 4 additional Peer Educators to Mbare Market Zone during 17:00–21:00 peak hours.',
        'Reallocate 450 HIVST Kits and 1,200 condoms from Edith Opperman reserve to Matapi Youth Hub.',
        'Establish a trust bridge between Ward 3 Peer Leaders and transit-hub venue focal persons.',
      ],
      priorityLevel: 'Critical' as const,
    },
  },
  {
    id: 'matapi',
    name: 'Matapi Flats Hub',
    delta: '+16%',
    alertText: 'Elevated evening congregation at Matapi Flats Hub (+16%)',
    actionText: 'Schedule mobile clinic linkage and peer leader check-ins.',
    typology: ['Shebeen', 'Home-based'],
    population: 1850,
    riskFlags: ['PROGRAM GAP: Lubricant stock below 45%'],
    defaultStrategy: {
      analysis:
        'Matapi Flats Hub shows steady peer engagement with localized lubricant shortages across Ward 3 blocks.',
      recommendations: [
        'Restock Matapi Youth Hub with 800 lubricant sachets before weekend outreach.',
        'Pair new KP members with verified Peer Leaders for clinic linkage follow-up.',
        'Log nightly activity summaries in Hotspot Diary for supervisor review.',
      ],
      priorityLevel: 'High' as const,
    },
  },
];

export default function AiInsightsPage() {
  const [selectedZoneId, setSelectedZoneId] = useState('market');
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<HotspotRecommendationOutput | null>(null);

  const activeZone = ZONES.find((z) => z.id === selectedZoneId) || ZONES[0];
  const displayedStrategy = aiStrategy || activeZone.defaultStrategy;

  const handleViewStrategy = () => {
    setStrategyOpen(true);
    const panel = document.getElementById('strategy-plan-panel');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleRefreshAi = async () => {
    setStrategyOpen(true);
    setLoading(true);
    try {
      const result = await generateHotspotRecommendation({
        hotspotName: activeZone.name,
        typology: activeZone.typology,
        totalEstimatedPopulation: activeZone.population,
        riskFlags: activeZone.riskFlags,
        barriers: 'Evening transit mobility and localized HIVST replenishment lag.',
        serviceGaps: ['HIVST Kit replenishment', 'Evening clinic referral linkage'],
      });
      setAiStrategy(result);
    } catch (error) {
      console.error('AI Insights strategy generation fallback triggered:', error);
      setAiStrategy(activeZone.defaultStrategy);
      toast({
        title: 'Loaded Cached Strategy',
        description: `Showing operational action plan for ${activeZone.name}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 10 */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to Dashboard"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Insights</h1>
            <p className="text-xs text-white/65">Predictive Ward Risk &amp; Allocation Guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                setSelectedZoneId(z.id);
                setAiStrategy(null);
              }}
              className={cn(
                'px-3.5 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px]',
                selectedZoneId === z.id
                  ? 'btn-emerald-gradient text-white'
                  : 'glass-panel-soft text-white/75 hover:text-white'
              )}
            >
              {z.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* Main Layout matching Screen 10 visual composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left/Hero Composition Card */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden glass-panel min-h-[540px] flex flex-col justify-between p-5 sm:p-7">
          {/* Right-weighted Health Worker Portrait with atmospheric left scrim */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={VISUAL_ASSETS.healthWorkerPortrait}
              alt="Community health educator in Mbare"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              referrerPolicy="no-referrer"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09140d] via-[#09140d]/80 to-[#09140d]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09140d] via-transparent to-[#09140d]/60" />
          </div>

          {/* Top Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#8BE84A]">
              <Sparkles className="h-4 w-4" />
              Live Microplanning Signal
            </span>
            <span className="text-xs font-medium text-white/75 tabular-nums">
              Est. Pop: ~{activeZone.population.toLocaleString()}
            </span>
          </div>

          {/* Middle Alert & Recommended Action Glass Cards */}
          <div className="relative z-10 space-y-4 max-w-md my-6">
            {/* Risk Alert Card */}
            <div className="rounded-2xl p-4 sm:p-5 bg-red-950/55 backdrop-blur-xl border border-red-400/35 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white">Risk Alert</h2>
                  <p className="text-sm text-white/90 leading-relaxed">{activeZone.alertText}</p>
                </div>
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="rounded-2xl p-4 sm:p-5 bg-[#152418]/70 backdrop-blur-xl border border-amber-400/35 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white">Recommended Action</h2>
                  <p className="text-sm text-white/90 leading-relaxed">{activeZone.actionText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width CTA */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={handleViewStrategy}
              disabled={loading}
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              <span>{loading ? 'Generating Strategy...' : 'View Strategy'}</span>
            </button>
          </div>
        </div>

        {/* Right Strategy Execution Panel */}
        <div
          id="strategy-plan-panel"
          className={cn(
            'lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 transition-all',
            strategyOpen && 'ring-2 ring-[#6CE429]/50'
          )}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <p className="text-xs font-semibold text-[#8BE84A]">Actionable Deployment Plan</p>
                <h2 className="text-lg font-bold text-white">{activeZone.name}</h2>
              </div>
              <button
                type="button"
                onClick={handleRefreshAi}
                disabled={loading}
                aria-label="Refresh AI strategy"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/60">Situation Analysis</p>
              <p className="text-sm text-white/90 leading-relaxed bg-black/25 rounded-2xl p-4 border border-white/10">
                {displayedStrategy.analysis}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/60">Recommended Steps</p>
                <span className="text-xs font-semibold text-amber-400">
                  Priority: {displayedStrategy.priorityLevel}
                </span>
              </div>
              <ul className="space-y-2.5">
                {displayedStrategy.recommendations.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/90"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#6CE429] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {strategyOpen && (
              <div className="p-3.5 rounded-2xl bg-[#58D922]/15 border border-[#6CE429]/30 text-xs text-[#A7F46C] font-medium">
                Strategy ready for supervisor dispatch to Ward 3 &amp; Ward 4 Peer Educators.
              </div>
            )}
          </div>

          {/* Quick Execution Links */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <Link
              href="/hotspots/monitoring"
              className="glass-panel-soft rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 hover:border-[#6CE429]/40 transition-colors"
            >
              <MapPin className="h-4 w-4 text-[#6CE429]" />
              <span className="text-xs font-semibold text-white">Hotspot Map</span>
            </Link>
            <Link
              href="/inventory"
              className="glass-panel-soft rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 hover:border-[#6CE429]/40 transition-colors"
            >
              <Package className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">Allocate Kits</span>
            </Link>
            <Link
              href="/field/outreach"
              className="glass-panel-soft rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 hover:border-[#6CE429]/40 transition-colors"
            >
              <CalendarDays className="h-4 w-4 text-[#6CE429]" />
              <span className="text-xs font-semibold text-white">Log Outreach</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
