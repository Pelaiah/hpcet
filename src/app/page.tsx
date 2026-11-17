'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  UserCog,
  Users,
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { SentinelLogo } from '@/components/SentinelLogo';
import { VISUAL_ASSETS } from '@/lib/visual-assets';
import { verifySecurityPin } from '@/lib/analytics';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autostart = searchParams.get('autostart') === '1';

  const [step, setStep] = useState<'welcome' | 'pin' | 'hub'>(autostart ? 'hub' : 'welcome');
  const [digits, setDigits] = useState<string[]>(['3', '5', '2', '4']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const auth = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (autostart) {
      setStep('hub');
    }
  }, [autostart]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(false);

    if (clean && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = digits.join('');
    if (verifySecurityPin(entered)) {
      setError(false);
      setStep('hub');
      toast({
        title: 'Access Granted',
        description: 'Welcome back to Sentinel Mbare.',
      });
    } else {
      setError(true);
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'Please enter your 4-digit access PIN (default: 3524).',
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: 'Signed In',
        description: 'Google account connected.',
      });
      setStep('hub');
    } catch (e: any) {
      console.error('Google sign-in failed:', e);
      toast({
        variant: 'destructive',
        title: 'Sign-In Unavailable',
        description: e?.message || 'Could not sign in with Google. Use PIN 3524 to continue.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStep('welcome');
      toast({
        title: 'Signed Out',
        description: 'You have been securely signed out.',
      });
    } catch (e: any) {
      console.error('Sign-out failed:', e);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: e?.message || 'Could not sign out.',
      });
    }
  };

  // Screen 1: Welcome / Sign In (matches first frame in mockup)
  if (step === 'welcome') {
    return (
      <main className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={VISUAL_ASSETS.mbareStreetHero}
            alt="Mbare community street and lush hillside"
            fill
            sizes="100vw"
            priority
            referrerPolicy="no-referrer"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07150c]/85 via-[#07150c]/60 to-[#061009]/95" />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SentinelLogo size={34} />
            <span className="text-base font-bold text-white tracking-tight">
              Sentinel <span className="text-[#6CE429]">Mbare</span>
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setStep('pin')}
            className="text-white/85 hover:text-white hover:bg-white/10 rounded-full px-4 h-10 text-sm"
          >
            PIN Access
          </Button>
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto px-6 pb-14 pt-6 flex flex-col items-center text-center space-y-6">
          <SentinelLogo size={84} className="drop-shadow-2xl" />

          <div className="space-y-2.5">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none drop-shadow-md">
              Sentinel
              <span className="block text-[#6CE429] mt-1">Mbare</span>
            </h1>
            <p className="text-base text-white/95 max-w-xs mx-auto leading-relaxed drop-shadow">
              Community Health Intelligence for a Healthier Mbare
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              type="button"
              onClick={() => setStep('pin')}
              className="w-full h-13 py-3.5 px-6 rounded-full btn-emerald-gradient font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-12 py-3 px-6 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/25 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Create Account / Google Sign-In</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Screen 2: Secure Access 4-digit PIN (matches second frame in mockup)
  if (step === 'pin') {
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('welcome')}
              aria-label="Back to welcome"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-white/85 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-white">Secure Access</h1>
            <div className="w-11" />
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#58D922]/15 border border-[#6CE429]/35">
              <Lock className="h-7 w-7 text-[#6CE429]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Enter Security PIN</h2>
            <p className="text-sm text-white/70 max-w-xs">
              Access your Sentinel Mbare dashboard
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Security PIN digit ${idx + 1}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className={cn(
                    'h-16 w-full rounded-2xl bg-black/45 border text-center text-2xl font-bold text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-[#6CE429] transition-all',
                    error ? 'border-red-400' : 'border-white/25'
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-300 flex items-center justify-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Incorrect security PIN. Use 3524 to unlock.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-base transition-transform active:scale-[0.98]"
            >
              Continue
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setDigits(['3', '5', '2', '4']);
                  setError(false);
                  toast({
                    title: 'Demo PIN Restored',
                    description: 'Security PIN set to 3524. Press Continue to enter.',
                  });
                }}
                className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline py-2"
              >
                Forgot PIN?
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // Unlocked Role Hub (CHM Supervisor vs PE Field Kit)
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <SentinelLogo size={38} />
            <div>
              <h1 className="text-xl font-bold text-white">
                Sentinel <span className="text-[#6CE429]">Mbare</span>
              </h1>
              <p className="text-xs text-white/70">Select your operational workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/80 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#6CE429]" />
                  {user.displayName || 'Authenticated'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white/75 hover:text-red-300 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleLogin}
                className="border-white/20 bg-white/5 text-white hover:bg-white/15"
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Connect Google Account
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#6CE429]/50 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#58D922]/15 border border-[#6CE429]/30">
                  <UserCog className="h-8 w-8 text-[#6CE429]" />
                </div>
                <span className="text-xs font-medium text-[#8BE84A]">Wards 3, 4, 11, 12</span>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-white">CHM Supervisor</h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  Community Health Monitor console for hotspot mapping, live PE monitoring, stock logistics, and reports.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span>Open Supervisor Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#6CE429]/50 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30">
                  <Users className="h-8 w-8 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-amber-300">Mobile Field Kit</span>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-white">PE Field Kit</h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  Peer Educator tools for social network mapping, outreach tracking, spot profiling, and field sync.
                </p>
              </div>
            </div>
            <Link
              href="/field"
              className="w-full h-12 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open PE Field Kit</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full" />}>
      <HomeContent />
    </Suspense>
  );
}
