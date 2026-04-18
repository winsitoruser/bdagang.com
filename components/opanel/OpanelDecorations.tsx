import React, { useId } from 'react';

/** Pola titik halus untuk latar konten */
export function OpanelDotPattern({ className = '' }: { className?: string }) {
  const rid = useId().replace(/:/g, '');
  const pid = `opanel-dots-${rid}`;
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full text-slate-400/25 ${className}`}
      aria-hidden
    >
      <defs>
        <pattern id={pid} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/** Kurva dekoratif untuk hero / kartu */
export function OpanelHeroOrbs({ className = '' }: { className?: string }) {
  return (
    <svg className={`pointer-events-none absolute overflow-visible ${className}`} aria-hidden viewBox="0 0 400 200">
      <defs>
        <linearGradient id="opanel-orb-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="opanel-orb-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="320" cy="40" r="120" fill="url(#opanel-orb-a)" />
      <circle cx="60" cy="160" r="90" fill="url(#opanel-orb-b)" />
    </svg>
  );
}

/** Ilustrasi vektor ringan: garpu & sendok stilisasi */
export function OpanelRestoMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 8v20c0 4 2 8 6 10M22 8c-4 0-8 3-8 8v6M30 38v18M18 38h24"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M46 10c0 6-2 10-2 14v32M50 10v14M42 10v14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** Gelombang bawah hero */
export function OpanelWaveDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute -bottom-px left-0 w-full text-white ${className}`}
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,24 C360,64 720,0 1080,20 C1260,30 1380,28 1440,22 L1440,48 L0,48 Z"
      />
    </svg>
  );
}
