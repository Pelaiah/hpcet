'use client';

import React from 'react';
import Image from 'next/image';
import { VISUAL_ASSETS } from '@/lib/visual-assets';

export function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <Image
        src={VISUAL_ASSETS.mbareHillsBg}
        alt=""
        fill
        priority
        referrerPolicy="no-referrer"
        className="object-cover scale-105 blur-[18px] brightness-[0.42] saturate-[1.15]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07110b]/70 via-[#0b1b11]/55 to-[#060f09]/90" />
    </div>
  );
}
