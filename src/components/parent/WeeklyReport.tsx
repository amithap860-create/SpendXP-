'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  X,
  TrendingUp,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface WeeklyReportProps {
  child: any;
  onClose: () => void;
}

export function WeeklyReport({ child, onClose }: WeeklyReportProps) {
  const { formatINR } = useCurrency();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <Card className="max-w-3xl w-full h-[90vh] flex flex-col border-none shadow-2xl overflow-hidden print:h-auto print:shadow-none">
        <CardHeader className="bg-primary p-8 text-white flex flex-row justify-between items-start print:bg-white print:text-black print:border-b-2 print:border-primary">
          <div className="space-y-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none print:text-primary print:border-2">WEEKLY REPORT</Badge>
            <CardTitle className="text-4xl font-black tracking-tight">{child.displayName}</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg print:text-slate-500">
              Session: Oct 24 - Oct 31, 2024
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" onClick={handlePrint} className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-8 space-y-10 print:overflow-visible">
          {/* XP Comparison */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">XP Earned</div>
                <div className="text-4xl font-black text-slate-900">4,250</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-black">
                  <ArrowUpRight className="h-5 w-5" /> 12%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">vs last week</div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Concept Mastery</div>
                <div className="text-4xl font-black text-slate-900">82%</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-black">
                  <ArrowUpRight className="h-5 w-5" /> 5%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">New High</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" /> Key Achievements
            </h3>
            <div className="grid gap-4">
              <div className="p-4 rounded-xl border-2 border-primary/10 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0"><Brain className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-bold">Most Improved: Investing</h4>
                  <p className="text-sm text-slate-600">Stock Market Sim performance increased by 40% after focusing on "Diversification" news events.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border-2 border-[#A8D5BC] bg-[#E8F5EE]/30 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#C8E8D8] flex items-center justify-center text-[#2E7D5A] shrink-0"><Zap className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-bold">New Skill Unlocked: Tax Efficiency</h4>
                  <p className="text-sm text-slate-600">Successfully completed 10 scenarios in the FinIQ Quiz regarding Income Tax brackets.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Focus */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Target className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-4">
              <Badge className="bg-primary text-white border-none">RECOMMENDED FOCUS</Badge>
              <h3 className="text-2xl font-black">Building Credit Awareness</h3>
              <p className="text-slate-300 leading-relaxed max-w-xl">
                Based on this week's data, {child.displayName} has mastered the basics of Budgeting but could benefit from practicing the <strong>Credit Score Builder</strong> game. Their accuracy on Credit-related questions is currently 40%.
              </p>
              <div className="pt-2">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Target Goal</div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[40%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 text-center border-t border-dashed">
            <p className="text-slate-400 font-bold text-sm">Generated by SpendXP Learning Engine</p>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print, .print * { visibility: visible; }
          .print { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
          nav, footer, button, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
