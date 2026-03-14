
"use client"

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/lib/store';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  CircleArrowDown, 
  CircleArrowUp, 
  Plus, 
  Trash2, 
  Calculator,
  Lightbulb,
  Gamepad2,
  CircleCheckBig
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface BudgetItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amountUsd: number;
}

export default function Academy() {
  const { formatValue, convertFromCurrent, completeTask, tasks } = useUser();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', name: 'Weekly Allowance', type: 'income', amountUsd: 20 },
    { id: '2', name: 'Streaming Subscription', type: 'expense', amountUsd: 15 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState<'income' | 'expense'>('income');

  const addItem = () => {
    const currentAmount = parseFloat(newItemAmount);
    if (!newItemName || isNaN(currentAmount)) return;

    const amountUsd = convertFromCurrent(currentAmount);

    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      type: newItemType,
      amountUsd: amountUsd
    };

    setBudgetItems([...budgetItems, newItem]);
    setNewItemName('');
    setNewItemAmount('');
    completeTask('academy-budget');
  };

  const removeItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const isTaskCompleted = (id: string) => (Array.isArray(tasks) ? tasks : []).find(t => t.id === id)?.completed;

  const totalIncomeUsd = budgetItems
    .filter(i => i.type === 'income')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);
  
  const totalExpensesUsd = budgetItems
    .filter(i => i.type === 'expense')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);
  
  const netBalanceUsd = totalIncomeUsd - totalExpensesUsd;

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-primary">Financial Academy</h2>
            <p className="text-muted-foreground">Knowledge is your most valuable asset. Learn, practice, and master your money.</p>
          </div>
          <Link href="/games">
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <Gamepad2 className="h-4 w-4" />
              Interactive Games
            </Button>
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 border h-auto p-1 rounded-xl">
                <TabsTrigger value="income" className="py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Income</TabsTrigger>
                <TabsTrigger value="outcome" className="py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Outcome</TabsTrigger>
                <TabsTrigger value="budgeting" className="py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Budget</TabsTrigger>
                <TabsTrigger value="investing" className="py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Investing</TabsTrigger>
              </TabsList>

              <TabsContent value="income">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <div className="bg-emerald-500 h-2 w-full" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CircleArrowUp className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Concept One</span>
                      </div>
                      {isTaskCompleted('academy-income') && <CircleCheckBig className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <CardTitle className="text-2xl">What is Income?</CardTitle>
                    <CardDescription>Income is the money you receive or earn from various sources.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 leading-relaxed">
                      Think of income as your "fuel." Without fuel, your financial engine can't run! For students, income usually comes from:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Weekly Allowance</span>
                      </li>
                      <li className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                        <Plus className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Gifts (Birthday/Holidays)</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => completeTask('academy-income')}
                      disabled={isTaskCompleted('academy-income')}
                    >
                      {isTaskCompleted('academy-income') ? 'Concept Learned' : 'I Understand Income (+50 XP)'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outcome">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <div className="bg-rose-500 h-2 w-full" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-600">
                        <CircleArrowDown className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Concept Two</span>
                      </div>
                      {isTaskCompleted('academy-outcome') && <CircleCheckBig className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <CardTitle className="text-2xl">Understanding Outcome (Expenses)</CardTitle>
                    <CardDescription>Outcome is the money you spend to buy things or pay for services.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 leading-relaxed">
                      Every time you buy a snack, pay for a subscription, or get a new game, that's an outcome.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border-2 border-dashed border-slate-200">
                        <h4 className="font-bold text-primary mb-1">Needs</h4>
                        <p className="text-xs text-muted-foreground">Food, school supplies.</p>
                      </div>
                      <div className="p-4 rounded-xl border-2 border-dashed border-slate-200">
                        <h4 className="font-bold text-accent mb-1">Wants</h4>
                        <p className="text-xs text-muted-foreground">Video games, extra snacks.</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-rose-600 hover:bg-rose-700" 
                      onClick={() => completeTask('academy-outcome')}
                      disabled={isTaskCompleted('academy-outcome')}
                    >
                      {isTaskCompleted('academy-outcome') ? 'Concept Learned' : 'I Understand Expenses (+50 XP)'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budgeting">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <div className="bg-amber-500 h-2 w-full" />
                  <CardHeader>
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Calculator className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Concept Three</span>
                    </div>
                    <CardTitle className="text-2xl">Mastering the Budget</CardTitle>
                    <CardDescription>A budget is simply a plan for your money.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                      <Lightbulb className="h-6 w-6 text-amber-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-amber-900">The 50/30/20 Rule</h4>
                        <p className="text-sm text-amber-800">50% for Needs, 30% for Wants, and 20% for Savings!</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">
                      "A budget doesn't tell you what you can't do, it tells you what you CAN do with your money."
                    </p>
                    <p className="text-center font-bold text-amber-600">Practice below in the Budget Lab to earn XP!</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investing">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <div className="bg-blue-500 h-2 w-full" />
                  <CardHeader>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Concept Four</span>
                    </div>
                    <CardTitle className="text-2xl">Growing with Investing</CardTitle>
                    <CardDescription>Investing is making your money work for you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 leading-relaxed">
                      While savings keep your money safe, investing helps it grow over time through compound interest. 
                    </p>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <h4 className="font-bold text-primary mb-2">Why start early?</h4>
                      <p className="text-sm">The earlier you start, the more time your money has to multiply.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl bg-white h-full flex flex-col">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Budget Lab
                </CardTitle>
                <CardDescription>Practice by tracking your real or fictional finances.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="grid grid-cols-3 border-b">
                  <div className="p-4 text-center border-r">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Income</div>
                    <div className="text-sm font-bold text-emerald-600">{formatValue(totalIncomeUsd)}</div>
                  </div>
                  <div className="p-4 text-center border-r">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Expenses</div>
                    <div className="text-sm font-bold text-rose-600">{formatValue(totalExpensesUsd)}</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Net</div>
                    <div className={`text-sm font-bold ${netBalanceUsd >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                      {formatValue(netBalanceUsd)}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4 border-b bg-slate-50/50">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Input 
                        placeholder="Item name" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="bg-white"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-span-4">
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        value={newItemAmount}
                        onChange={(e) => setNewItemAmount(e.target.value)}
                        className="bg-white"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-span-2">
                      <Button onClick={addItem} className="w-full h-10 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        checked={newItemType === 'income'} 
                        onChange={() => setNewItemType('income')}
                        className="text-primary"
                      />
                      Income
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        checked={newItemType === 'expense'} 
                        onChange={() => setNewItemType('expense')}
                      />
                      Expense
                    </label>
                  </div>
                </div>

                <div className="flex-1 overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0">
                      <TableRow>
                        <TableHead className="font-bold">Item</TableHead>
                        <TableHead className="text-right font-bold">Amount</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className={`text-[10px] uppercase font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {item.type}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatValue(item.amountUsd)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
