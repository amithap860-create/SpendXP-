"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Coins, 
  Brain, 
  Zap, 
  GraduationCap, 
  CircleAlert, 
  TrendingUp,
  Heart,
  Wallet,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Scenario {
  title: string;
  description: string;
  options: {
    label: string;
    impact: {
      balance?: number;
      portfolio?: number;
      liabilities?: number;
      income?: number;
      happiness?: number;
    };
    advice: string;
    projection: string;
  }[];
}

const ADVISOR_SCENARIOS: Scenario[] = [
  {
    title: "The Shiny New Gadget",
    description: "A brand new smartphone just launched. It costs $800. You really want it, but your current phone works fine.",
    options: [
      {
        label: "Buy it full price",
        impact: { balance: -800, happiness: 15 },
        advice: "Buying luxury items outright is better than debt, but it significantly reduces your liquid assets (cash).",
        projection: "In 5 years, that $800 could have been $1,200 if invested in a safe index fund."
      },
      {
        label: "Buy on Credit (Installments)",
        impact: { liabilities: 1000, happiness: 15 },
        advice: "Installment plans often include hidden interest. You're trading future income for current pleasure.",
        projection: "You'll pay $200 extra in interest over 24 months. That's money lost forever."
      },
      {
        label: "Skip it & Invest",
        impact: { portfolio: 800, happiness: -5 },
        advice: "Delayed gratification is the cornerstone of wealth. You've turned a potential outcome into a growing asset.",
        projection: "This $800 asset could grow to $2,500 by the time you're ready for college."
      }
    ]
  },
  {
    title: "Side Hustle Opportunity",
    description: "You have a chance to start a small pet-sitting business. It requires $100 for flyers and supplies, but could earn $50/week.",
    options: [
      {
        label: "Invest in the business",
        impact: { balance: -100, income: 50 },
        advice: "This is a high-return investment in yourself. You're creating a new stream of income.",
        projection: "At $50/week, you'll break even in 2 weeks. By next year, you'll have earned over $2,400."
      },
      {
        label: "Keep the cash safe",
        impact: { balance: 0 },
        advice: "Playing it safe is fine, but you're missing out on 'Opportunity Cost'—the money you *didn't* earn.",
        projection: "Your $100 stays $100. While safe, inflation might actually make it worth less in a few years."
      }
    ]
  },
  {
    title: "Unexpected Car Repair",
    description: "Your (virtual) car broke down. It costs $500 to fix. You don't have an emergency fund yet.",
    options: [
      {
        label: "Use a high-interest loan",
        impact: { liabilities: 700 },
        advice: "Emergency debt is the most dangerous kind. This is why financial advisors recommend a 3-6 month emergency fund.",
        projection: "You'll be working for weeks just to pay back the interest on this repair."
      },
      {
        label: "Sell some stocks (Assets)",
        impact: { portfolio: -500 },
        advice: "Selling assets to cover emergencies stops your compound interest. It's better than high-interest debt, though.",
        projection: "By selling now, you lose the future growth of those shares. That $500 could have been $5,000 in your 40s."
      }
    ]
  }
];

export default function GamesHub() {
  const { age, balance, portfolio, liabilities, formatValue, ageGroup, updateLiabilities } = useUser();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // Dash Game State
  const [dashTarget, setDashTarget] = useState(0);
  const [dashCurrent, setDashCurrent] = useState(0);

  // Advisor Game State
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);
  const [showAdvisorResult, setShowAdvisorResult] = useState(false);

  useEffect(() => {
    if (activeGame === 'dash') {
      setDashTarget(Math.floor(Math.random() * 10) + 1);
      setDashCurrent(0);
    }
  }, [activeGame]);

  const handleDashClick = (val: number) => {
    const next = parseFloat((dashCurrent + val).toFixed(2));
    if (next === dashTarget) {
      toast({ title: "Perfect Change! 🌟", description: "+50 XP earned." });
      setDashTarget(Math.floor(Math.random() * 15) + 1);
      setDashCurrent(0);
      setScore(s => s + 50);
    } else if (next > dashTarget) {
      toast({ title: "Too much!", variant: "destructive" });
      setDashCurrent(0);
    } else {
      setDashCurrent(next);
    }
  };

  const handleAdvisorChoice = (optionIdx: number) => {
    const scenario = ADVISOR_SCENARIOS[currentScenarioIdx];
    const option = scenario.options[optionIdx];
    
    // In a real app, we'd update the actual store here.
    // For the "simulation", we'll just track it in history.
    setSimulationHistory([...simulationHistory, {
      scenario: scenario.title,
      choice: option.label,
      advice: option.advice,
      projection: option.projection
    }]);

    if (currentScenarioIdx < ADVISOR_SCENARIOS.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
    } else {
      setShowAdvisorResult(true);
    }
    
    toast({ title: "Choice Recorded", description: "Your advisor is analyzing the impact..." });
  };

  const totalAssets = balance + portfolio.reduce((acc, curr) => acc + (curr.shares * 150), 0);
  const netWorth = totalAssets - liabilities;

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-primary">XP Games Hub</h2>
          </div>
          <p className="text-muted-foreground">Master the rules of money through simulations and challenges.</p>
        </header>

        {!activeGame ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Age 8-10 Games */}
            {age <= 12 && (
              <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => setActiveGame('dash')}>
                <div className="h-2 bg-emerald-400" />
                <CardHeader>
                  <Coins className="h-8 w-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle>Denomination Dash</CardTitle>
                  <CardDescription>Match the coins to the target! Learn money values and addition.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ages 8-10</Badge>
                </CardContent>
              </Card>
            )}

            {/* Wealth Architect: Advisor Sim */}
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/20" onClick={() => setActiveGame('advisor')}>
              <div className="h-2 bg-primary" />
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Wealth Architect</CardTitle>
                <CardDescription>A financial advisor simulator. See how lifestyle choices shape your assets and liabilities over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">All Ages • Advisor Guide</Badge>
              </CardContent>
            </Card>

            {/* Age 14+ Games */}
            {age >= 14 && (
              <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => toast({ title: "Uni-Survival Loading..." })}>
                <div className="h-2 bg-indigo-400" />
                <CardHeader>
                  <GraduationCap className="h-8 w-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle>Uni-Survival</CardTitle>
                  <CardDescription>Manage student loans, rent, and groceries. Can you make it to graduation?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Ages 14+</Badge>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-lg transition-all cursor-pointer border-none bg-white overflow-hidden group" onClick={() => window.location.href='/market'}>
              <div className="h-2 bg-slate-400" />
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Volatility Pro</CardTitle>
                <CardDescription>Master the virtual market. Experience real-time stock simulation and risk.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Teens</Badge>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => { setActiveGame(null); setShowAdvisorResult(false); setSimulationHistory([]); setCurrentScenarioIdx(0); }}>
              ← Exit Simulation
            </Button>

            {activeGame === 'dash' && (
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-emerald-50 text-center">
                  <CardTitle className="text-3xl text-emerald-700">Denomination Dash</CardTitle>
                  <CardDescription>Target: ${dashTarget}.00</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl font-black text-primary">${dashCurrent.toFixed(2)}</div>
                    <Progress value={(dashCurrent / dashTarget) * 100} className="w-full h-4" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[0.01, 0.05, 0.10, 0.25, 1, 5].map(coin => (
                      <Button 
                        key={coin} 
                        onClick={() => handleDashClick(coin)}
                        variant="outline"
                        className="h-20 text-lg font-bold flex flex-col gap-1 border-2 hover:border-emerald-500 hover:bg-emerald-50"
                      >
                        <Coins className="h-5 w-5 text-emerald-500" />
                        {coin < 1 ? `${coin * 100}¢` : `$${coin}`}
                      </Button>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full" onClick={() => setDashCurrent(0)}>Reset Current</Button>
                </CardContent>
              </Card>
            )}

            {activeGame === 'advisor' && !showAdvisorResult && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <div className="bg-primary p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wider">Active Scenario {currentScenarioIdx + 1} / {ADVISOR_SCENARIOS.length}</span>
                      </div>
                      <CardTitle className="text-2xl font-black">{ADVISOR_SCENARIOS[currentScenarioIdx].title}</CardTitle>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <p className="text-lg text-slate-700 leading-relaxed font-medium">
                        {ADVISOR_SCENARIOS[currentScenarioIdx].description}
                      </p>

                      <div className="grid gap-4">
                        {ADVISOR_SCENARIOS[currentScenarioIdx].options.map((opt, i) => (
                          <Button 
                            key={i}
                            variant="outline"
                            className="h-auto p-6 flex flex-col items-start gap-1 text-left border-2 hover:border-primary hover:bg-primary/5 transition-all group"
                            onClick={() => handleAdvisorChoice(i)}
                          >
                            <span className="font-bold text-lg group-hover:text-primary">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">Select to see advisor guidance</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader className="pb-2 border-b border-white/10">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Balance Sheet</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Total Assets</div>
                          <div className="text-2xl font-black">{formatValue(totalAssets)}</div>
                          <p className="text-[10px] text-slate-500 mt-1">Cash + Investments</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-rose-400 uppercase mb-1">Total Liabilities</div>
                          <div className="text-2xl font-black">{formatValue(liabilities)}</div>
                          <p className="text-[10px] text-slate-500 mt-1">Debts & Obligations</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="text-[10px] font-bold text-primary uppercase mb-1">Net Worth</div>
                        <div className="text-3xl font-black text-white">{formatValue(netWorth)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeGame === 'advisor' && showAdvisorResult && (
              <div className="space-y-8">
                <Card className="border-none shadow-2xl bg-white overflow-hidden">
                  <div className="bg-emerald-500 p-8 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-4xl font-black mb-2">Architect Report Complete</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">Your financial future, analyzed by SpendXP Advisor.</CardDescription>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {simulationHistory.map((item, i) => (
                        <div key={i} className="p-8 grid md:grid-cols-2 gap-8 items-start hover:bg-slate-50 transition-colors">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary">Scenario {i+1}</Badge>
                              <h4 className="font-black text-xl">{item.scenario}</h4>
                            </div>
                            <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                              <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Your Choice</span>
                              <p className="font-bold text-slate-800">{item.choice}</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 mb-1">Advisor Guidance</h5>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.advice}</p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 mb-1">Future Projection</h5>
                                <p className="text-sm text-slate-600 leading-relaxed italic">"{item.projection}"</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-12 bg-slate-50 text-center">
                       <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/20" onClick={() => { setActiveGame(null); setShowAdvisorResult(false); }}>
                          Apply Lessons to Profile
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
