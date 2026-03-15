'use client';

import React, { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SIPCalculator() {
  const { formatValue, formatCompact } = useCurrency();
  const [sip, setSip] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [isStepUp, setIsStepUp] = useState(false);
  const [stepUpRate, setStepUpRate] = useState(10);

  const calculateSIP = (amount: number, r: number, t: number, stepUp = 0) => {
    const monthlyRate = r / 12 / 100;
    const months = t * 12;
    let totalCorpus = 0;
    let currentSip = amount;
    let totalInvested = 0;

    if (stepUp === 0) {
      totalCorpus = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      totalInvested = amount * months;
    } else {
      for (let year = 1; year <= t; year++) {
        const yearMonths = 12;
        const yearContribution = currentSip * ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate) * (1 + monthlyRate) * Math.pow(1 + monthlyRate, (t - year) * 12);
        totalCorpus += yearContribution;
        totalInvested += currentSip * 12;
        currentSip = currentSip * (1 + stepUp / 100);
      }
    }

    return { corpus: totalCorpus, invested: totalInvested };
  };

  const results = useMemo(() => calculateSIP(sip, rate, years, isStepUp ? stepUpRate : 0), [sip, rate, years, isStepUp, stepUpRate]);
  const normalResults = useMemo(() => calculateSIP(sip, rate, years, 0), [sip, rate, years]);

  const benchmark = useMemo(() => {
    if (rate <= 5) return "Fixed Deposit";
    if (rate <= 8) return "Debt Fund";
    if (rate <= 12) return "Balanced Fund";
    if (rate <= 15) return "Equity Fund (Nifty 50)";
    if (rate <= 20) return "Small Cap Fund";
    return "High Risk / Speculative";
  }, [rate]);

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* INPUTS */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Monthly SIP</Label>
              <span className="text-lg font-black text-primary">{formatValue(sip)}</span>
            </div>
            <Slider value={[sip]} min={100} max={100000} step={500} onValueChange={([v]) => setSip(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Return Rate: {benchmark}</Label>
              <span className="text-lg font-black text-primary">{rate}%</span>
            </div>
            <Slider value={[rate]} min={1} max={30} step={0.5} onValueChange={([v]) => setRate(v)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Time Period</Label>
              <span className="text-lg font-black text-primary">{years} yrs</span>
            </div>
            <Slider value={[years]} min={1} max={40} onValueChange={([v]) => setYears(v)} />
          </div>

          <div className="pt-6 border-t space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Annual Step-Up</Label>
                <p className="text-xs text-slate-400 font-medium italic">Increase my investment as I earn more</p>
              </div>
              <Switch checked={isStepUp} onCheckedChange={setIsStepUp} suppressHydrationWarning />
            </div>

            {isStepUp && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                  <span>Increase by</span>
                  <span>{stepUpRate}% / year</span>
                </div>
                <Slider value={[stepUpRate]} min={1} max={20} onValueChange={([v]) => setStepUpRate(v)} />
              </div>
            )}
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="bg-indigo-50 rounded-3xl p-8 space-y-8">
          <div className="text-center space-y-1">
            <div className="text-xs font-black uppercase text-indigo-400 tracking-widest">Total Value (Corpus)</div>
            <div className="text-6xl font-black text-indigo-600">{formatCompact(results.corpus)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Invested</div>
              <div className="text-lg font-black text-slate-900">{formatCompact(results.invested)}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Wealth Gain</div>
              <div className="text-lg font-black text-emerald-600">+{formatCompact(results.corpus - results.invested)}</div>
            </div>
          </div>

          <div className="p-6 bg-indigo-600 rounded-2xl text-white text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Wealth Multiplier</p>
            <div className="text-2xl font-black">Every unit invested became {(results.corpus / results.invested).toFixed(1)} units</div>
          </div>

          {isStepUp && (
            <div className="p-4 bg-white/50 rounded-xl border border-indigo-200 flex items-center gap-3">
              <Zap className="h-5 w-5 text-indigo-600" />
              <p className="text-xs font-bold text-indigo-900 italic">
                Stepping up adds an extra {formatCompact(results.corpus - normalResults.corpus)} to your final wealth!
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="pt-6 border-t text-[10px] text-slate-400 font-medium italic text-center">
        Past performance is not a guarantee of future returns. These calculations are for educational purposes only. 
        Consult a qualified financial advisor before investing real money.
      </footer>
    </div>
  );
}
