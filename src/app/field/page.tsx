'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronRight,
  Network,
  ClipboardList,
  MapPin,
  BookOpen,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { VISUAL_ASSETS } from '@/lib/visual-assets';

const FIELD_MODULES = [
  {
    title: 'Social Network Map',
    subtitle: 'Peer trust bridges & cluster reach',
    href: '/field/network',
    icon: Network,
  },
  {
    title: 'Outreach Tracking',
    subtitle: 'Log visits, HIVST & commodities',
    href: '/field/outreach',
    icon: ClipboardList,
  },
  {
    title: 'Spot Profiler',
    subtitle: 'Capture hotspot GPS & KP estimates',
    href: '/field/profiling',
    icon: MapPin,
  },
  {
    title: 'Hotspot Diary',
    subtitle: 'Confidential peer caseload ledger',
    href: '/field/diary',
    icon: BookOpen,
  },
  {
    title: 'Sync Intelligence',
    subtitle: 'Push encrypted offline records',
    href: '/sync',
    icon: RefreshCw,
  },
];

export default function FieldDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 8 */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to Supervisor Home"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">PE Field Kit</h1>
            <p className="text-xs text-white/65">Ward 3 &amp; Ward 4 Mobilization Suite</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#132919]/80 border border-[#6CE429]/40 text-xs font-semibold text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6CE429]" />
          <span>Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Screen 8 Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Team Hero Banner */}
          <div className="relative h-52 sm:h-60 rounded-3xl overflow-hidden glass-panel">
            <Image
              src={VISUAL_ASSETS.peTeamBanner}
              alt="Peer Educator team collaborating in Mbare"
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09140d] via-[#09140d]/25 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-[#8BE84A]">Active Peer Mobilization</p>
                <p className="text-base font-bold text-white">Mbare Field Team · Shift Ready</p>
              </div>
              <span className="text-xs font-semibold text-white/80 tabular-nums">12 Active PEs</span>
            </div>
          </div>

          {/* 5 Field Module Rows matching Screen 8 */}
          <div className="space-y-2.5">
            {FIELD_MODULES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#6CE429]/45 transition-all group min-h-[64px]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#58D922]/15 border border-[#6CE429]/30 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-[#6CE429]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-white group-hover:text-[#8BE84A] transition-colors truncate">
                      {item.title}
                    </h2>
                    <p className="text-xs text-white/60 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-white/45 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Companion Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-hero-green rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#6CE429]/25 border border-[#8BE84A]/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Quick Risk Screening</h2>
                <p className="text-xs text-white/80">Generate AI clinical rationales in the field</p>
              </div>
            </div>
            <Link
              href="/field/assess"
              className="w-full h-11 rounded-full btn-emerald-gradient font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span>Open Risk Assessment Tool</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Field Readiness Checklist</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-4 w-4 text-[#6CE429]" />
                  <span>Assigned Catchment</span>
                </div>
                <span className="text-sm font-semibold text-white">Ward 3 &amp; Ward 4</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-4 w-4 text-[#6CE429]" />
                  <span>Pending Sync Queue</span>
                </div>
                <span className="text-sm font-semibold text-[#8BE84A] tabular-nums">14 records</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-4 w-4 text-[#6CE429]" />
                  <span>Clinic Linkage Target</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">80%+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
