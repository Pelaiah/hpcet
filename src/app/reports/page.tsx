'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Download,
  BarChart3,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatReportCsv } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';

type ReportTab = 'Reach' | 'Risk' | 'Supply';

const REPORT_ROWS = [
  { month: 'Jul', reach: 4800, assessments: 68, stockPercent: 84 },
  { month: 'Aug', reach: 5600, assessments: 82, stockPercent: 86 },
  { month: 'Sep', reach: 6900, assessments: 95, stockPercent: 88 },
  { month: 'Oct', reach: 7800, assessments: 112, stockPercent: 90 },
  { month: 'Nov', reach: 9600, assessments: 129, stockPercent: 91 },
  { month: 'Dec', reach: 12400, assessments: 148, stockPercent: 92 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('Reach');
  const [selectedMonth, setSelectedMonth] = useState('Dec');

  const activePoint = REPORT_ROWS.find((r) => r.month === selectedMonth) || REPORT_ROWS[REPORT_ROWS.length - 1];

  const getMetricValue = (row: (typeof REPORT_ROWS)[number]) => {
    if (activeTab === 'Reach') return row.reach;
    if (activeTab === 'Risk') return row.assessments;
    return row.stockPercent;
  };

  const getMaxMetric = () => {
    if (activeTab === 'Reach') return 13500;
    if (activeTab === 'Risk') return 165;
    return 100;
  };

  const formatCallout = (val: number) => {
    if (activeTab === 'Reach') return `${(val / 1000).toFixed(1)}k`;
    if (activeTab === 'Risk') return `${val}`;
    return `${val}%`;
  };

  const handleExportCsv = () => {
    const csv = formatReportCsv(REPORT_ROWS);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sentinel-mbare-${activeTab.toLowerCase()}-report.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast({
      title: 'Report Exported',
      description: `Downloaded sentinel-mbare-${activeTab.toLowerCase()}-report.csv`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header matching Screen 11 */}
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
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Reports</h1>
            <p className="text-xs text-white/65">Jul – Dec Community Health Analytics</p>
          </div>
        </div>
      </header>

      {/* Segmented Tabs: Reach | Risk | Supply */}
      <div className="glass-panel rounded-full p-1.5 grid grid-cols-3 gap-1.5 max-w-md">
        {(['Reach', 'Risk', 'Supply'] as ReportTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'min-h-[42px] rounded-full text-sm font-semibold transition-all',
              activeTab === tab
                ? 'btn-emerald-gradient text-white'
                : 'text-white/75 hover:text-white hover:bg-white/5'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bar Chart Card matching Screen 11 */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/65">
                {activeTab === 'Reach'
                  ? 'Monthly Community Reach'
                  : activeTab === 'Risk'
                  ? 'Verified Risk Assessments'
                  : 'Facility Stock Availability'}
              </p>
              <p className="text-2xl font-extrabold text-white tabular-nums mt-0.5">
                {activeTab === 'Reach'
                  ? activePoint.reach.toLocaleString()
                  : activeTab === 'Risk'
                  ? `${activePoint.assessments} assessments`
                  : `${activePoint.stockPercent}% available`}
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-sm font-bold text-white tabular-nums">
              {selectedMonth}: {formatCallout(getMetricValue(activePoint))}
            </div>
          </div>

          {/* 6-Month Vertical Bars */}
          <div className="pt-8 pb-2">
            <div className="grid grid-cols-6 gap-3 sm:gap-5 items-end h-56">
              {REPORT_ROWS.map((row) => {
                const value = getMetricValue(row);
                const heightPct = Math.max(16, Math.round((value / getMaxMetric()) * 100));
                const isSelected = row.month === selectedMonth;
                return (
                  <button
                    key={row.month}
                    type="button"
                    onClick={() => setSelectedMonth(row.month)}
                    aria-label={`${row.month}: ${formatCallout(value)}`}
                    className="group flex flex-col items-center justify-end h-full focus:outline-none"
                  >
                    <div className="relative w-full max-w-[44px] h-44 rounded-xl bg-white/8 border border-white/10 flex items-end overflow-visible">
                      {isSelected && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#09140d] border border-[#6CE429]/50 text-xs font-bold text-white whitespace-nowrap shadow-lg tabular-nums z-10">
                          {formatCallout(value)}
                        </div>
                      )}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={cn(
                          'w-full rounded-xl transition-all duration-300',
                          isSelected
                            ? 'bg-gradient-to-t from-[#3E9F14] to-[#7CE62E] shadow-[0_0_24px_rgba(108,228,41,0.45)]'
                            : 'bg-gradient-to-t from-[#2F7C10]/80 to-[#6CE429]/75 group-hover:brightness-110'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'mt-2.5 text-xs font-semibold transition-colors',
                        isSelected ? 'text-[#8BE84A]' : 'text-white/70'
                      )}
                    >
                      {row.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Key Insights + Export Card matching Screen 11 */}
        <section className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Key Insights</h2>

            <div className="space-y-3">
              <div className="glass-panel-soft rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#58D922]/20 border border-[#6CE429]/30 flex items-center justify-center shrink-0">
                    <ArrowUp className="h-5 w-5 text-[#6CE429]" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white tabular-nums">18%</p>
                    <p className="text-xs text-white/70">Reach Increase</p>
                  </div>
                </div>
                <BarChart3 className="h-5 w-5 text-[#6CE429]/70" />
              </div>

              <div className="glass-panel-soft rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <ArrowDown className="h-5 w-5 text-[#6CE429]" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white tabular-nums">92%</p>
                    <p className="text-xs text-white/70">Stock Availability</p>
                  </div>
                </div>
                <Package className="h-5 w-5 text-amber-400/80" />
              </div>

              <div className="glass-panel-soft rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#58D922]/20 border border-[#6CE429]/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-[#6CE429]" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white tabular-nums">148</p>
                    <p className="text-xs text-white/70">December Verified Assessments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full h-12 rounded-full bg-[#19331e]/85 hover:bg-[#224528] border border-[#6CE429]/45 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Download className="h-4 w-4 text-[#6CE429]" />
            <span>Export Report</span>
          </button>
        </section>
      </div>
    </div>
  );
}
