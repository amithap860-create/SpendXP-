'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, TrendingUp, Wallet, Zap } from 'lucide-react';
import { formatCompact } from '@/lib/dateHelpers';

export function CompoundVisualiser() {
  const { formatINR } = useCurrency();
  const [initial, setInitial] = useState(10000);
  const [sip, setSip] = useState(1000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState('12'); // Monthly default

  const stats = useMemo(() => {
    const n = Number(freq);
    const r = rate / 100;
    const t = years;
    const P = initial;
    const PMT = sip;

    // Compound Interest with Monthly SIP Formula
    // A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
    const futureValue = P * Math.pow(1 + r / n, n * t) + 
                       PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));
    
    const totalInvested = P + (PMT * 12 * t);
    const totalReturns = futureValue - totalInvested;
    const multiplier = futureValue / totalInvested;

    // Data points for chart
    const points = [];
    const savingsPoints = [];
    for (let i = 0; i <= t; i++) {
      const val = P * Math.pow(1 + r / n, n * i) + PMT * ((Math.pow(1 + r / n, n * i) - 1) / (r / n));
      const sav = P * Math.pow(1 + 0.03 / 12, 12 * i) + PMT * ((Math.pow(1 + 0.03 / 12, 12 * i) - 1) / (0.03 / 12));
      points.push({ x: i, y: val });
      savingsPoints.push({ x: i, y: sav });
    }

    return {
      futureValue,
      totalInvested,
      totalReturns,
      multiplier,
      points,
      savingsPoints
    };
  }, [initial, sip, rate, years, freq]);

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 40;

  const maxVal = Math.max(...stats.points.map(p => p.y));
  const xScale = (chartWidth - padding * 2) / years;
  const yScale = (chartHeight - padding * 2) / maxVal;

  const getPath = (data: any[]) => {
    return data.map((p, i) => {
      const x = padding + p.x * xScale;
      const y = chartHeight - padding - p.y * yScale;
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
  };

  const getAreaPath = () => {
    const p1 = stats.points;
    const p2 = stats.savingsPoints;
    let path = `M ${padding + p1[0].x * xScale},${chartHeight - padding - p1[0].y * yScale}`;
    for (let i = 1; i < p1.length; i++) {
      path += ` L ${padding + p1[i].x * xScale},${chartHeight - padding - p1[i].y * yScale}`;
    }
    for (let i = p2.length - 1; i >= 0; i--) {
      path += ` L ${padding + p2[i].x * xScale},${chartHeight - padding - p2[i].y * yScale}`;
    }
    path += ' Z';
    return path;
  };

  const setPreset = (p: number, s: number, r: number, y: number) => {
    setInitial(p);
    setSip(s);
    setRate(r);
    setYears(y);
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase text-slate-400">Initial Investment</Label>
            <Slider value={[initial]} max={1000000} step={1000} onValueChange={([v]) => setInitial(v)} />
            <div className="text-xl font-black text-primary">{formatINR(initial)}</div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase text-slate-400">Monthly SIP</Label>
            <Slider value={[sip]} max={100000} step={500} onValueChange={([v]) => setSip(v)} />
            <div className="text-xl font-black text-primary">{formatINR(sip)}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase text-slate-400">Return Rate (%)</Label>
              <Slider value={[rate]} min={1} max={30} step={0.5} onValueChange={([v]) => setRate(v)} />
              <div className="text-xl font-black text-primary">{rate}%</div>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase text-slate-400">Period (Years)</Label>
              <Slider value={[years]} min={1} max={40} onValueChange={([v]) => setYears(v)} />
              <div className="text-xl font-black text-primary">{years} yrs</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400">Compounding Frequency</Label>
            <Select value={freq} onValueChange={setFreq}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="1">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CHART & OUTPUTS */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-900 text-white rounded-3xl col-span-2 md:col-span-1 flex flex-col justify-center text-center">
              <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Final Wealth</div>
              <div className="text-4xl font-black text-teal-400">{formatCompact(stats.futureValue)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border text-center">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Invested</div>
              <div className="text-lg font-black text-slate-900">{formatCompact(stats.totalInvested)}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <div className="text-[10px] font-black uppercase text-emerald-600 mb-1">Profit Made</div>
              <div className="text-lg font-black text-emerald-600">+{formatCompact(stats.totalReturns)}</div>
            </div>
          </div>

          <div className="relative bg-white rounded-3xl border p-4 overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              {/* Area */}
              <path d={getAreaPath()} fill="rgba(20, 184, 166, 0.1)" />
              
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(v => (
                <line 
                  key={v}
                  x1={padding} y1={padding + (chartHeight - padding * 2) * v}
                  x2={chartWidth - padding} y2={padding + (chartHeight - padding * 2) * v}
                  stroke="#f1f5f9" strokeWidth="1"
                />
              ))}

              {/* Lines */}
              <path d={getPath(stats.savingsPoints)} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              <path d={getPath(stats.points)} fill="none" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" className="animate-draw" />

              {/* Axis Labels */}
              {Array.from({ length: 5 }).map((_, i) => {
                const year = Math.round((years / 4) * i);
                const x = padding + year * xScale;
                return (
                  <text key={i} x={x} y={chartHeight - 15} fontSize="10" textAnchor="middle" className="fill-slate-400 font-bold">{year}y</text>
                );
              })}
              {[0, 0.33, 0.66, 1].map(v => (
                <text key={v} x={padding - 10} y={chartHeight - padding - (maxVal * v) * yScale} fontSize="10" textAnchor="end" alignmentBaseline="middle" className="fill-slate-400 font-bold">{formatCompact(maxVal * v)}</text>
              ))}
            </svg>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-3 h-0.5 bg-slate-300 border-dashed border-t" /> Savings Account (3%)
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-teal-500 uppercase">
                <div className="w-3 h-1 bg-teal-500 rounded-full" /> Investment ({rate}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
        <Button variant="ghost" onClick={() => setPreset(0, 500, 12, 20)} className="h-auto p-4 border rounded-2xl flex-col items-start gap-1" suppressHydrationWarning>
          <span className="text-[10px] font-black text-slate-400 uppercase">Tiny Start</span>
          <span className="font-bold">₹500/mo for 20 yrs</span>
        </Button>
        <Button variant="ghost" onClick={() => setPreset(100000, 0, 15, 15)} className="h-auto p-4 border rounded-2xl flex-col items-start gap-1" suppressHydrationWarning>
          <span className="text-[10px] font-black text-slate-400 uppercase">Lump Sum</span>
          <span className="font-bold">₹1L once for 15 yrs</span>
        </Button>
        <Button variant="ghost" onClick={() => setPreset(0, 2000, 12, 40)} className="h-auto p-4 border rounded-2xl flex-col items-start gap-1" suppressHydrationWarning>
          <span className="text-[10px] font-black text-slate-400 uppercase">Legacy Path</span>
          <span className="font-bold">₹2K/mo for 40 yrs</span>
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center gap-4">
        <Zap className="h-6 w-6 text-amber-600 shrink-0" />
        <p className="text-sm font-bold text-amber-900">
          The Rule of 72: At {rate}%, your money will roughly double every {Math.round(72/rate)} years! 
          Investing is the only way to beat inflation.
        </p>
      </div>
    </div>
  );
}
