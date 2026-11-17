'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Map as MapIcon,
  ShieldCheck,
  Package,
  BarChart3,
  Users,
  MapPin,
  Box,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { INITIAL_STOCK } from '@/lib/store';
import { calculateStockAvailabilityPercent } from '@/lib/analytics';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [isSyncing, setIsSyncing] = useState(false);

  const stockPercent = calculateStockAvailabilityPercent(stock);

  const handleSyncPeersForm = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStock((prev) =>
        prev.map((s) =>
          s.name === 'Condoms' && s.facility === 'Matapi Youth Hub'
            ? { ...s, totalDispensed: s.totalDispensed + 250, currentStock: Math.max(0, s.currentStock - 250) }
            : s
        )
      );
      toast({
        title: 'Peers Form Synced',
        description: 'Latest ward commodity distributions reconciled.',
      });
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 3 */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/75">Welcome back,</p>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Pelaiah</h1>
            <span className="text-xs font-medium text-[#8BE84A]">· CHM Supervisor</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncPeersForm}
            disabled={isSyncing}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#6CE429]" />
            <span>{isSyncing ? 'Syncing...' : 'Sync Peers Form'}</span>
          </button>

          <Link
            href="/settings"
            aria-label="Account settings for Pelaiah Ngarande"
            className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-white/30 hover:border-[#6CE429] transition-colors shrink-0"
          >
            <Image
              src={VISUAL_ASSETS.supervisorAvatar}
              alt="Pelaiah Ngarande"
              fill
              sizes="44px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </Link>
        </div>
      </header>

      {/* Main Grid: Balanced Desktop + Mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Primary Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hero Total Reach Card */}
          <Link
            href="/reports"
            className="block glass-hero-green rounded-3xl p-5 sm:p-6 hover:brightness-105 transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#6CE429]/25 border border-[#8BE84A]/40 flex items-center justify-center shrink-0">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/85">Total Reach</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                    12,480
                  </p>
                  <p className="text-xs font-semibold text-[#A7F46C] flex items-center gap-1 mt-0.5 tabular-nums">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>12% vs last month</span>
                  </p>
                </div>
              </div>

              {/* Sparkline SVG matching Screen 3 */}
              <div className="flex flex-col items-end gap-2">
                <ChevronRight className="h-5 w-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                <svg width="140" height="56" viewBox="0 0 140 56" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="reachSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8BE84A" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8BE84A" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M2 46 L22 36 L40 42 L62 28 L80 33 L102 18 L120 22 L138 6 L138 54 L2 54 Z"
                    fill="url(#reachSpark)"
                  />
                  <path
                    d="M2 46 L22 36 L40 42 L62 28 L80 33 L102 18 L120 22 L138 6"
                    stroke="#A7F46C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <Link
              href="/monitoring"
              className="glass-panel rounded-2xl p-3 sm:p-4 hover:border-[#6CE429]/40 transition-colors"
            >
              <p className="text-[11px] sm:text-xs text-white/70 font-medium truncate">Active PEs</p>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">48</span>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#6CE429] shrink-0" />
              </div>
            </Link>

            <Link
              href="/hotspots/monitoring"
              className="glass-panel rounded-2xl p-3 sm:p-4 hover:border-[#6CE429]/40 transition-colors"
            >
              <p className="text-[11px] sm:text-xs text-white/70 font-medium truncate">Hotspots</p>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">24</span>
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 shrink-0" />
              </div>
            </Link>

            <Link
              href="/inventory"
              className="glass-panel rounded-2xl p-3 sm:p-4 hover:border-[#6CE429]/40 transition-colors"
            >
              <p className="text-[11px] sm:text-xs text-white/70 font-medium truncate">Stock</p>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">{stockPercent}%</span>
                <Box className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 shrink-0" />
              </div>
            </Link>
          </div>

          {/* Quick Actions 2x2 Grid */}
          <section aria-labelledby="quick-actions-heading" className="space-y-3">
            <h2 id="quick-actions-heading" className="text-sm font-semibold text-white/90">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/hotspots/monitoring"
                className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:border-[#6CE429]/40 transition-colors min-h-[64px]"
              >
                <div className="h-10 w-10 rounded-xl bg-[#58D922]/15 border border-[#6CE429]/25 flex items-center justify-center shrink-0">
                  <MapIcon className="h-5 w-5 text-[#6CE429]" />
                </div>
                <span className="text-sm font-semibold text-white">View Map</span>
              </Link>

              <Link
                href="/assessment"
                className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:border-[#6CE429]/40 transition-colors min-h-[64px]"
              >
                <div className="h-10 w-10 rounded-xl bg-[#58D922]/15 border border-[#6CE429]/25 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-[#6CE429]" />
                </div>
                <span className="text-sm font-semibold text-white">Assessments</span>
              </Link>

              <Link
                href="/inventory"
                className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:border-[#6CE429]/40 transition-colors min-h-[64px]"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-white">Inventory</span>
              </Link>

              <Link
                href="/reports"
                className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:border-[#6CE429]/40 transition-colors min-h-[64px]"
              >
                <div className="h-10 w-10 rounded-xl bg-[#58D922]/15 border border-[#6CE429]/25 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-[#6CE429]" />
                </div>
                <span className="text-sm font-semibold text-white">Reports</span>
              </Link>
            </div>
          </section>

          {/* System Online Card */}
          <Link
            href="/sync"
            className="glass-panel rounded-2xl p-4 flex items-center justify-between hover:border-[#6CE429]/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-full bg-[#58D922]/20 border border-[#6CE429]/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-[#6CE429]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">System Online</p>
                <p className="text-xs text-white/65">Last sync: 5 min ago</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/50" />
          </Link>
        </div>

        {/* Right Column: Desktop Intelligence & Field Highlights */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Insights Spotlight */}
          <div className="glass-panel rounded-3xl overflow-hidden relative">
            <div className="relative h-44 w-full">
              <Image
                src={VISUAL_ASSETS.healthWorkerPortrait}
                alt="Community health outreach worker in Mbare"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                referrerPolicy="no-referrer"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09140d] via-[#09140d]/50 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#8BE84A] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Insights
                  </p>
                  <h2 className="text-lg font-bold text-white">Mbare Market Zone Alert</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-white/80 leading-relaxed">
                Elevated risk activity (+28%) detected around Mbare Market Zone. Increase evening peer outreach and prioritize HIVST kit replenishment.
              </p>
              <Link
                href="/ai-insights"
                className="w-full h-11 rounded-full btn-emerald-gradient font-semibold text-sm flex items-center justify-center gap-2"
              >
                <span>Open AI Insights</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Active Wards Coverage */}
          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Facility Stock Nodes</h2>
              <Link href="/inventory" className="text-xs font-medium text-[#6CE429] hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Matapi Youth Hub</p>
                  <p className="text-xs text-white/60">Wards 3 &amp; 4</p>
                </div>
                <span className="text-sm font-bold text-[#6CE429] tabular-nums">
                  {stock
                    .filter((s) => s.facility === 'Matapi Youth Hub')
                    .reduce((a, b) => a + b.currentStock, 0)
                    .toLocaleString()}{' '}
                  units
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">Edith Opperman Clinic</p>
                  <p className="text-xs text-white/60">Wards 11 &amp; 12</p>
                </div>
                <span className="text-sm font-bold text-white tabular-nums">
                  {stock
                    .filter((s) => s.facility === 'Edith Opperman Clinic')
                    .reduce((a, b) => a + b.currentStock, 0)
                    .toLocaleString()}{' '}
                  units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
