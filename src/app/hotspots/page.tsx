'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { SocialNetworkMap } from '@/components/SocialNetworkMap';
import { Input } from '@/components/ui/input';

export default function SocialNetworkMapPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to Dashboard"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Social Network</h1>
            <p className="text-xs text-white/65">Community peer relationships &amp; trust clusters</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peers or ward..."
              className="pl-10 h-10 rounded-full bg-white/10 border-white/15 text-white placeholder:text-white/50"
            />
          </div>
          <Link
            href="/hotspots/monitoring"
            className="min-h-[40px] px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <MapPin className="h-3.5 w-3.5 text-[#6CE429]" />
            <span>Hotspot Map</span>
          </Link>
        </div>
      </header>

      <SocialNetworkMap interactive={true} searchQuery={searchQuery} />
    </div>
  );
}
