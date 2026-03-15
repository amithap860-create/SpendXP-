"use client"

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { BudgetBlitz } from '@/components/games/BudgetBlitz';
import { FinIQQuiz } from '@/components/games/FinIQQuiz';
import { MoneyMaze } from '@/components/games/MoneyMaze';
import { 
  Gamepad2, 
  Zap, 
  GraduationCap, 
  ShieldCheck,
  Calendar,
  Sparkles,
  Calculator,
  Info,
  Lock,
  ArrowRight,
  Landmark,
  BadgePercent,
  TrendingUp,
  FileText,
  HeartPulse,
  ShoppingBag,
  Brain,
  Trophy,
  Puzzle
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
        impact: { balance: -800 },
        advice: "Buying luxury items outright is better than debt, but it significantly reduces your liquid assets.",
        projection: "In 5 years, that $800 could have been $1,200 if invested."
      },
      {
        label: "Buy on Credit",
        impact: { liabilities: 1000 },
        advice: "Installment plans often include hidden interest. You're trading future income for current pleasure.",
        projection: "You'll pay $200 extra in interest over 24 months."
      },
      {
        label: "Skip it & Invest",
        impact: { portfolio: 800 },
        advice: "Delayed gratification is the cornerstone of wealth.",
        projection: "This $800 asset could grow to $2,500 by the time you're ready for college."
      }
    ]
  },
  {
    title: "Side Hustle Opportunity",
    description: "You have a chance to start a small pet-sitting business. It requires $100 for supplies, but could earn $50/week.",
    options: [
      {
        label: "Invest in the business",
        impact: { balance: -100, income: 50 },
        advice: "This is a high-return investment in yourself.",
        projection: "At $50/week, you'll break even in 2 weeks. By next year, you'll have earned over $2,400."
      },
      {
        label: "Keep the cash safe",
        impact: { balance: 0 },
        advice: "Playing it safe is fine, but you're missing out on 'Opportunity Cost'.",
        projection: "Your $100 stays $100. Inflation might actually make it worth less over time."
      }
    ]
  }
];

const PRO_SCENARIOS: Scenario[] = [
  {
    title: "Tax Season Survival",
    description: "You just landed your first internship paying $1,000/month. You notice your paycheck is actually only $850.",
    options: [
      {
        label: "Research Tax Brackets",
        impact: { balance: 0 },
        advice: "Understanding taxes helps you calculate your 'Take-Home Pay' correctly before spending.",
        projection: "You'll never be surprised by a tax bill again."
      },
      {
        label: "Ignore & Complain",
        impact: { balance: -50 },
        advice: "Ignorance can lead to fines later if you don't file your taxes properly.",
        projection: "Late fees could cost you hundreds in the future."
      }
    ]
  },
  {
    title: "The Insurance Choice",
    description: "You're renting your first apartment. Renter's insurance is $15/month. You're on a tight budget.",
    options: [
      {
        label: "Buy Insurance",
        impact: { balance: -15 },
        advice: "Insurance is paying a small amount now to avoid a catastrophic loss later.",
        projection: "If a pipe bursts, your $2,000 laptop is covered."
      },
      {
        label: "Risk it",
        impact: { balance: 0 },
        advice: "This is a gamble. One accident could wipe out all your savings.",
        projection: "A single break-in could put you in major debt."
      }
    ]
  }
];

export default function GamesHub() {
  const { ageGroup, formatValue, completeTask } = useUser();
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Advisor Game State
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);
  const [showAdvisorResult, setShowAdvisorResult] = useState(false);

  // Loan Sim State
  const [loanPrincipal, setLoanPrincipal] = useState(1000);
  const [loanRate, setLoanRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(12);

  const calculateMonthlyPayment = () => {
    const monthlyRate = loanRate / 100 / 12;
    if (monthlyRate === 0) return loanPrincipal / loanTerm;
    return (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPaid = monthlyPayment * loanTerm;
  const totalInterest = totalPaid - loanPrincipal;

  const handleAdvisorChoice = (optionIdx: number) => {
    const scenarioList = activeGame === 'pro' ? PRO_SCENARIOS : ADVISOR_SCENARIOS;
    const scenario = scenarioList[currentScenarioIdx];
    const option = scenario.options[optionIdx];
    
    setSimulationHistory([...simulationHistory, {
      scenario: scenario.title,
      choice: option.label,
      advice: option.advice,
      projection: option.projection
    }]);

    if (currentScenarioIdx < scenarioList.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
    } else {
      setShowAdvisorResult(true);
      if (activeGame === 'pro') completeTask('game-pro-sim');
      else completeTask('game-advisor');
    }
    
    toast({ title: "Choice Recorded" });
  };

  const getLoanContextTitle = () => {
    if (ageGroup === '8-11') return "Borrowing for a Bike";
    if (ageGroup === '11-15') return "Game Console Installments";
    return "Car Loan & Credit Simulator";
  };

  const getLoanContextDesc = () => {
    if (ageGroup === '8-11') return "Learn how 'Interest' makes a $500 bike cost more if you pay slowly.";
    if (ageGroup === '11-15') return "See how long it takes to pay off a $1,000 PC with different interest rates.";
    return "Master APR, principal, and terms. See the true cost of credit cards and auto loans.";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Gamepad2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">XP Games Hub</h2>
                <p className="text-muted-foreground">Master money through simulations and arcade challenges.</p>
              </div>
            </div>
            {!activeGame && (
              <Button onClick={() => setActiveGame('dailyIQ')} className="gap-2 bg-accent hover:bg-accent/90 h-12 px-6 rounded-xl shadow-lg shadow-accent/20">
                <Zap className="h-5 w-5" />
                Daily Challenge
              </Button>
            )}
          </div>
        </header>

        {!activeGame ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('blitz')}>
              <div className="h-3 bg-emerald-500" />
              <CardHeader>
                <ShoppingBag className="h-10 w-10 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Budget Blitz</CardTitle>
                <CardDescription className="text-sm">Arcade sorting game. Categorise needs, wants, and savings at lightning speed!</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-emerald-100 text-emerald-700">Arcade Action</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('finIQ')}>
              <div className="h-3 bg-primary" />
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">FinIQ Quiz</CardTitle>
                <CardDescription className="text-sm">Practice real-life scenario questions tailored to your age and level.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary/10 text-primary">Scenario Based</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('maze')}>
              <div className="h-3 bg-indigo-500" />
              <CardHeader>
                <Puzzle className="h-10 w-10 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Money Maze</CardTitle>
                <CardDescription className="text-sm">Logic puzzles for debt payoff and investment portfolio building.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-indigo-50 text-indigo-600">Strategy Engine</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('advisor')}>
              <div className="h-3 bg-primary" />
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">Wealth Architect</CardTitle>
                <CardDescription className="text-sm">Financial advisor simulator. See how lifestyle choices shape your net worth.</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary/10 text-primary">Strategic Sim</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('loan')}>
              <div className="h-3 bg-accent" />
              <CardHeader>
                <Landmark className="h-10 w-10 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-2xl">The Loan Lab</CardTitle>
                <CardDescription className="text-sm">{getLoanContextDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-accent/10 text-accent">Interest Sim</Badge>
              </CardContent>
            </Card>

            {ageGroup === '16-20' ? (
              <Card className="hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden group border-2 border-primary/5" onClick={() => setActiveGame('pro')}>
                <div className="h-3 bg-indigo-500" />
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-2xl">Life Path: Pro</CardTitle>
                  <CardDescription className="text-sm">Advanced simulation covering taxes, insurance, and student debt.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100">Teen Special</Badge>
                </CardContent>
              </Card>
            ) : (
              <Card className="opacity-60 grayscale border-none bg-white overflow-hidden cursor-not-allowed border-2 border-slate-100">
                <div className="h-3 bg-slate-300" />
                <CardHeader>
                  <Lock className="h-10 w-10 text-slate-400 mb-2" />
                  <CardTitle className="text-2xl">Life Path: Pro</CardTitle>
                  <CardDescription className="text-sm">Unlocks at age 16. Covers taxes and adulting essentials.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Age Restricted</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-primary" onClick={() => { setActiveGame(null); setShowAdvisorResult(false); setSimulationHistory([]); setCurrentScenarioIdx(0); }}>
              <ArrowRight className="h-4 w-4 rotate-180" /> Exit to Games Hub
            </Button>

            {activeGame === 'blitz' && (
              <BudgetBlitz onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'finIQ' && (
              <FinIQQuiz onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'maze' && (
              <MoneyMaze onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'dailyIQ' && (
              <FinIQQuiz isDailyChallenge onExit={() => setActiveGame(null)} />
            )}

            {activeGame === 'loan' && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-6">
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <div className="bg-accent p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <BadgePercent className="h-5 w-5 text-white/80" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loan Configurator</span>
                      </div>
                      <CardTitle className="text-2xl font-black">{getLoanContextTitle()}</CardTitle>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>{ageGroup === '8-11' ? 'Price of Item' : 'Loan Principal'}</span>
                            <span className="text-accent">{formatValue(loanPrincipal)}</span>
                          </div>
                          <Slider 
                            value={[loanPrincipal]} 
                            min={100} 
                            max={20000} 
                            step={100} 
                            onValueChange={([val]) => setLoanPrincipal(val)} 
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Interest Rate (APR)</span>
                            <span className="text-accent">{loanRate}%</span>
                          </div>
                          <Slider 
                            value={[loanRate]} 
                            min={0} 
                            max={30} 
                            step={0.5} 
                            onValueChange={([val]) => setLoanRate(val)} 
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-bold">
                            <span>Payback Term (Months)</span>
                            <span className="text-accent">{loanTerm} mo.</span>
                          </div>
                          <Slider 
                            value={[loanTerm]} 
                            min={1} 
                            max={60} 
                            step={1} 
                            onValueChange={([val]) => setLoanTerm(val)} 
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                         <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-accent mt-1" />
                            <p className="text-sm text-slate-600 leading-relaxed">
                               <strong>Advisor Note:</strong> A {loanTerm} month loan at {loanRate}% means you pay <strong>{formatValue(totalInterest)}</strong> extra just for the privilege of borrowing!
                            </p>
                         </div>
                      </div>

                      <Button className="w-full h-14 text-lg bg-accent hover:bg-accent/90" onClick={() => { completeTask('game-loan-sim'); toast({ title: "Analysis Complete!" }) }}>
                        Complete Analysis & Earn XP
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="bg-slate-800 border-b border-white/5">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Monthly Projection</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="text-center">
                          <div className="text-5xl font-black text-white mb-1">{formatValue(monthlyPayment)}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase">Monthly Payment</div>
                       </div>
                       
                       <div className="space-y-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-400">Base Price</span>
                             <span className="font-bold">{formatValue(loanPrincipal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-rose-400 font-bold">Total Interest</span>
                             <span className="font-bold text-rose-400">+{formatValue(totalInterest)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-white/10">
                             <span className="text-lg font-bold">Total Cost</span>
                             <span className="text-lg font-black text-accent">{formatValue(totalPaid)}</span>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {(activeGame === 'advisor' || activeGame === 'pro') && !showAdvisorResult && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <div className={`${activeGame === 'pro' ? 'bg-indigo-600' : 'bg-primary'} p-6 text-white`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Scenario {currentScenarioIdx + 1} / {activeGame === 'pro' ? PRO_SCENARIOS.length : ADVISOR_SCENARIOS.length}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-black">
                        {(activeGame === 'pro' ? PRO_SCENARIOS : ADVISOR_SCENARIOS)[currentScenarioIdx].title}
                      </CardTitle>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <p className="text-lg text-slate-700 leading-relaxed font-medium">
                        {(activeGame === 'pro' ? PRO_SCENARIOS : ADVISOR_SCENARIOS)[currentScenarioIdx].description}
                      </p>

                      <div className="grid gap-4">
                        {(activeGame === 'pro' ? PRO_SCENARIOS : ADVISOR_SCENARIOS)[currentScenarioIdx].options.map((opt, i) => (
                          <Button 
                            key={i}
                            variant="outline"
                            className={`h-auto p-6 flex flex-col items-start gap-1 text-left border-2 hover:border-${activeGame === 'pro' ? 'indigo-500' : 'primary'} hover:bg-${activeGame === 'pro' ? 'indigo-50' : 'primary/5'} transition-all group`}
                            onClick={() => handleAdvisorChoice(i)}
                          >
                            <span className={`font-bold text-lg group-hover:text-${activeGame === 'pro' ? 'indigo-600' : 'primary'}`}>{opt.label}</span>
                            <span className="text-xs text-muted-foreground">Select this path</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader className="pb-2 border-b border-white/10">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Scenario Context</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           {activeGame === 'pro' ? <FileText className="h-5 w-5 text-indigo-400" /> : <Calculator className="h-5 w-5 text-primary" />}
                           <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Topic</div>
                              <div className="text-sm font-bold">{activeGame === 'pro' ? 'Real World Readiness' : 'Wealth Strategy'}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <HeartPulse className="h-5 w-5 text-rose-400" />
                           <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Impact Level</div>
                              <div className="text-sm font-bold">High (Mission Critical)</div>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {(activeGame === 'advisor' || activeGame === 'pro') && showAdvisorResult && (
              <div className="space-y-8">
                <Card className="border-none shadow-2xl bg-white overflow-hidden">
                  <div className="bg-emerald-500 p-8 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-4xl font-black mb-2">Simulation Complete</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">Your choices have been analyzed by the SpendXP Advisor.</CardDescription>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {simulationHistory.map((item, i) => (
                        <div key={i} className="p-8 grid md:grid-cols-2 gap-8 items-start hover:bg-slate-50 transition-colors">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary">Stage {i+1}</Badge>
                              <h4 className="font-black text-xl text-slate-900">{item.scenario}</h4>
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
                          Finish Simulation
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
