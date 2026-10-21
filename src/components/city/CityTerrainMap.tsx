'use client';

import React from 'react';
import type { ResolvedArea } from '@/config/cityMap';
import { AreaGlyphPaths } from '@/components/city/AreaGlyph';

/**
 * SpendCity map v3 (2026-10-21): a top-down city of districts. Each area is a
 * city block with rooftops and a landmark badge; streets and a river run
 * between them. REVEAL RULE: only cleared and open areas are drawn — everything
 * further on is a fogged, unnamed block, so each player's map reflects how far
 * they've got. Fixed geometry per area id; no emoji, no external assets.
 */

const BW = 110, BH = 110;
const SLOT: Record<string, [number, number]> = {
  pocket_park: [15, 275], neighbourhood: [145, 275], bank_row: [275, 275],
  world_gate: [275, 145], central_hall: [145, 145], market_district: [15, 145],
  academy: [15, 15],
};
type Theme = { base: string; roofs: [string, string]; trees?: boolean };
const THEME: Record<string, Theme> = {
  pocket_park:     { base: '#3f7a3a', roofs: ['#6fba5e', '#4f9a47'], trees: true },
  neighbourhood:   { base: '#46805a', roofs: ['#d6dccb', '#b9c6b0'] },
  bank_row:        { base: '#a8893f', roofs: ['#ecd9a0', '#d3b86e'] },
  world_gate:      { base: '#9a4f35', roofs: ['#e3ab90', '#cc886a'] },
  central_hall:    { base: '#6f7f95', roofs: ['#d9e0ea', '#b5c1d0'] },
  market_district: { base: '#b5732a', roofs: ['#f3c57f', '#e2a54e'] },
  academy:         { base: '#2f6b52', roofs: ['#a4d4b9', '#82bd9f'] },
};
const FOGGED = '#223242';
const GOLD = '#f5c542';

/** Deterministic integer hash → 0..n-1 (no floats, so SSR and client agree). */
function hv(a: number, b: number, n: number) {
  let x = (a * 374761393 + b * 668265263) | 0;
  x = (x ^ (x >>> 13)) * 1274126177;
  x = x ^ (x >>> 16);
  return Math.abs(x | 0) % n;
}

function Rooftops({ id, x, y, theme, idx }: { id: string; x: number; y: number; theme: Theme; idx: number }) {
  const out: React.ReactNode[] = [];
  const cols = 4, rows = 4, pad = 8, cw = (BW - pad * 2) / cols, ch = (BH - pad * 2) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if ((c === 1 || c === 2) && (r === 1 || r === 2)) continue; // landmark space
    const k = hv(idx * 31 + r, c + 7, 100);
    const cx = x + pad + c * cw + cw / 2, cy = y + pad + r * ch + ch / 2;
    if (theme.trees) out.push(<circle key={`${r}${c}`} cx={cx} cy={cy} r={6 + (k % 3)} fill={theme.roofs[k % 2]} />);
    else {
      const w = cw - 5 - (k % 4), h = ch - 5 - ((k >> 2) % 4);
      out.push(<rect key={`${r}${c}`} x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="2" fill={theme.roofs[k % 2]} opacity="0.92" />);
    }
  }
  return <g aria-hidden data-area={id}>{out}</g>;
}

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
  const centre = (id: string) => ({ x: SLOT[id][0] + BW / 2, y: SLOT[id][1] + 42 });

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto rounded-2xl block" role="group" aria-label="SpendCity map" style={{ background: '#1b2a38' }}>
      <defs>
        <filter id="sc-fog" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      {/* streets (the background) + centre lines */}
      <rect width="400" height="400" fill="#2b3b4b" />
      <g stroke="#4a5d70" strokeWidth="1.5" strokeDasharray="6 8" aria-hidden>
        {[135, 265].map(p => <React.Fragment key={p}><line x1={p} y1="0" x2={p} y2="400" /><line x1="0" y1={p} x2="400" y2={p} /></React.Fragment>)}
      </g>
      {/* river */}
      <path d="M 268 0 C 258 60, 278 100, 262 140 S 250 210, 266 262 S 258 340, 270 400" fill="none" stroke="#2f7fa0" strokeWidth="9" strokeLinecap="round" opacity="0.85" aria-hidden />

      {/* empty plots (areas this player never sees) become small parks */}
      {Object.entries(SLOT).filter(([id]) => !areas.some(a => a.id === id)).map(([id, [x, y]]) => (
        <g key={id} aria-hidden>
          <rect x={x} y={y} width={BW} height={BH} rx="14" fill="#2f5a45" />
          {[0, 1, 2, 3, 4].map(k => <circle key={k} cx={x + 20 + hv(k, x, 70)} cy={y + 20 + hv(k + 9, y, 70)} r="8" fill="#47805f" />)}
        </g>
      ))}
      {/* the two leftover plots */}
      {[[145, 15], [275, 15]].map(([x, y]) => (
        <g key={`${x}${y}`} aria-hidden>
          <rect x={x} y={y} width={BW} height={BH} rx="14" fill="#233443" />
        </g>
      ))}

      {/* route between revealed neighbouring areas */}
      <g fill="none" strokeLinecap="round" aria-hidden>
        {areas.slice(1).map((a, i) => {
          const prev = areas[i];
          if (!revealed(i) || !revealed(i + 1)) return null;
          const p = centre(prev.id), q = centre(a.id);
          return <path key={a.id} d={`M ${p.x} ${p.y} L ${q.x} ${q.y}`} stroke={cleared[i] ? GOLD : '#e9eef3'} strokeOpacity={cleared[i] ? 0.95 : 0.55} strokeWidth="3" strokeDasharray={cleared[i] ? undefined : '3 7'} />;
        })}
      </g>

      {areas.map((a, i) => {
        const [x, y] = SLOT[a.id];
        const th = THEME[a.id];
        const isCleared = cleared[i];
        const show = revealed(i);
        const isSel = a.id === selectedId;
        const interactive = !!onSelect && show;
        const c = centre(a.id);
        return (
          <g key={a.id}
            {...(interactive ? { role: 'button', tabIndex: 0, onClick: () => onSelect!(a.id), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onSelect!(a.id); } } : {})}
            aria-label={show ? `${a.name}: ${isCleared ? 'crime-free' : 'open'}` : 'Undiscovered area'}
            style={{ cursor: interactive ? 'pointer' : undefined, outline: 'none' }}>
            <rect x={x} y={y} width={BW} height={BH} rx="14" fill={show ? th.base : FOGGED} stroke={isCleared ? GOLD : show ? '#ffffff' : '#34495c'} strokeOpacity={show && !isCleared ? 0.35 : 1} strokeWidth={isCleared ? 3 : 1.5} />
            {show ? <Rooftops id={a.id} x={x} y={y} theme={th} idx={i + 1} /> : null}

            {show ? (
              <>
                <circle cx={c.x} cy={c.y} r="21" fill="#0f1b26" stroke={isCleared ? GOLD : '#ffffff'} strokeWidth="2.5" />
                <g transform={`translate(${c.x - 13} ${c.y - 13}) scale(1.08)`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><AreaGlyphPaths id={a.id} /></g>
                {isCleared && (
                  <g transform={`translate(${c.x + 9} ${c.y - 27})`}>
                    <circle cx="7" cy="7" r="8" fill={GOLD} />
                    <path d="m3.5 7.2 2.4 2.4 4.6-4.9" fill="none" stroke="#10202c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                <rect x={x + 5} y={y + BH - 40} width={BW - 10} height="35" rx="8" fill="#0d1822" fillOpacity="0.88" />
                <text x={x + BW / 2} y={y + BH - 24} textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#ffffff">{a.name.replace('The ', '')}</text>
                <text x={x + BW / 2} y={y + BH - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={isCleared ? GOLD : '#cfd9e3'}>{progress(i)}</text>
                {showNext && i === nextAreaIdx && (
                  <g><rect x={x + BW - 42} y={y + 5} width="37" height="17" rx="8" fill={GOLD} /><text x={x + BW - 23.5} y={y + 17.5} textAnchor="middle" fontSize="10" fontWeight="900" fill="#10202c">NEXT</text></g>
                )}
                {!isCleared && (
                  <g filter="url(#sc-fog)" fill="#44505e" opacity="0.28" aria-hidden>
                    <circle cx={x + 18} cy={y + 20} r="16" /><circle cx={x + BW - 16} cy={y + 30} r="13" />
                  </g>
                )}
                {isSel && <rect x={x - 4} y={y - 4} width={BW + 8} height={BH + 8} rx="17" fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="6 5" />}
              </>
            ) : (
              <>
                <g filter="url(#sc-fog)" fill="#6b7886" opacity="0.7" aria-hidden>
                  <circle cx={x + 30} cy={y + 34} r="24" /><circle cx={x + 80} cy={y + 40} r="22" /><circle cx={x + 55} cy={y + 80} r="26" />
                </g>
                <text x={x + BW / 2} y={y + BH / 2 + 12} textAnchor="middle" fontSize="34" fontWeight="900" fill="#c9d3de" opacity="0.7">?</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
