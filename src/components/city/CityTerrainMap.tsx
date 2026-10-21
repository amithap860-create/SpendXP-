'use client';

import React from 'react';
import type { ResolvedArea } from '@/config/cityMap';
import { AreaGlyphPaths } from '@/components/city/AreaGlyph';

/**
 * SpendCity map v4 (2026-10-21): the illustrated island (public/city/spendcity-map.webp)
 * with live overlays. REVEAL RULE: only cleared and open areas are shown; every
 * other region is covered by Gray Fog with a "?" and no name, so each player's
 * map reflects how far they've got. Coordinates are in the image's 1024x1024 space.
 * If the image is ever regenerated, only POS below needs retuning.
 */

type Pos = { fog: [number, number, number, number]; pill: [number, number] };
const POS: Record<string, Pos> = {
  pocket_park:     { fog: [235, 780, 130, 105], pill: [235, 862] },
  neighbourhood:   { fog: [510, 770, 120, 105], pill: [520, 612] },
  bank_row:        { fog: [770, 715, 130, 120], pill: [770, 808] },
  world_gate:      { fog: [815, 400, 110, 140], pill: [790, 525] },
  central_hall:    { fog: [520, 375, 140, 150], pill: [520, 455] },
  market_district: { fog: [250, 470, 125, 115], pill: [250, 405] },
  academy:         { fog: [270, 195, 140, 115], pill: [265, 312] },
};
const GOLD = '#f5c542';

export function CityTerrainMap({
  areas, cleared, areaOpen, progress, nextAreaIdx = -1, showNext = false, selectedId, onSelect,
}: {
  areas: ResolvedArea[];
  cleared: boolean[];
  areaOpen: (i: number) => boolean;
  progress: (i: number) => string;
  nextAreaIdx?: number;
  showNext?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const revealed = (i: number) => cleared[i] || areaOpen(i);

  return (
    <svg viewBox="0 0 1024 1024" className="w-full h-auto rounded-2xl block" role="group" aria-label="SpendCity map" style={{ background: '#0e4a5c' }}>
      <defs>
        <filter id="sc-fog" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22" /></filter>
        <filter id="sc-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="sc-pill" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.5" /></filter>
      </defs>
      <image href="/city/spendcity-map.webp" x="0" y="0" width="1024" height="1024" />

      {areas.map((a, i) => {
        const pos = POS[a.id];
        if (!pos) return null;
        const show = revealed(i);
        const [fx, fy, rx, ry] = pos.fog;
        if (show) {
          // villain still holds an open area: a thin haze at its edge
          return cleared[i] ? null : (
            <g key={a.id} filter="url(#sc-soft)" fill="#5b6672" opacity="0.28" aria-hidden>
              <ellipse cx={fx - rx * 0.55} cy={fy - ry * 0.6} rx={rx * 0.35} ry={ry * 0.3} />
              <ellipse cx={fx + rx * 0.6} cy={fy + ry * 0.55} rx={rx * 0.35} ry={ry * 0.3} />
            </g>
          );
        }
        return (
          <g key={a.id} aria-label="Undiscovered area">
            <g filter="url(#sc-fog)" aria-hidden>
              <ellipse cx={fx} cy={fy} rx={rx} ry={ry} fill="#1f2b38" opacity="0.93" />
              <ellipse cx={fx - rx * 0.45} cy={fy - ry * 0.35} rx={rx * 0.55} ry={ry * 0.5} fill="#7b8794" opacity="0.8" />
              <ellipse cx={fx + rx * 0.4} cy={fy + ry * 0.3} rx={rx * 0.6} ry={ry * 0.5} fill="#8e99a6" opacity="0.7" />
            </g>
            <text x={fx} y={fy + 34} textAnchor="middle" fontSize="100" fontWeight="900" fill="#e4eaf0" opacity="0.85">?</text>
          </g>
        );
      })}

      {areas.map((a, i) => {
        const pos = POS[a.id];
        if (!pos || !revealed(i)) return null;
        const [px, py] = pos.pill;
        const isCleared = cleared[i];
        const isSel = a.id === selectedId;
        const interactive = !!onSelect;
        const name = a.name.replace('The ', '');
        const w = 112 + name.length * 17;
        const h = 82;
        return (
          <g key={a.id}
            {...(interactive ? { role: 'button', tabIndex: 0, onClick: () => onSelect!(a.id), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onSelect!(a.id); } } : {})}
            aria-label={`${a.name}: ${isCleared ? 'crime-free' : 'open'}`}
            style={{ cursor: interactive ? 'pointer' : undefined, outline: 'none' }}>
            {isSel && <rect x={px - w / 2 - 10} y={py - h / 2 - 10} width={w + 20} height={h + 20} rx="30" fill="none" stroke={GOLD} strokeWidth="6" strokeDasharray="16 12" />}
            <rect x={px - w / 2} y={py - h / 2} width={w} height={h} rx="22" fill="#0d1822" fillOpacity="0.92" stroke={isCleared ? GOLD : '#ffffff'} strokeOpacity={isCleared ? 1 : 0.5} strokeWidth={isCleared ? 5 : 3} filter="url(#sc-pill)" />
            <g transform={`translate(${px - w / 2 + 10} ${py - 31}) scale(2.6)`} fill="none" stroke={isCleared ? GOLD : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <AreaGlyphPaths id={a.id} />
            </g>
            <text x={px - w / 2 + 84} y={py - 4} fontSize="30" fontWeight="800" fill="#ffffff">{name}</text>
            <text x={px - w / 2 + 84} y={py + 27} fontSize="26" fontWeight="700" fill={isCleared ? GOLD : '#cfd9e3'}>{progress(i)}</text>
            {isCleared && (
              <g transform={`translate(${px + w / 2 - 24} ${py - h / 2 - 22})`}>
                <circle cx="22" cy="22" r="22" fill={GOLD} stroke="#0d1822" strokeWidth="4" />
                <path d="m11 22.5 8 8 15-16" fill="none" stroke="#0d1822" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            {showNext && i === nextAreaIdx && (
              <g><rect x={px - 52} y={py - h / 2 - 40} width="104" height="34" rx="17" fill={GOLD} /><text x={px} y={py - h / 2 - 15} textAnchor="middle" fontSize="24" fontWeight="900" fill="#10202c">NEXT</text></g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
