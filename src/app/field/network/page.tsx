'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Share2 } from 'lucide-react';
import { SocialNetworkMap } from '@/components/SocialNetworkMap';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function PeerSocialMapPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header matching Screen 9 */}
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
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Social Network</h1>
            <p className="text-xs text-white/65">Drag peer nodes to organize trust clusters</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter peer or ward..."
              className="pl-10 h-10 rounded-full bg-white/10 border-white/15 text-white placeholder:text-white/50"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              toast({
                title: 'Network Snapshot Saved',
                description: 'Peer trust matrix ready for supervisor sync.',
              })
            }
            aria-label="Share network snapshot"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <SocialNetworkMap interactive={true} searchQuery={searchQuery} />
    </div>
  );
}
