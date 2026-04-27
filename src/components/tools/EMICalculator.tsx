'use client';

import React, { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EMICalculator() {
  const { formatValue } = useCurrency();
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(60);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const stats = useMemo(() => {
    // Guard against invalid inputs
    const safePrincipal = Math.max(0, principal || 0);
    const safeTenure = Math.max(1, tenure || 1);
    const safeRate = Math.max(0, rate || 0);

    let emi: number;
    if (safeRate === 0) {
      // 0% interest: equal principal payments each month
      emi = safePrincipal / safeTenure;
    } else {
      const monthlyRate = safeRate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, safeTenure);
      emi = (safePrincipal * monthlyRate * factor) / (factor - 1);
    }

    const totalPayable = emi * safeTenure;
    const totalInterest = Math.max(0, totalPayable - safePrincipal);
    const interestPercent = safePrincipal > 0 ? (totalInterest / safePrincipal) * 100 : 0;

    return {
      emi: isFinite(emi) ? emi : 0,
      totalPayable: isFinite(totalPayable) ? totalPayable : 0,
      totalInterest: isFinite(totalInterest) ? totalInterest : 0,
      interestPercent: isFinite(interestPercent) ? interestPercent : 0,
    };
  }, [principal, rate, tenure]);

  const yearlyBreakdown = useMemo(() => {
    const data = [];
    const safePrincipal = Math.max(0, principal || 0);
    const safeTenure = Math.max(1, tenure || 1);
    const safeRate = Math.max(0, rate || 0);
    const monthlyRate = safeRate / 12 / 100;
    let balance = safePrincipal;
    const years = Math.ceil(safeTenure / 12);

    for (let i = 1; i <= years; i++) {
      let principalPaidYear = 0;
      let interestPaidYear = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interest = balance * monthlyRate;
        const principalPaid = Math.max(0, stats.emi - interest);
        interestPaidYear += Math.max(0, interest);
        principalPaidYear += principalPaid;
        balance -= principalPaid;
      }

      data.push({
        year: i,
        principal: principalPaidYear,
        interest: interestPaidYear,
        balance: Math.max(0, balance)
      });
    }
    return data;
  }, [principal, rate, tenure, stats.emi]);

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* INPUTS */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] md:text-xs font-black uppercase text-slate-400">Loan Amount</Label>
              <span className="text-base md:text-lg font-black text-primary">{formatValue(principal)}</span>
            </div>
            <Slider 
              value={[principal]} 
              min={10000} 
              max={5000000} 
              step={10000} 
              onValueChange={([v]) => setPrincipal(v)} 
              className="py-4 touch-pan-x"
            />
            <Input 
              type="number" 
              value={principal} 
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="h-12 text-base md:text-lg font-bold bg-slate-50 border-none"
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] md:text-xs font-black uppercase text-slate-400">Rate (% p.a.)</Label>
              <span className="text-base md:text-lg font-black text-primary">{rate}%</span>
            </div>
            <Slider 
              value={[rate]} 
              min={1} 
              max={36} 
              step={0.5} 
              onValueChange={([v]) => setRate(v)} 
              className="py-4 touch-pan-x"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] md:text-xs font-black uppercase text-slate-400">Tenure (Months)</Label>
              <span className="text-base md:text-lg font-black text-primary">{tenure} <span className="text-xs text-slate-400">({Math.round(tenure/12)}y)</span></span>
            </div>
            <Slider 
              value={[tenure]} 
              min={3} 
              max={360} 
              step={3} 
              onValueChange={([v]) => setTenure(v)} 
              className="py-4 touch-pan-x"
            />
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 space-y-6 md:space-y-8 flex flex-col justify-center">
          <div className="text-center space-y-1">
            <div className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-widest">Monthly EMI</div>
            <div className="text-4xl md:text-5xl font-black text-primary">{formatValue(stats.emi)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Total Interest</div>
              <div className="text-base md:text-lg font-black text-rose-500">{formatValue(stats.totalInterest)}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Total Payable</div>
              <div className="text-base md:text-lg font-black text-slate-900">{formatValue(stats.totalPayable)}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase text-slate-400">
              <span>Principal ({Math.round(100 - stats.interestPercent)}%)</span>
              <span>Interest ({Math.round(stats.interestPercent)}%)</span>
            </div>
            <div className="h-8 md:h-10 w-full bg-slate-200 rounded-xl overflow-hidden flex">
              <div 
                className="h-full bg-primary transition-all duration-500 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white" 
                style={{ width: `${100 - stats.interestPercent}%` }}
              >
                {100 - stats.interestPercent > 25 && 'PRINCIPAL'}
              </div>
              <div 
                className="h-full bg-rose-500 transition-all duration-500 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white" 
                style={{ width: `${stats.interestPercent}%` }}
              >
                {stats.interestPercent > 25 && 'INTEREST'}
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-center text-rose-600 font-bold">
              You pay {Math.round(stats.interestPercent)}% EXTRA on top of your loan!
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 rounded-3xl bg-primary/5 border-2 border-primary/10 flex items-start gap-4">
        <Info className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 shrink-0" />
        <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
          {rate < 10 ? (
            "This is a relatively low interest rate — likely a home loan or secured loan."
          ) : rate <= 18 ? (
            "This is a moderate rate — typical for personal loans. Try to prepay when possible to save on interest."
          ) : (
            `Warning: This is a high interest rate. You are paying ${formatValue(stats.totalInterest)} in extra interest — consider if this is truly worth it.`
          )}
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full h-12 md:h-14 font-black uppercase text-[10px] tracking-widest border-2"
          suppressHydrationWarning
        >
          {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
        </Button>

        {showBreakdown && (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white animate-in fade-in duration-300">
            <div className="min-w-[400px]">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-black text-[9px] uppercase">Year</TableHead>
                    <TableHead className="font-black text-[9px] uppercase">Principal</TableHead>
                    <TableHead className="font-black text-[9px] uppercase">Interest</TableHead>
                    <TableHead className="font-black text-[9px] uppercase">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyBreakdown.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell className="font-bold text-xs md:text-sm">Year {row.year}</TableCell>
                      <TableCell className="text-primary font-bold text-xs md:text-sm">{formatValue(row.principal)}</TableCell>
                      <TableCell className="text-rose-500 font-bold text-xs md:text-sm">{formatValue(row.interest)}</TableCell>
                      <TableCell className="font-black text-xs md:text-sm">{formatValue(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}