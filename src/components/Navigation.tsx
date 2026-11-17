'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Map as MapIcon,
  BarChart3,
  MoreHorizontal,
  LayoutDashboard,
  Activity,
  ShieldCheck,
  Package,
  Sparkles,
  Settings,
  Network,
  CalendarDays,
  Target,
  BookOpen,
  RefreshCw,
  Users,
  UserCog,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SentinelLogo } from '@/components/SentinelLogo';
import { VISUAL_ASSETS } from '@/lib/visual-assets';

export function Navigation() {
  const pathname = usePathname();
  const [role, setRole] = useState<'CHM' | 'PE'>('CHM');
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const peRoutes = ['/field', '/sync'];
    if (peRoutes.some((r) => pathname.startsWith(r))) {
      setRole('PE');
    } else if (
      ['/dashboard', '/hotspots/monitoring', '/monitoring', '/assessment', '/inventory', '/reports', '/ai-insights', '/settings'].some(
        (r) => pathname.startsWith(r)
      )
    ) {
      setRole('CHM');
    }
  }, [pathname]);

  const chmNav = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Hotspot Map', href: '/hotspots/monitoring', icon: MapIcon },
    { name: 'Field Monitor', href: '/monitoring', icon: Activity },
    { name: 'Assessments', href: '/assessment', icon: ShieldCheck },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
    { name: 'PE Field Kit', href: '/field', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const peNav = [
    { name: 'PE Field Kit', href: '/field', icon: Users },
    { name: 'Social Network', href: '/field/network', icon: Network },
    { name: 'Outreach Tracking', href: '/field/outreach', icon: CalendarDays },
    { name: 'Spot Profiler', href: '/field/profiling', icon: Target },
    { name: 'Hotspot Diary', href: '/field/diary', icon: BookOpen },
    { name: 'Risk Assessment', href: '/field/assess', icon: ShieldCheck },
    { name: 'Sync Intelligence', href: '/sync', icon: RefreshCw },
    { name: 'Supervisor Home', href: '/dashboard', icon: UserCog },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const desktopItems = role === 'CHM' ? chmNav : peNav;

  const mobileTabs = [
    { name: 'Home', href: role === 'CHM' ? '/dashboard' : '/field', icon: Home },
    { name: 'Map', href: role === 'CHM' ? '/hotspots/monitoring' : '/field/network', icon: MapIcon },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-white/10 bg-[#08130c]/75 backdrop-blur-2xl p-5 z-40">
        <Link href="/" className="flex items-center gap-3 px-2 py-1 mb-6">
          <SentinelLogo size={38} />
          <div className="leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-white">Sentinel </span>
            <span className="text-lg font-extrabold tracking-tight text-[#6CE429]">Mbare</span>
          </div>
        </Link>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/35 border border-white/10 mb-5">
          <Link
            href="/dashboard"
            onClick={() => setRole('CHM')}
            className={cn(
              'text-center py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              role === 'CHM'
                ? 'btn-emerald-gradient text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            )}
          >
            CHM Supervisor
          </Link>
          <Link
            href="/field"
            onClick={() => setRole('PE')}
            className={cn(
              'text-center py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              role === 'PE'
                ? 'btn-emerald-gradient text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            )}
          >
            PE Field Kit
          </Link>
        </div>

        <nav aria-label="Primary Navigation" className="flex-1 space-y-1 overflow-y-auto pr-1">
          {desktopItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && item.href !== '/field' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-[#58D922]/25 to-[#2D6E15]/20 text-[#7CE62E] border border-[#6CE429]/30'
                    : 'text-white/75 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#6CE429]' : 'text-white/60')} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/settings"
          className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20 shrink-0">
            <Image
              src={VISUAL_ASSETS.supervisorAvatar}
              alt="Pelaiah Ngarande"
              fill
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">Pelaiah Ngarande</p>
            <p className="text-xs text-[#8BE84A] truncate">
              {role === 'CHM' ? 'CHM Supervisor' : 'PE Field Lead'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40 shrink-0" />
        </Link>
      </aside>

      {/* Mobile Bottom Tab Bar (matching 4-tab mockup: Home, Map, Reports, More) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1710]/90 backdrop-blur-xl border-t border-white/12 px-2 py-1.5"
      >
        <div className="grid grid-cols-4 items-center max-w-md mx-auto">
          {mobileTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors',
                  isActive ? 'text-[#6CE429]' : 'text-white/65 hover:text-white'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[11px] font-medium mt-1 whitespace-nowrap">{tab.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More navigation options"
            className={cn(
              'flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors',
              moreOpen ? 'text-[#6CE429]' : 'text-white/65 hover:text-white'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-1 whitespace-nowrap">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-t-3xl p-5 space-y-4 max-h-[82vh] overflow-y-auto border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SentinelLogo size={28} />
                <span className="text-base font-bold text-white">Sentinel Mbare Modules</span>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close modules menu"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[...chmNav, ...peNav.filter((p) => !chmNav.some((c) => c.href === p.href))].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium min-h-[48px]',
                    pathname === item.href
                      ? 'bg-[#58D922]/20 border-[#6CE429]/40 text-[#7CE62E]'
                      : 'bg-white/5 border-white/10 text-white/85'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
