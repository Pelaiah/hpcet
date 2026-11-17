'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Package, Droplets, FlaskConical, ChevronRight, X } from 'lucide-react';
import { INITIAL_STOCK, INITIAL_DISTRIBUTIONS } from '@/lib/store';
import { calculateFacilityStockSummary } from '@/lib/analytics';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InventoryPage() {
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [distributions] = useState(INITIAL_DISTRIBUTIONS);
  const [facility, setFacility] = useState<'All' | 'Matapi Youth Hub' | 'Edith Opperman Clinic'>('All');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryItem, setEntryItem] = useState('Condoms');
  const [entryQty, setEntryQty] = useState('500');

  const summary = calculateFacilityStockSummary(
    stock,
    facility === 'All' ? undefined : facility
  );

  // Aggregate by commodity name when viewing All facilities
  const commodityRows = React.useMemo(() => {
    const map = new Map<string, { name: string; units: number }>();
    summary.items.forEach((item) => {
      map.set(item.name, {
        name: item.name,
        units: (map.get(item.name)?.units || 0) + item.currentStock,
      });
    });
    return Array.from(map.values());
  }, [summary.items]);

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(0, parseInt(entryQty, 10) || 0);
    if (qty <= 0) {
      toast({ title: 'Invalid Quantity', description: 'Enter a positive stock amount.', variant: 'destructive' });
      return;
    }
    const targetFacility = facility === 'All' ? 'Matapi Youth Hub' : facility;
    setStock((prev) =>
      prev.map((item) =>
        item.name === entryItem && item.facility === targetFacility
          ? { ...item, totalReceived: item.totalReceived + qty, currentStock: item.currentStock + qty }
          : item
      )
    );
    setShowEntryModal(false);
    toast({ title: 'Stock Updated', description: `Added ${qty.toLocaleString()} ${entryItem} to ${targetFacility}.` });
  };

  const getCommodityIcon = (name: string) => {
    if (name.toLowerCase().includes('lube')) {
      return (
        <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
          <Droplets className="h-4 w-4" />
        </div>
      );
    }
    if (name.toLowerCase().includes('hivst') || name.toLowerCase().includes('test')) {
      return (
        <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
          <FlaskConical className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="h-9 w-9 rounded-full bg-[#58D922]/20 border border-[#6CE429]/30 flex items-center justify-center text-[#6CE429] shrink-0">
        <Package className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 7 */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="min-h-[44px] min-w-[44px] rounded-full glass-panel-soft flex items-center justify-center text-white hover:border-[#6CE429]/40 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Inventory</h1>
            <p className="text-xs text-white/65">Community supply nodes &amp; peer distributions</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEntryModal(true)}
          className="px-4 py-2.5 rounded-full btn-emerald-gradient text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Stock Entry</span>
        </button>
      </header>

      {/* Facility Filter */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Matapi Youth Hub', 'Edith Opperman Clinic'] as const).map((fac) => (
          <button
            key={fac}
            type="button"
            onClick={() => setFacility(fac)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold border transition-colors',
              facility === fac
                ? 'btn-emerald-gradient text-white border-[#6CE429]'
                : 'glass-panel-soft text-white/75 border-white/15 hover:text-white'
            )}
          >
            {fac === 'All' ? 'All Facilities' : fac}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          {/* Stock Level Hero Card matching Screen 7 */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/75">Stock Level</p>
              <p className="text-4xl font-extrabold text-white tabular-nums mt-1">
                {summary.availabilityPercent}%
              </p>
              <p className="text-xs text-white/60 mt-1 tabular-nums">
                {summary.totalInHand.toLocaleString()} / {summary.totalReceived.toLocaleString()} units in hand
              </p>
            </div>

            <div className="flex items-end gap-2 h-16" aria-hidden="true">
              <div className="w-3.5 h-8 rounded-t bg-gradient-to-t from-[#3E9F14] to-[#6CE429]" />
              <div className="w-3.5 h-12 rounded-t bg-gradient-to-t from-[#3E9F14] to-[#6CE429]" />
              <div className="w-3.5 h-16 rounded-t bg-gradient-to-t from-[#3E9F14] to-[#8BE84A]" />
            </div>
          </div>

          {/* Commodity List Card */}
          <div className="glass-panel rounded-3xl divide-y divide-white/10">
            {commodityRows.map((row) => (
              <div key={row.name} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {getCommodityIcon(row.name)}
                  <span className="text-base font-medium text-white">{row.name}</span>
                </div>
                <span className="text-sm font-semibold text-white/90 tabular-nums">
                  {row.units.toLocaleString()} pcs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Distribution Log with Supplies Photo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Distribution Log</h2>
                <button
                  type="button"
                  onClick={() => setShowLogDetails((prev) => !prev)}
                  className="text-xs font-semibold text-[#6CE429] hover:underline flex items-center gap-1"
                >
                  <span>{showLogDetails ? 'Hide Ledger' : 'View Details'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-white/60">Today</p>
              <p className="text-2xl font-bold text-white tabular-nums">460 dispensed</p>
            </div>

            <div className="relative h-44 w-full">
              <Image
                src={VISUAL_ASSETS.medicalSuppliesBoxes}
                alt="Community health clinic medical supply boxes"
                fill
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09140d] via-transparent to-[#09140d]/60" />
            </div>
          </div>

          <div
            className={cn(
              'glass-panel rounded-3xl p-5 space-y-3',
              !showLogDetails && 'hidden lg:block'
            )}
          >
            <h3 className="text-sm font-semibold text-white">Recent Peer Distributions</h3>
            <div className="space-y-2.5">
              {distributions
                .filter((d) => facility === 'All' || d.facility === facility)
                .map((dist) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between py-2 border-b border-white/10 last:border-0 text-sm"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {dist.peerUin} · {dist.itemName}
                      </p>
                      <p className="text-xs text-white/60">
                        {dist.ward} · {dist.timestamp}
                      </p>
                    </div>
                    <span className="font-bold text-[#6CE429] tabular-nums">{dist.quantity}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStock} className="glass-panel rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Stock Entry</h2>
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                aria-label="Close stock modal"
                className="min-h-[40px] min-w-[40px] rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-item" className="text-xs text-white/80">
                Commodity
              </Label>
              <select
                id="stock-item"
                value={entryItem}
                onChange={(e) => setEntryItem(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white"
              >
                {Array.from(new Set(INITIAL_STOCK.map((s) => s.name))).map((name) => (
                  <option key={name} value={name} className="bg-[#0e1e14] text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-qty" className="text-xs text-white/80">
                Quantity Received
              </Label>
              <Input
                id="stock-qty"
                type="number"
                min="1"
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
                className="bg-black/40 border-white/15 text-white h-11"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="px-4 py-2.5 rounded-full bg-white/10 text-sm text-white"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-full btn-emerald-gradient text-sm font-semibold">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
