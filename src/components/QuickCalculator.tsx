'use client';

import React, { useState, useCallback } from 'react';
import { Calculator, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One-tap calculator for games and quests (2026-10-07).
 *
 * Testers asked for a calculator they can use WHILE answering — FinIQ and
 * Budget Blitz only had one buried inside the Pause panel, so most players
 * never found it. This is a floating button + a NON-modal bottom panel, so
 * the question stays visible above it and the game timer keeps running
 * (deliberately: pausing for free would break the daily-challenge
 * leaderboard).
 *
 * No eval(): expressions are tokenised and evaluated with standard
 * precedence (× ÷ before + −) by evaluate() below.
 */

type Token = number | '+' | '-' | '*' | '/';

export function evaluate(expr: string): number | null {
  const src = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const raw = src.match(/\d*\.?\d+|\d+\.|[+\-*/]/g);
  if (!raw) return null;
  const tokens: Token[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    if (/^[+\-*/]$/.test(t)) {
      // Unary minus at the start or right after another operator
      const prev = tokens[tokens.length - 1];
      if (t === '-' && (prev === undefined || typeof prev === 'string')) {
        const next = raw[i + 1];
        if (next !== undefined && !/^[+\-*/]$/.test(next)) {
          tokens.push(-parseFloat(next));
          i++;
          continue;
        }
        return null;
      }
      tokens.push(t as Token);
    } else {
      tokens.push(parseFloat(t));
    }
  }
  // Must alternate number, op, number ...
  if (tokens.length % 2 === 0) return null;
  for (let i = 0; i < tokens.length; i++) {
    if ((i % 2 === 0) !== (typeof tokens[i] === 'number')) return null;
  }
  // Pass 1: * and /
  const stage: Token[] = [tokens[0]];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i] as string;
    const rhs = tokens[i + 1] as number;
    if (op === '*' || op === '/') {
      const lhs = stage.pop() as number;
      if (op === '/' && rhs === 0) return null;
      stage.push(op === '*' ? lhs * rhs : lhs / rhs);
    } else {
      stage.push(op as Token, rhs);
    }
  }
  // Pass 2: + and -
  let result = stage[0] as number;
  for (let i = 1; i < stage.length; i += 2) {
    const op = stage[i] as string;
    const rhs = stage[i + 1] as number;
    result = op === '+' ? result + rhs : result - rhs;
  }
  return Number.isFinite(result) ? result : null;
}

function formatResult(n: number): string {
  return String(parseFloat(n.toFixed(6)));
}

const KEYS = [
  'C', '⌫', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '−',
  '1', '2', '3', '+',
  '0', '.', '=',
];

export function QuickCalculator({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const press = useCallback((k: string) => {
    if (k === 'C') { setExpr(''); setResult(null); return; }
    if (k === '⌫') { setExpr(e => e.slice(0, -1)); setResult(null); return; }
    if (k === '=') {
      const v = evaluate(expr);
      if (v === null) { setResult('Error'); return; }
      const out = formatResult(v);
      setResult(out);
      setExpr(out);
      return;
    }
    if (k === '%') {
      // Turn the last number into its percentage value (50 -> 0.5)
      setExpr(e => {
        const m = e.match(/(\d*\.?\d+)$/);
        if (!m) return e;
        return e.slice(0, e.length - m[1].length) + formatResult(parseFloat(m[1]) / 100);
      });
      setResult(null);
      return;
    }
    const isOp = ['+', '−', '×', '÷'].includes(k);
    setExpr(e => {
      if (isOp) {
        if (e === '' ) return k === '−' ? '−' : e;
        // replace a trailing operator instead of stacking them
        if (/[+−×÷]$/.test(e)) return e.slice(0, -1) + k;
        return e + k;
      }
      if (k === '.') {
        const lastNum = e.split(/[+−×÷]/).pop() ?? '';
        if (lastNum.includes('.')) return e;
        return e + (lastNum === '' ? '0.' : '.');
      }
      return e + k;
    });
    setResult(null);
  }, [expr]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close calculator' : 'Open calculator'}
        aria-expanded={open}
        className={cn(
          'fixed right-4 bottom-[calc(156px+env(safe-area-inset-bottom,0px))] md:bottom-[84px] z-40',
          'h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center',
          'hover:opacity-90 transition-opacity',
          className
        )}
        suppressHydrationWarning
      >
        {open ? <X className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed right-3 left-3 sm:left-auto sm:w-72 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-[60] rounded-2xl bg-slate-900 p-3 shadow-2xl border border-white/10"
          role="dialog"
          aria-label="Calculator"
        >
          <div className="text-right font-mono bg-slate-800 rounded-lg px-3 py-2 mb-2 min-h-[56px] flex flex-col justify-end overflow-hidden">
            <div className={cn('text-white text-2xl font-bold truncate', result === 'Error' && 'text-rose-400')}>
              {expr === '' ? '0' : expr}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {KEYS.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                className={cn(
                  'h-11 rounded-xl font-bold text-base text-white transition-colors',
                  k === '=' ? 'col-span-2 bg-primary hover:opacity-90' :
                  ['+', '−', '×', '÷', '%'].includes(k) ? 'bg-primary/80 hover:bg-primary' :
                  k === 'C' ? 'bg-rose-500 hover:bg-rose-600' :
                  'bg-slate-700 hover:bg-slate-600'
                )}
                suppressHydrationWarning
              >
                {k}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/40 text-center mt-2">The timer keeps running while this is open.</p>
        </div>
      )}
    </>
  );
}
