'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle, CheckCircle2, ClipboardList, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { KPType } from '@/lib/types';

const INITIAL_ENTRIES = [
  { uin: 'V-A-80063', date: '2024-07-20', kpType: 'FSW' as KPType, isRegistered: true, notes: 'Initial intake', status: 'Verified' },
  { uin: 'M-B-91022', date: '2024-07-21', kpType: 'MSM' as KPType, isRegistered: false, notes: 'Follow up', status: 'Pending' },
];

const CASELOAD_LIMITS: Record<string, number> = { FSW: 80, MSM: 40, TG: 30 };

export default function HotspotDiaryPage() {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKpType, setSelectedKpType] = useState<KPType>('FSW');
  const [selectedRegistered, setSelectedRegistered] = useState('no');

  const stats = useMemo(() => {
    const total = entries.length;
    const registered = entries.filter((e) => e.isRegistered).length;
    const linkageRate = total > 0 ? (registered / total) * 100 : 0;
    const typeCounts = entries.reduce((acc, e) => {
      acc[e.kpType] = (acc[e.kpType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, linkageRate, typeCounts };
  }, [entries]);

  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const uin = (formData.get('uin') as string)?.trim();

    if (!uin) {
      toast({ title: 'Validation Error', description: 'Unique ID (UIN) is required.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (entries.some((entry) => entry.uin === uin)) {
      toast({ title: 'Validation Error', description: 'Duplicate Unique Identifier detected.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const newEntry = {
        uin,
        date: new Date().toISOString().split('T')[0],
        kpType: selectedKpType,
        isRegistered: selectedRegistered === 'yes',
        notes: (formData.get('notes') as string) || 'Field entry',
        status: 'Pending',
      };
      setEntries((prev) => [newEntry, ...prev]);
      setLoading(false);
      setIsDialogOpen(false);
      toast({ title: 'Entry Recorded', description: `Peer ${uin} added to diary.` });
    }, 350);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/field"
            aria-label="Back to PE Field Kit"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Hotspot Diary</h1>
            <p className="text-xs text-white/65">Confidential peer ledger &amp; microplanning caseload management</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-5 rounded-full btn-emerald-gradient font-semibold text-sm gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Peer Listing</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Register New Peer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEntry} className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/75">Unique ID (UIN)</Label>
                  <Input
                    name="uin"
                    placeholder="e.g. V-A-80064"
                    required
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/75">KP Type</Label>
                  <Select value={selectedKpType} onValueChange={(v) => setSelectedKpType(v as KPType)}>
                    <SelectTrigger className="bg-black/30 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FSW">FSW</SelectItem>
                      <SelectItem value="MSM">MSM</SelectItem>
                      <SelectItem value="TG">TG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/75">Registered at Clinic?</Label>
                <Select value={selectedRegistered} onValueChange={setSelectedRegistered}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/75">Notes</Label>
                <Input
                  name="notes"
                  placeholder="Optional field note"
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-full btn-emerald-gradient font-semibold">
                  {loading ? 'Saving...' : 'Commit to Ledger'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-hero-green rounded-2xl p-4">
          <p className="text-xs text-white/80 font-medium">Total Caseload</p>
          <p className="text-3xl font-extrabold text-white tabular-nums mt-1">{stats.total}</p>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <p className="text-xs text-white/70 font-medium">Clinic Linkage</p>
          <p
            className={cn(
              'text-3xl font-extrabold tabular-nums mt-1',
              stats.linkageRate < 80 ? 'text-amber-400' : 'text-[#6CE429]'
            )}
          >
            {stats.linkageRate.toFixed(0)}%
          </p>
          {stats.linkageRate < 80 && (
            <p className="text-[11px] text-amber-300 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" /> Below 80% target
            </p>
          )}
        </div>

        {Object.entries(CASELOAD_LIMITS).map(([type, limit]) => (
          <div key={type} className="glass-panel rounded-2xl p-4">
            <p className="text-xs text-white/70 font-medium">{type} Load</p>
            <p className="text-2xl font-bold text-white tabular-nums mt-1">
              {stats.typeCounts[type] || 0} <span className="text-sm font-normal text-white/50">/ {limit}</span>
            </p>
          </div>
        ))}
      </div>

      <Card className="glass-panel rounded-3xl border-white/15 overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#6CE429]" />
            <span>Active Peers Ledger</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5 text-xs text-white/70">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="pl-6 text-white/75">UIN</TableHead>
                <TableHead className="text-white/75">Type</TableHead>
                <TableHead className="text-white/75">Registration</TableHead>
                <TableHead className="text-white/75">Last Contact</TableHead>
                <TableHead className="text-right pr-6 text-white/75">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={`${entry.uin}-${idx}`} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-semibold text-white pl-6 tabular-nums">{entry.uin}</TableCell>
                  <TableCell className="text-white/85 text-xs font-semibold">{entry.kpType}</TableCell>
                  <TableCell>
                    {entry.isRegistered ? (
                      <span className="text-[#6CE429] flex items-center gap-1.5 text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Linked
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1.5 text-xs font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" /> Unlinked
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-white/65 tabular-nums">{entry.date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        entry.status === 'Verified' ? 'text-[#6CE429]' : 'text-amber-400'
                      )}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
