'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  Settings as SettingsIcon,
  Bell,
  Info,
  LogOut,
  Check,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SettingsSection = 'security' | 'preferences' | 'notifications' | 'about' | null;

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [openSection, setOpenSection] = useState<SettingsSection>(null);
  const [pinLockEnabled, setPinLockEnabled] = useState(true);
  const [defaultWard, setDefaultWard] = useState('Ward 3');
  const [offlineCache, setOfflineCache] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const toggleSection = (section: Exclude<SettingsSection, null>) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      toast({
        title: 'Signed Out',
        description: 'Your Sentinel Mbare session has been closed safely.',
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out cleanly:', error);
      toast({
        title: 'Sign Out Error',
        description: 'Returned to sign-in screen.',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header matching Screen 12 */}
      <header className="flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Back to Dashboard"
          className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Settings</h1>
      </header>

      {/* Profile Card */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white/25 shrink-0">
            <Image
              src={VISUAL_ASSETS.supervisorAvatar}
              alt="Pelaiah Ngarande"
              fill
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pelaiah Ngarande</h2>
            <p className="text-sm text-white/75">CHM Supervisor · Mbare District</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#6CE429]">Active</span>
      </div>

      {/* Interactive Menu Rows matching Screen 12 */}
      <div className="space-y-3">
        {/* Account & Security */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('security')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[60px]"
          >
            <div className="flex items-center gap-3.5">
              <Lock className="h-5 w-5 text-white/80" />
              <span className="text-base font-medium text-white">Account &amp; Security</span>
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5 text-white/50 transition-transform',
                openSection === 'security' && 'rotate-90 text-[#6CE429]'
              )}
            />
          </button>
          {openSection === 'security' && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">4-Digit PIN Verification</p>
                  <p className="text-xs text-white/60">Require PIN on dashboard launch</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPinLockEnabled(!pinLockEnabled)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    pinLockEnabled
                      ? 'bg-[#58D922]/20 border-[#6CE429]/50 text-[#8BE84A]'
                      : 'bg-white/5 border-white/15 text-white/60'
                  )}
                >
                  {pinLockEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Preferences */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('preferences')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[60px]"
          >
            <div className="flex items-center gap-3.5">
              <SettingsIcon className="h-5 w-5 text-white/80" />
              <span className="text-base font-medium text-white">App Preferences</span>
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5 text-white/50 transition-transform',
                openSection === 'preferences' && 'rotate-90 text-[#6CE429]'
              )}
            />
          </button>
          {openSection === 'preferences' && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Primary Ward Focus</p>
                  <p className="text-xs text-white/60">Default filter for Hotspot Map &amp; Reports</p>
                </div>
                <select
                  value={defaultWard}
                  onChange={(e) => setDefaultWard(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="Ward 3">Ward 3</option>
                  <option value="Ward 4">Ward 4</option>
                  <option value="Ward 11">Ward 11</option>
                  <option value="Ward 12">Ward 12</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Offline Field Cache</p>
                  <p className="text-xs text-white/60">Queue outreach entries when signal drops</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOfflineCache(!offlineCache)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5',
                    offlineCache
                      ? 'bg-[#58D922]/20 border-[#6CE429]/50 text-[#8BE84A]'
                      : 'bg-white/5 border-white/15 text-white/60'
                  )}
                >
                  {offlineCache && <Check className="h-3.5 w-3.5" />}
                  {offlineCache ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('notifications')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[60px]"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="h-5 w-5 text-white/80" />
              <span className="text-base font-medium text-white">Notifications</span>
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5 text-white/50 transition-transform',
                openSection === 'notifications' && 'rotate-90 text-[#6CE429]'
              )}
            />
          </button>
          {openSection === 'notifications' && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">High-Risk Hotspot Surge Alerts</span>
                <button
                  type="button"
                  onClick={() => setRiskAlerts(!riskAlerts)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border',
                    riskAlerts
                      ? 'bg-[#58D922]/20 border-[#6CE429]/50 text-[#8BE84A]'
                      : 'bg-white/5 border-white/15 text-white/60'
                  )}
                >
                  {riskAlerts ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Low Stock Commodity Warnings</span>
                <button
                  type="button"
                  onClick={() => setLowStockAlerts(!lowStockAlerts)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border',
                    lowStockAlerts
                      ? 'bg-[#58D922]/20 border-[#6CE429]/50 text-[#8BE84A]'
                      : 'bg-white/5 border-white/15 text-white/60'
                  )}
                >
                  {lowStockAlerts ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About Sentinel Mbare */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('about')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[60px]"
          >
            <div className="flex items-center gap-3.5">
              <Info className="h-5 w-5 text-white/80" />
              <span className="text-base font-medium text-white">About Sentinel Mbare</span>
            </div>
            <ChevronRight
              className={cn(
                'h-5 w-5 text-white/50 transition-transform',
                openSection === 'about' && 'rotate-90 text-[#6CE429]'
              )}
            />
          </button>
          {openSection === 'about' && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 text-sm text-white/80 space-y-1.5">
              <p className="font-semibold text-white">Sentinel Mbare Community Health Intelligence</p>
              <p className="text-xs text-white/65">
                Confidential peer outreach, microplanning, hotspot intelligence, and facility stock reconciliation for Mbare District.
              </p>
              <p className="text-xs text-[#8BE84A]">Encrypted Field-to-Hub Sync · v2.4</p>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out CTA matching Screen 12 */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full h-12 rounded-full bg-red-950/75 hover:bg-red-900/80 border border-red-400/40 text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-lg"
      >
        <LogOut className="h-4 w-4 text-red-300" />
        <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
      </button>
    </div>
  );
}
