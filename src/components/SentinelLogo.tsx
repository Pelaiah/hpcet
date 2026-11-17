'use client';

import React from 'react';

interface SentinelLogoProps {
  size?: number;
  className?: string;
}

export function SentinelLogo({ size = 48, className }: SentinelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 5L10 14V31C10 45.2 19.4 57.5 32 61C44.6 57.5 54 45.2 54 31V14L32 5Z"
        fill="rgba(14, 30, 19, 0.72)"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Center person */}
      <circle cx="32" cy="24" r="4.3" fill="#6EE727" />
      <path
        d="M24.5 41.5C24.5 35.8 27.8 32 32 32C36.2 32 39.5 35.8 39.5 41.5V47.5C37.2 49.4 34.7 50.8 32 51.7C29.3 50.8 26.8 49.4 24.5 47.5V41.5Z"
        fill="#6EE727"
      />
      {/* Left person */}
      <circle cx="21" cy="27.5" r="3.2" fill="#FFFFFF" />
      <path
        d="M15.8 41.5C15.8 37.2 18 34.2 21.3 34.2C22.4 34.2 23.4 34.6 24.3 35.3C23.4 37.3 23 39.5 23 41.8V46.2C20.2 44.3 17.7 42.8 15.8 41.5Z"
        fill="#FFFFFF"
      />
      {/* Right person */}
      <circle cx="43" cy="27.5" r="3.2" fill="#FFFFFF" />
      <path
        d="M48.2 41.5C48.2 37.2 46 34.2 42.7 34.2C41.6 34.2 40.6 34.6 39.7 35.3C40.6 37.3 41 39.5 41 41.8V46.2C43.8 44.3 46.3 42.8 48.2 41.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
