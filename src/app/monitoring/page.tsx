'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VISUAL_ASSETS } from '@/lib/visual-assets';

const ACTIVE_PES = [
  {
    id: 'pe1',
    name: 'T. Moyo',
    zone: 'At Zone A · 12 min ago',
    ward: 'Ward 3',
    activity: 'Hotspot Profiling',
    target: 'Mbare Market Zone',
    status: 'Online',
    avatar: VISUAL_ASSETS.supervisorAvatar,
  },
  {
    id: 'pe2',
    name: 'B. Dube',
    zone: 'At Zone B · 18 min ago',
    ward: 'Ward 4',
    activity: 'Risk Assessment',
    target: 'V-A-80063',
    status: 'Online',
    avatar: VISUAL_ASSETS.healthWorkerPortrait,
  },
  {
    id: 'pe3',
    name: 'S. Chikwanda',
    zone: 'At Zone C · 25 min ago',
    ward: 'Ward 11',
    activity: 'Outreach Tracking',
    target: 'UIN-9921',
    status: 'Online',
    avatar: VISUAL_ASSETS.supervisorAvatar,
  },
];

const WEEKLY_BARS = [32, 44, 52, 64, 72, 86];

export default function FieldMonitoringPage() {
  const [selectedPeId, setSelectedPeId] = useState<string>(ACTIVE_PES[0].id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 5 */}
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
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Field Monitor</h1>
            <p className="text-xs text-white/65">Active peer educators in Mbare wards</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/15">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-semibold text-white">Live</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          {/* Active PEs Hero Card */}
          <div className="glass-hero-green rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#6CE429]/25 border border-[#8BE84A]/40 flex items-center justify-center shrink-0">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/85">Active PEs</p>
                <p className="text-3xl font-extrabold text-white tabular-nums">12</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-[#A7F46C] tabular-nums">
              <TrendingUp className="h-4 w-4" />
              <span>2</span>
            </div>
          </div>

          {/* PE List */}
          <div className="space-y-3">
            {ACTIVE_PES.map((pe) => {
              const selected = selectedPeId === pe.id;
              return (
                <button
                  key={pe.id}
                  type="button"
                  onClick={() => setSelectedPeId(pe.id)}
                  className={cn(
                    'w-full text-left glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 transition-all',
                    selected ? 'border-[#6CE429]/50 bg-white/10' : 'hover:border-white/25'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/25 shrink-0">
                      <Image
                        src={pe.avatar}
                        alt={pe.name}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white truncate">{pe.name}</p>
                      <p className="text-xs text-white/65 truncate">{pe.zone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#6CE429] shrink-0">{pe.status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reach Progress + Activity Detail */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/80">Reach Progress</p>
                <p className="text-4xl font-extrabold text-white tabular-nums mt-1">78%</p>
              </div>

              {/* 6 vertical bars matching Screen 5 */}
              <div className="flex items-end gap-1.5 h-16" aria-hidden="true">
                {WEEKLY_BARS.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 rounded-t bg-gradient-to-t from-[#3E9F14] to-[#7CE62E]"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#45AF18] to-[#7CE62E]"
                style={{ width: '78%' }}
              />
            </div>

            <p className="text-xs text-white/65">
              Target: 16,000 community contacts across Wards 3, 4, 11, and 12
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Recent Field Check-Ins</h2>
            <div className="space-y-3">
              {ACTIVE_PES.map((pe) => (
                <div
                  key={pe.id}
                  className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {pe.name} · {pe.ward}
                    </p>
                    <p className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>
                        {pe.activity} ({pe.target})
                      </span>
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#6CE429] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
