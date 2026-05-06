'use client';

import React, { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SWPCalculator() {
  const { formatValue, formatCompact } = useCurrency();
  const [corpus, setCorpus] = useState(1000000);
  const [withdrawal, setWithdrawal] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);

  const results = useMemo(() => {
    const safeCorpus = Math.max(0, corpus || 0);
    const safeW = Math.max(0, withdrawal || 0);
    const safeR = Math.max(0, rate || 0);
    const safeYears = Math.max(1, years || 1);
    const months = safeYears * 12;
    const monthlyRate = safeR / 12 / 100;

    let remaining = safeCorpus;
    let monthsLast = 0;
    let totalWithdrawn = 0;

    for (let m = 1; m <= months; m++) {
      if (remaining <= 0) break;
      const growth = monthlyRate === 0 ? 0 : remaining * monthlyRate;
      remaining = remaining + growth - safeW;
      totalWithdrawn += safeW;
      monthsLast = m;
      if (remaining <= 0) {
        remaining = 0;
        break;
      }
    }

    const corpusExhausted = remaining <= 0 && monthsLast < months;
    const exhaustedAt = corpusExhausted ? monthsLast : null;

    return {
      remaining: Math.max(0, remaining),
      totalWithdrawn,
      monthsLast,
      corpusExhausted,
      exhaustedAt,
    };
  }, [corpus, withdrawal, rate, years]);

  const sustainabilityPct = results.corpusExhausted
    ? Math.round((results.exhaustedAt! / (years * 12)) * 100)
    : 100;

  const sustainabilityColor = sustainabilityPct >= 100
    ? 'text-primary'
    : sustainabilityPct >= 60
    ? 'text-[#2E7D5A]'
    : 'text-rose-600';

  return (
    <div className="p-6 md:p-10 space-y-10">

      {/* What is SWP */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-sm font-black text-slate-900">What is a Systematic Withdrawal Plan (SWP)?</p>
          <p className="text-xs text-slate-700 leading-relaxed">
            A SWP lets you withdraw a fixed amount from your investment corpus every month, like a self-managed pension.
            Your remaining money keeps growing at the fund's return rate, so the corpus lasts longer than a simple savings account.
            It is ideal for retirees, people on sabbatical, or anyone who needs regular income from their investments without selling everything at once.
          </p>
          <p className="text-xs text-slate-600 font-semibold">Example: ₹50L corpus at 8% return → ₹25,000/month withdrawal can sustain for 35+ years.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* INPUTS */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Starting Corpus</Label>
              <span className="text-lg font-black text-primary">{formatCompact(corpus)}</span>
            </div>
            <Slider value={[corpus]} min={100000} max={10000000} step={100000} onValueChange={([v]) => setCorpus(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Monthly Withdrawal</Label>
              <span className="text-lg font-black text-primary">{formatValue(withdrawal)}</span>
            </div>
            <Slider value={[withdrawal]} min={1000} max={100000} step={1000} onValueChange={([v]) => setWithdrawal(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Expected Return Rate</Label>
              <span className="text-lg font-black text-primary">{rate}% p.a.</span>
            </div>
            <Slider value={[rate]} min={0} max={20} step={0.5} onValueChange={([v]) => setRate(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Withdrawal Period</Label>
              <span className="text-lg font-black text-primary">{years} years</span>
            </div>
            <Slider value={[years]} min={1} max={40} onValueChange={([v]) => setYears(v)} />
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="bg-blue-50 rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="text-xs font-black uppercase text-primary tracking-widest">
              {results.corpusExhausted ? 'Corpus Runs Out In' : 'Remaining Corpus After ' + years + ' Years'}
            </div>
            {results.corpusExhausted ? (
              <div className="text-5xl font-black text-rose-600">
                {Math.floor(results.exhaustedAt! / 12)}y {results.exhaustedAt! % 12}m
              </div>
            ) : (
              <div className="text-5xl font-black text-primary">{formatCompact(results.remaining)}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Withdrawn</div>
              <div className="text-lg font-black text-slate-900">{formatCompact(results.totalWithdrawn)}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Monthly Draw</div>
              <div className="text-lg font-black text-slate-900">{formatValue(withdrawal)}</div>
            </div>
          </div>

          {/* Sustainability bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-500">Plan Sustainability</span>
              <span className={cn('text-sm font-black', sustainabilityColor)}>
                {results.corpusExhausted ? `${sustainabilityPct}% of period` : 'Fully Sustained ✓'}
              </span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden border border-blue-100">
              <div
                className={cn('h-full rounded-full transition-all duration-700',
                  sustainabilityPct >= 100 ? 'bg-primary' : sustainabilityPct >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                )}
                style={{ width: `${Math.min(100, sustainabilityPct)}%` }}
              />
            </div>
          </div>

          {results.corpusExhausted && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-medium">
              ⚠️ At this withdrawal rate, your corpus runs out before the end of the period. Try reducing the monthly withdrawal or increasing the return rate.
            </div>
          )}
          {!results.corpusExhausted && (
            <div className="p-4 bg-[#E8F5EE] rounded-2xl border border-[#A8D5BC] text-xs text-[#1A1F2E] font-medium">
              ✓ Your corpus sustains {years} years of withdrawals and still has {formatCompact(results.remaining)} remaining.
            </div>
          )}
        </div>
      </div>

      <footer className="pt-6 border-t text-[10px] text-slate-400 font-medium italic text-center">
        Returns are assumed to be constant. Real fund returns vary. Consult a financial advisor before planning withdrawals from real investments.
      </footer>
    </div>
  );
}
