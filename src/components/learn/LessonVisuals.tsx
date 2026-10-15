'use client';

/**
 * Animated visuals for the lesson player (2026-10-15).
 *
 * Replaces the old static renderVisual() in LessonViewer. Every visual animates
 * in when it appears, and two of them are interactive:
 *   - 'comparison' asks the learner to PREDICT which side is bigger first
 *   - 'tug' lets the learner tap news events and watch buyers vs sellers shift
 * Reduced-motion users get the final state immediately.
 *
 * visualData conventions (all optional unless noted):
 *   bar        { items: [{label,value,color}], unit?, prefix? }
 *              legacy data (all values <= 100, no unit/prefix) renders as %.
 *   pie        { segments: [{label,value,color}] }   (values are percentages)
 *   comparison { left:{label,value,color}, right:{...}, unit?, prefix? }
 *              bars are scaled to the larger value, so any magnitude works.
 *   line       { points: [{x,y}], label? }
 *   chain      { steps: [{title, note?}] }            cause -> effect story
 *   tug        { leftLabel, rightLabel, startNote?, events: [{label, shift}] }
 */

import React, { useEffect, useState } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonCard } from '@/data/lessons';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, []);
  return reduced;
}

/** Animates 0 -> target (ease-out). Jumps straight to target if reduced motion. */
export function useCountUp(target: number, ms = 900, delay = 0) {
  const reduced = usePrefersReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduced) { setV(target); return; }
    let raf = 0;
    let t0: number | undefined;
    const to = setTimeout(() => {
      const step = (ts: number) => {
        if (t0 === undefined) t0 = ts;
        const p = Math.min(1, (ts - t0) / ms);
        setV(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [target, ms, delay, reduced]);
  return v;
}

/** Flips to true shortly after mount (or when `when` becomes true) so CSS
 *  transitions have a "from" state to animate from. */
function useGrow(when = true, delay = 60) {
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!when) { setOn(false); return; }
    if (reduced) { setOn(true); return; }
    const id = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(id);
  }, [when, delay, reduced]);
  return on;
}

export const fmtNum = (n: number) =>
  n.toLocaleString('en-IN', { maximumFractionDigits: Math.abs(n) < 100 && Math.abs(n % 1) > 0.0001 ? 1 : 0 });

function CountUp({ value, prefix = '', suffix = '', delay = 0, ms = 900 }: { value: number; prefix?: string; suffix?: string; delay?: number; ms?: number }) {
  const v = useCountUp(value, ms, delay);
  return <>{prefix}{fmtNum(v)}{suffix}</>;
}

// ───────────────────────── bar ─────────────────────────
function BarVisual({ data }: { data: any }) {
  const items: Array<{ label: string; value: number; color: string }> = data.items ?? [];
  const on = useGrow();
  const max = Math.max(...items.map(i => i.value), 1);
  const legacyPercent = !data.unit && !data.prefix && max <= 100;
  const suffix = data.unit ?? (legacyPercent ? '%' : '');
  return (
    <div className="space-y-4 py-2 w-full max-w-md mx-auto">
      {items.map((item, i) => {
        const pct = legacyPercent ? item.value : (item.value / max) * 100;
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between gap-3 text-xs font-black text-muted-foreground">
              <span className="leading-tight">{item.label}</span>
              <span className="tabular-nums shrink-0 text-foreground">
                <CountUp value={item.value} prefix={data.prefix ?? ''} suffix={suffix} delay={i * 180} />
              </span>
            </div>
            <div className="h-5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{ width: on ? `${Math.max(pct, 3)}%` : '0%', backgroundColor: item.color, transitionDelay: `${i * 180}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────── pie (donut) ─────────────────────────
function PieVisual({ data }: { data: any }) {
  const segments: Array<{ label: string; value: number; color: string }> = data.segments ?? [];
  const on = useGrow();
  let cum = 0;
  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 42 42" className="w-48 h-48 -rotate-90">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        {segments.map((s, i) => {
          const offset = -cum;
          cum += s.value;
          return (
            <circle
              key={i}
              cx="21" cy="21" r="15.9155" fill="none"
              stroke={s.color} strokeWidth="6"
              strokeDasharray={on ? `${s.value} ${100 - s.value}` : `0 100`}
              strokeDashoffset={offset}
              className="transition-[stroke-dasharray] duration-1000 ease-out"
              style={{ transitionDelay: `${i * 250}ms` }}
            />
          );
        })}
      </svg>
      <div className="flex gap-x-5 gap-y-2 mt-4 flex-wrap justify-center">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 lesson-rise" style={{ animationDelay: `${300 + i * 250}ms` }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-bold text-muted-foreground">
              {s.label} <span className="text-foreground tabular-nums"><CountUp value={s.value} suffix="%" delay={i * 250} /></span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── line ─────────────────────────
function LineVisual({ data }: { data: any }) {
  const pts: Array<{ x: number; y: number }> = data.points ?? [];
  const on = useGrow();
  if (pts.length < 2) return null;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (x: number) => 12 + ((x - minX) / Math.max(1e-9, maxX - minX)) * 176;
  const sy = (y: number) => 88 - ((y - minY) / Math.max(1e-9, maxY - minY)) * 76;
  const d = 'M ' + pts.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ');
  const area = `${d} L ${sx(maxX)},94 L ${sx(minX)},94 Z`;
  return (
    <div className="py-2 flex flex-col items-center w-full">
      <div className="w-full h-44 bg-muted/60 rounded-2xl border p-3">
        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
          <path d={area} fill="hsl(var(--primary) / 0.12)" className={cn('transition-opacity duration-1000', on ? 'opacity-100' : 'opacity-0')} />
          <path
            d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1}
            className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
          />
          {pts.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3.5" fill="hsl(var(--primary))"
              className={cn('transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')}
              style={{ transitionDelay: `${300 + (i / pts.length) * 1100}ms` }} />
          ))}
        </svg>
      </div>
      {data.label && <p className="text-xs font-bold text-muted-foreground mt-2">{data.label}</p>}
    </div>
  );
}

// ───────────────────────── comparison (predict first) ─────────────────────────
type CompareItem = { label: string; value: number; color: string };

/** Hoisted (not defined inside ComparisonVisual) so React keeps the same DOM
 *  node across renders — otherwise the height transition would restart. */
function CompareBar({ side, item, max, winner, revealed, grown, prefix, suffix }: {
  side: 'left' | 'right'; item: CompareItem; max: number; winner: 'left' | 'right';
  revealed: boolean; grown: boolean; prefix: string; suffix: string;
}) {
  const h = Math.max(10, (item.value / max) * 100);
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="h-8 text-sm font-black tabular-nums text-foreground">
        {revealed ? <CountUp value={item.value} prefix={prefix} suffix={suffix} ms={1100} /> : <span className="text-muted-foreground">?</span>}
      </div>
      <div className="h-40 w-full flex items-end justify-center">
        <div
          className={cn('w-16 rounded-t-2xl transition-[height] duration-1000 ease-out', !revealed && 'bg-muted')}
          style={{ height: grown ? `${h}%` : revealed ? '0%' : '24%', backgroundColor: revealed ? item.color : undefined }}
        />
      </div>
      <div className={cn('text-center font-black text-[11px] leading-tight text-muted-foreground px-1', revealed && side === winner && 'text-foreground')}>
        {item.label}
      </div>
    </div>
  );
}

function ComparisonVisual({ data }: { data: any }) {
  const { left, right } = data as { left: { label: string; value: number; color: string }; right: { label: string; value: number; color: string } };
  const [guess, setGuess] = useState<'left' | 'right' | null>(null);
  const on = useGrow(guess !== null, 80);
  const max = Math.max(left.value, right.value, 1);
  const winner: 'left' | 'right' = left.value >= right.value ? 'left' : 'right';
  const suffix = data.unit ?? '';
  const prefix = data.prefix ?? '';

  return (
    <div className="py-2 w-full max-w-md mx-auto">
      {guess === null && (
        <div className="lesson-rise text-center space-y-3 mb-2">
          <p className="text-sm font-black text-primary">Quick guess — which is bigger?</p>
          <div className="grid grid-cols-2 gap-3">
            {(['left', 'right'] as const).map(side => (
              <button
                key={side}
                onClick={() => setGuess(side)}
                className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 text-xs font-black text-foreground hover:bg-primary/10 hover:border-primary active:scale-95 transition-all"
              >
                {(side === 'left' ? left : right).label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-6 items-end">
        <CompareBar side="left" item={left} max={max} winner={winner} revealed={guess !== null} grown={on} prefix={prefix} suffix={suffix} />
        <CompareBar side="right" item={right} max={max} winner={winner} revealed={guess !== null} grown={on} prefix={prefix} suffix={suffix} />
      </div>
      {guess !== null && (
        <p className="lesson-pop text-center text-sm font-black mt-3" style={{ animationDelay: '900ms' }}>
          {guess === winner ? <span className="text-primary">Nice read!</span> : <span className="text-amber-600">Surprising, right? Look at the gap.</span>}
        </p>
      )}
    </div>
  );
}

// ───────────────────────── chain (cause -> effect) ─────────────────────────
function ChainVisual({ data }: { data: any }) {
  const steps: Array<{ title: string; note?: string }> = data.steps ?? [];
  return (
    <div className="py-2 w-full max-w-md mx-auto flex flex-col items-stretch">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <React.Fragment key={i}>
            <div
              className={cn(
                'lesson-rise rounded-2xl border-2 px-4 py-3 flex items-start gap-3',
                last ? 'border-primary bg-primary/10' : 'border-border bg-card'
              )}
              style={{ animationDelay: `${i * 450}ms` }}
            >
              <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0', last ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-foreground leading-snug">{s.title}</p>
                {s.note && <p className="text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">{s.note}</p>}
              </div>
            </div>
            {!last && (
              <div className="lesson-rise flex justify-center py-1 text-primary" style={{ animationDelay: `${i * 450 + 250}ms` }}>
                <ArrowDown className="h-5 w-5" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ───────────────────────── tug of war (buyers vs sellers) ─────────────────────────
function TugVisual({ data }: { data: any }) {
  const events: Array<{ label: string; shift: number }> = data.events ?? [];
  const [active, setActive] = useState<Set<number>>(new Set());
  const pos = Math.min(95, Math.max(5, 50 + [...active].reduce((a, i) => a + events[i].shift, 0)));
  const toggle = (i: number) =>
    setActive(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const verdict = pos > 58 ? { t: 'Buyers are winning → price gets pushed UP', c: 'text-primary' }
    : pos < 42 ? { t: 'Sellers are winning → price gets pushed DOWN', c: 'text-rose-600' }
    : { t: 'Evenly matched → price stays roughly steady', c: 'text-muted-foreground' };
  return (
    <div className="py-2 w-full max-w-md mx-auto space-y-4">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-wide">
        <span className="text-rose-600">{data.leftLabel ?? 'Sellers'}</span>
        <span className="text-primary">{data.rightLabel ?? 'Buyers'}</span>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-rose-300 via-muted to-emerald-300">
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white border-4 border-primary shadow-lg transition-[left] duration-700 ease-out"
          style={{ left: `${pos}%` }}
        />
      </div>
      <p className={cn('text-center text-sm font-black min-h-[1.25rem]', verdict.c)} aria-live="polite">{verdict.t}</p>
      <p className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tap news to see what it does</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {events.map((e, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              'rounded-full border-2 px-3 py-2 text-xs font-bold active:scale-95 transition-all text-left',
              active.has(i)
                ? e.shift > 0 ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-rose-50 border-rose-500 text-rose-900'
                : 'bg-card border-border text-foreground hover:border-primary'
            )}
          >
            {e.shift > 0 ? '▲ ' : '▼ '}{e.label}
          </button>
        ))}
        {active.size > 0 && (
          <button onClick={() => setActive(new Set())} className="rounded-full px-3 py-2 text-xs font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

export function LessonVisual({ card }: { card: LessonCard }) {
  const data = card.visualData ?? {};
  switch (card.visual) {
    case 'bar': return <BarVisual data={data} />;
    case 'pie': return <PieVisual data={data} />;
    case 'line': return <LineVisual data={data} />;
    case 'comparison': return <ComparisonVisual data={data} />;
    case 'chain': return <ChainVisual data={data} />;
    case 'tug': return <TugVisual data={data} />;
    default: return null;
  }
}
