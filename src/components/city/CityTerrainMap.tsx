'use client';

import React from 'react';
import type { ResolvedArea } from '@/config/cityMap';
import { AreaGlyphPaths } from '@/components/city/AreaGlyph';

/**
 * SpendCity terrain map (2026-10-20): an original top-down overview — sea,
 * a coast-lined island, one biome per area, roads between them, and a lettered
 * grid. Shared by the dashboard card (static, whole map taps through) and /city
 * (markers selectable). All geometry is fixed per area id so it never shifts.
 */

type Shape = { cx: number; cy: number; rx: number; ry: number; rot: number; color: string; dark: string };
const SHAPES: Record<string, Shape> = {
  pocket_park:     { cx: 92,  cy: 305, rx: 58, ry: 52, rot: -10, color: '#8ad36f', dark: '#5da34c' },
  neighbourhood:   { cx: 165, cy: 255, rx: 62, ry: 52, rot: 15,  color: '#58a554', dark: '#3d7d3f' },
  bank_row:        { cx: 100, cy: 180, rx: 60, ry: 56, rot: 0,   color: '#dcb95c', dark: '#b3913a' },
  world_gate:      { cx: 175, cy: 100, rx: 66, ry: 48, rot: -8,  color: '#c4673f', dark: '#9a4a2a' },
  central_hall:    { cx: 275, cy: 140, rx: 62, ry: 54, rot: 12,  color: '#d5dde8', dark: '#a9b4c4' },
  market_district: { cx: 310, cy: 235, rx: 56, ry: 62, rot: 0,   color: '#e89c3a', dark: '#c27a1f' },
  academy:         { cx: 225, cy: 320, rx: 66, ry: 50, rot: 8,   color: '#34805a', dark: '#245c40' },
};
const LOCKED = '#8a95a3';
const COLS = 'ABCDEFGH';

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
  const shapes = areas.map(a => SHAPES[a.id]);
  const fill = (i: number) => (areaOpen(i) || cleared[i] ? shapes[i].color : LOCKED);
  const roadPts = areas.map((_, i) => ({ x: shapes[i].cx, y: shapes[i].cy }));

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto rounded-2xl block" role="group" aria-label="SpendCity map" style={{ background: '#0f5f7a' }}>
      <defs>
        <radialGradient id="sc-sea" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#1a8aa6" /><stop offset="100%" stopColor="#0b4a63" />
        </radialGradient>
        <filter id="sc-land" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 -0.12" result="ga" />
          <feComposite in="ga" in2="d" operator="in" result="gc" />
          <feMerge><feMergeNode in="d" /><feMergeNode in="gc" /></feMerge>
        </filter>
        <filter id="sc-shore" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" result="d" />
          <feGaussianBlur in="d" stdDeviation="5" />
        </filter>
        <filter id="sc-fog" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>

      <rect width="400" height="400" fill="url(#sc-sea)" />

      {/* shallows → sand → land */}
      <g filter="url(#sc-shore)" opacity="0.7">
        {areas.map((a, i) => <ellipse key={a.id} cx={shapes[i].cx} cy={shapes[i].cy} rx={shapes[i].rx + 20} ry={shapes[i].ry + 20} transform={`rotate(${shapes[i].rot} ${shapes[i].cx} ${shapes[i].cy})`} fill="#5ec7c9" />)}
      </g>
      <g filter="url(#sc-land)">
        {areas.map((a, i) => <ellipse key={a.id} cx={shapes[i].cx} cy={shapes[i].cy} rx={shapes[i].rx + 6} ry={shapes[i].ry + 6} transform={`rotate(${shapes[i].rot} ${shapes[i].cx} ${shapes[i].cy})`} fill="#e6d6a3" />)}
      </g>
      <g filter="url(#sc-land)">
        {areas.map((a, i) => <ellipse key={a.id} cx={shapes[i].cx} cy={shapes[i].cy} rx={shapes[i].rx} ry={shapes[i].ry} transform={`rotate(${shapes[i].rot} ${shapes[i].cx} ${shapes[i].cy})`} fill={fill(i)} stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />)}
      </g>

      {/* grid */}
      <g aria-hidden>
        {Array.from({ length: 7 }, (_, k) => (
          <g key={k}>
            <line x1={(k + 1) * 50} y1="0" x2={(k + 1) * 50} y2="400" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.6" />
            <line x1="0" y1={(k + 1) * 50} x2="400" y2={(k + 1) * 50} stroke="#fff" strokeOpacity="0.14" strokeWidth="0.6" />
          </g>
        ))}
        {Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
          <text key={`${c}${r}`} x={c * 50 + 3} y={r * 50 + 10} fontSize="8" fill="#fff" fillOpacity="0.45">{COLS[c]}{r}</text>
        )))}
      </g>

      {/* roads */}
      <g fill="none" strokeLinecap="round" aria-hidden>
        {roadPts.slice(1).map((p, i) => {
          const q = roadPts[i];
          const mx = (p.x + q.x) / 2 + (i % 2 ? 22 : -22), my = (p.y + q.y) / 2;
          return <path key={i} d={`M ${q.x} ${q.y} Q ${mx} ${my} ${p.x} ${p.y}`} stroke={cleared[i] ? '#f5c542' : '#f4ead0'} strokeOpacity={areaOpen(i + 1) ? 0.9 : 0.4} strokeWidth="3.5" strokeDasharray={areaOpen(i + 1) ? undefined : '2 7'} />;
        })}
      </g>

      {/* Gray Fog over areas that aren't clear */}
      <g filter="url(#sc-fog)" aria-hidden>
        {areas.map((a, i) => cleared[i] ? null : (
          <g key={a.id} fill="#3b4350" opacity={areaOpen(i) ? 0.3 : 0.55}>
            <circle cx={shapes[i].cx - 26} cy={shapes[i].cy - 14} r="22" />
            <circle cx={shapes[i].cx + 24} cy={shapes[i].cy - 20} r="18" />
            <circle cx={shapes[i].cx + 6} cy={shapes[i].cy + 26} r="22" />
          </g>
        ))}
      </g>

      {/* markers */}
      {areas.map((a, i) => {
        const s = shapes[i];
        const isCleared = cleared[i];
        const open = areaOpen(i);
        const isSel = a.id === selectedId;
        const ring = isCleared ? '#f5c542' : open ? '#ffffff' : '#c7ced8';
        const interactive = !!onSelect;
        return (
          <g key={a.id}
            {...(interactive ? { role: 'button', tabIndex: 0, onClick: () => onSelect!(a.id), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onSelect!(a.id); } } : {})}
            aria-label={`${a.name}: ${isCleared ? 'crime-free' : open ? 'open' : 'locked'}`}
            style={{ cursor: interactive ? 'pointer' : undefined, outline: 'none' }}>
            {isSel && <circle cx={s.cx} cy={s.cy} r="30" fill="none" stroke="#f5c542" strokeWidth="2.5" strokeDasharray="5 4" />}
            <circle cx={s.cx} cy={s.cy} r="21" fill="#10202c" stroke={ring} strokeWidth={isCleared ? 4 : 3} strokeDasharray={open ? undefined : '4 4'} />
            <g transform={`translate(${s.cx - 13} ${s.cy - 13}) scale(1.08)`} fill="none" stroke={open ? '#ffffff' : '#9aa5b3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={open ? 1 : 0.8}>
              {open ? <AreaGlyphPaths id={a.id} /> : <><rect x="5" y="11" width="14" height="9.5" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>}
            </g>
            {isCleared && (
              <g transform={`translate(${s.cx + 10} ${s.cy - 24})`}>
                <circle cx="7" cy="7" r="8" fill="#f5c542" stroke="#10202c" strokeWidth="2" />
                <path d="m3.5 7.2 2.4 2.4 4.6-4.9" fill="none" stroke="#10202c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            <text x={s.cx} y={s.cy + 40} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#fff" stroke="#10202c" strokeWidth="3.5" paintOrder="stroke" strokeLinejoin="round">{a.name.replace('The ', '')}</text>
            <text x={s.cx} y={s.cy + 54} textAnchor="middle" fontSize="11" fontWeight="700" fill={isCleared ? '#f5c542' : '#e6edf3'} stroke="#10202c" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">{progress(i)}</text>
            {showNext && i === nextAreaIdx && <text x={s.cx + 24} y={s.cy + 4} fontSize="12" fontWeight="900" fill="#f5c542" stroke="#10202c" strokeWidth="3" paintOrder="stroke">NEXT</text>}
          </g>
        );
      })}

      <text x="382" y="392" textAnchor="end" fontSize="9" fill="#fff" fillOpacity="0.6" aria-hidden>N ↑</text>
    </svg>
  );
}
