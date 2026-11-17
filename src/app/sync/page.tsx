'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  RefreshCw,
  CloudUpload,
  ShieldCheck,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSync, setLastSync] = useState('5 min ago');
  const [isOnline, setIsOnline] = useState(true);

  const handleSync = () => {
    if (!isOnline) {
      toast({
        title: 'Sync Blocked',
        description: 'Network offline. Restore connectivity before syncing.',
        variant: 'destructive',
      });
      return;
    }

    setSyncing(true);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;

      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setSyncing(false);
        setLastSync(new Date().toLocaleTimeString());
        toast({
          title: 'Sync Complete',
          description: 'Field records successfully pushed to Sentinel Mbare hub.',
        });
      } else {
        setProgress(currentProgress);
      }
    }, 120);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Sync Intelligence</h1>
            <p className="text-xs text-white/65">Encrypted Field-to-Hub Data Synchronization</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={cn(
            'px-4 py-2 rounded-full border flex items-center gap-2.5 text-xs font-semibold transition-all self-start sm:self-auto',
            isOnline
              ? 'bg-[#132919]/80 border-[#6CE429]/40 text-white'
              : 'bg-red-950/70 border-red-400/40 text-red-200'
          )}
        >
          {isOnline ? <Wifi className="h-4 w-4 text-[#6CE429]" /> : <WifiOff className="h-4 w-4 text-red-400" />}
          <span>{isOnline ? 'Online · Toggle Offline' : 'Offline Mode · Tap to Restore'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass-panel rounded-3xl border-white/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <CloudUpload className="h-5 w-5 text-[#6CE429]" />
              <span>Deployment Pipeline</span>
            </CardTitle>
            <CardDescription className="text-white/65">
              Upload locally cached records for supervisor verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-medium text-white/60">Transfer Status</p>
                  <p className="text-base font-semibold text-white">
                    {syncing ? 'Encrypted transfer in progress...' : 'Ready for synchronization'}
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-[#6CE429] tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel-soft rounded-2xl p-4 space-y-1">
                <p className="text-xs text-white/60">Pending Records</p>
                <p className="text-2xl font-bold text-white tabular-nums">14</p>
              </div>
              <div className="glass-panel-soft rounded-2xl p-4 space-y-1">
                <p className="text-xs text-white/60">Last Verified</p>
                <p className="text-sm font-semibold text-[#8BE84A] flex items-center gap-2 tabular-nums">
                  <Clock className="h-4 w-4" /> {lastSync}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-sm gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
              <span>{syncing ? 'Syncing Records...' : 'Initiate Full System Sync'}</span>
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel rounded-3xl border-white/15">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Sync Manifest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6CE429]" />
                  <span className="text-sm font-medium text-white">Hotspot Diary</span>
                </div>
                <span className="text-xs text-white/70 tabular-nums">8 items</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#6CE429]" />
                  <span className="text-sm font-medium text-white">Risk Assessments</span>
                </div>
                <span className="text-xs text-white/70 tabular-nums">4 items</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 opacity-70">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">GPS Meta Logs</span>
                </div>
                <span className="text-xs text-white/70 tabular-nums">2 items</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-[#8BE84A]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>End-to-End Encryption Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
