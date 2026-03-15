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
import { Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EMICalculator() {
  const { formatINR } = useCurrency();
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(60);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const stats = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - principal;
    const interestPercent = (totalInterest / principal) * 100;

    return {
      emi: isNaN(emi) ? 0 : emi,
      totalPayable: isNaN(totalPayable) ? 0 : totalPayable,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      interestPercent: isNaN(interestPercent) ? 0 : interestPercent
    };
  }, [principal, rate, tenure]);

  const yearlyBreakdown = useMemo(() => {
    const data = [];
    const monthlyRate = rate / 12 / 100;
    let balance = principal;
    const years = Math.ceil(tenure / 12);

    for (let i = 1; i <= years; i++) {
      let principalPaidYear = 0;
      let interestPaidYear = 0;
      
      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interest = balance * monthlyRate;
        const principalPaid = stats.emi - interest;
        interestPaidYear += interest;
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
    <div className="p-6 md:p-10 space-y-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* INPUTS */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Loan Amount</Label>
              <span className="text-lg font-black text-primary">{formatINR(principal)}</span>
            </div>
            <Slider 
              value={[principal]} 
              min={10000} 
              max={5000000} 
              step={10000} 
              onValueChange={([v]) => setPrincipal(v)} 
            />
            <Input 
              type="number" 
              value={principal} 
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="h-12 text-lg font-bold"
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Interest Rate (% p.a.)</Label>
              <span className="text-lg font-black text-primary">{rate}%</span>
            </div>
            <Slider 
              value={[rate]} 
              min={1} 
              max={36} 
              step={0.5} 
              onValueChange={([v]) => setRate(v)} 
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-black uppercase text-slate-400">Tenure (Months)</Label>
              <span className="text-lg font-black text-primary">{tenure} <span className="text-xs text-slate-400">({Math.round(tenure/12)} yrs)</span></span>
            </div>
            <Slider 
              value={[tenure]} 
              min={3} 
              max={360} 
              step={3} 
              onValueChange={([v]) => setTenure(v)} 
            />
          </div>
        </div>

        {/* OUTPUTS */}
        <div className="bg-slate-50 rounded-3xl p-8 space-y-8 flex flex-col justify-center">
          <div className="text-center space-y-1">
            <div className="text-xs font-black uppercase text-slate-400 tracking-widest">Monthly EMI</div>
            <div className="text-5xl font-black text-teal-600">{formatINR(stats.emi)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Interest</div>
              <div className="text-lg font-black text-rose-500">{formatINR(stats.totalInterest)}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Payable</div>
              <div className="text-lg font-black text-slate-900">{formatINR(stats.totalPayable)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Principal ({Math.round(100 - stats.interestPercent)}%)</span>
              <span>Interest ({Math.round(stats.interestPercent)}%)</span>
            </div>
            <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex">
              <div 
                className="h-full bg-teal-500 transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white" 
                style={{ width: `${100 - stats.interestPercent}%` }}
              >
                {100 - stats.interestPercent > 20 && 'PRINCIPAL'}
              </div>
              <div 
                className="h-full bg-rose-500 transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white" 
                style={{ width: `${stats.interestPercent}%` }}
              >
                {stats.interestPercent > 20 && 'INTEREST'}
              </div>
            </div>
            <p className="text-[10px] text-center text-rose-600 font-bold">
              You pay {Math.round(stats.interestPercent)}% EXTRA on top of your loan!
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/10 flex items-start gap-4">
        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
        <p className="text-sm font-medium text-slate-600 leading-relaxed">
          {rate < 10 ? (
            "This is a relatively low interest rate — likely a home loan or secured loan."
          ) : rate <= 18 ? (
            "This is a moderate rate — typical for personal loans. Try to prepay when possible to save on interest."
          ) : (
            `Warning: This is a high interest rate. You are paying ${formatINR(stats.totalInterest)} in extra payments — consider if this purchase is truly necessary.`
          )}
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full h-12 font-bold"
          suppressHydrationWarning
        >
          {showBreakdown ? 'Hide Yearly Breakdown' : 'Show Yearly Breakdown'}
        </Button>

        {showBreakdown && (
          <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white animate-in fade-in duration-300">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead className="font-black text-xs uppercase">Year</TableHead>
                  <TableHead className="font-black text-xs uppercase">Principal Paid</TableHead>
                  <TableHead className="font-black text-xs uppercase">Interest Paid</TableHead>
                  <TableHead className="font-black text-xs uppercase">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyBreakdown.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="font-bold">Year {row.year}</TableCell>
                    <TableCell className="text-teal-600 font-medium">{formatINR(row.principal)}</TableCell>
                    <TableCell className="text-rose-500 font-medium">{formatINR(row.interest)}</TableCell>
                    <TableCell className="font-black">{formatINR(row.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
