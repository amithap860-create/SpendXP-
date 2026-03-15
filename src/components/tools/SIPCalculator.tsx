'use client';

import React, { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatCompact } from '@/lib/dateHelpers';
import { TrendingUp, Coins, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SIPCalculator() {
  const { formatINR } = useCurrency();
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
      // Step-up logic: Increase SIP amount every 12 months
      for (let year = 1; year <= t; year++) {
        const remainingMonths = (t - year + 1) * 12;
        // This is a simplified step-up calculation
        const yearMonths = 12;
        const yearGrowthFactor = Math.pow(1 + monthlyRate, months - (year - 1) * 12);
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
              <span className="text-lg font-black text-primary">{formatINR(sip)}</span>
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
            <div className="text-2xl font-black">Every ₹1 invested became ₹{(results.corpus / results.invested).toFixed(1)}</div>
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

      <div className="space-y-6">
        <h4 className="text-lg font-black flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Potential Outcomes Matrix
        </h4>
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-black text-xs uppercase text-slate-400">Return Rate</TableHead>
                <TableHead className="font-black text-xs uppercase">10 Years</TableHead>
                <TableHead className="font-black text-xs uppercase">20 Years</TableHead>
                <TableHead className="font-black text-xs uppercase">30 Years</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[8, 12, 15].map(r => (
                <TableRow key={r}>
                  <TableCell className={cn("font-black", r === rate ? "text-primary" : "text-slate-400")}>
                    {r === 8 ? 'Conservative (8%)' : r === 12 ? 'Moderate (12%)' : 'Aggressive (15%)'}
                  </TableCell>
                  {[10, 20, 30].map(y => {
                    const c = calculateSIP(sip, r, y, isStepUp ? stepUpRate : 0).corpus;
                    return (
                      <TableCell key={y} className={cn("font-bold text-lg", r === rate && y === years && "bg-primary/10 text-primary")}>
                        {formatCompact(c)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <footer className="pt-6 border-t text-[10px] text-slate-400 font-medium italic text-center">
        Past performance is not a guarantee of future returns. These calculations are for educational purposes only. 
        Consult a SEBI-registered financial advisor before investing real money.
      </footer>
    </div>
  );
}
