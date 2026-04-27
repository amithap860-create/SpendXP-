"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser, Stock } from '@/lib/store';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  Info,
  CircleCheckBig,
  LoaderCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Target,
  BarChart3,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { generateMarketNewsAndExplanations } from '@/ai/flows/generate-market-news-and-explanations-flow';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function MarketSimulation() {
  const { ageGroup, balance, portfolio, buyStock, sellStock, formatValue, stocks, updateStocks, currency } = useUser();
  const { user } = useAuthContext();
  const newsXpAwarded = useRef(false);
  const { toast } = useToast();
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeAmount, setTradeAmount] = useState('1');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [news, setNews] = useState<any>(null);

  const fetchNews = async () => {
    setIsLoadingNews(true);
    try {
      const result = await generateMarketNewsAndExplanations({
        marketDescription: "The market is slightly volatile with tech growth.",
        ageGroup: (ageGroup === 'junior' ? '8-11' : ageGroup === 'teen' ? '11-15' : '16-20'),
        fictionalCompanies: (stocks || []).map(s => s.name)
      });
      setNews(result);
      
      const updatedStocks = (stocks || []).map(stock => {
        if (stock.name === result.impactedCompany) {
          const impactPercent = result.impactDirection === 'positive' ? 1.05 : (result.impactDirection === 'negative' ? 0.95 : 1);
          return { ...stock, price: Math.max(1, stock.price * impactPercent), change: (impactPercent - 1) * 100 };
        }
        return stock;
      });
      updateStocks?.(updatedStocks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    if (news === null) {
      fetchNews();
    }
  }, []);

  const handleBuy = () => {
    if (!selectedStock) return;
    const amount = parseInt(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid number of shares.", variant: "destructive" });
      return;
    }
    const totalCost = selectedStock.price * amount;
    if (balance < totalCost) {
      toast({ title: "Insufficient Balance", description: `You need ${formatValue(totalCost)} but only have ${formatValue(balance)}.`, variant: "destructive" });
      return;
    }
    if (!buyStock) {
      toast({ title: "Not ready", description: "Please log in to trade.", variant: "destructive" });
      return;
    }
    buyStock(selectedStock.symbol, amount);
    toast({ title: "Purchase Successful! 🎉", description: `Bought ${amount} share${amount > 1 ? 's' : ''} of ${selectedStock.name} for ${formatValue(totalCost)}` });
    setTradeAmount('1');
  };

  const handleSell = () => {
    if (!selectedStock) return;
    const amount = parseInt(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid number of shares.", variant: "destructive" });
      return;
    }
    const item = portfolio.find(p => p.symbol === selectedStock.symbol);
    if (!item || item.shares < amount) {
      toast({ title: "Insufficient Shares", description: `You only own ${item?.shares ?? 0} share${(item?.shares ?? 0) !== 1 ? 's' : ''} of ${selectedStock.name}.`, variant: "destructive" });
      return;
    }
    if (!sellStock) {
      toast({ title: "Not ready", description: "Please log in to trade.", variant: "destructive" });
      return;
    }
    sellStock(selectedStock.symbol, amount);
    const proceeds = selectedStock.price * amount;
    toast({ title: "Sale Successful! 💰", description: `Sold ${amount} share${amount > 1 ? 's' : ''} of ${selectedStock.name} for ${formatValue(proceeds)}` });
    setTradeAmount('1');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary">Market Simulator</h2>
            <p className="text-muted-foreground">Learn how the world invests by trading fictional companies. Prices auto-adjust to {currency}.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowGuide(true)} variant="secondary" className="gap-2 bg-white border" suppressHydrationWarning>
              <HelpCircle className="h-4 w-4 text-primary" />
              Investor's Guide
            </Button>
            <Button onClick={fetchNews} disabled={isLoadingNews} variant="outline" className="gap-2" suppressHydrationWarning>
              {isLoadingNews ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
              Refresh News
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Live Market Feed
                </CardTitle>
              </CardHeader>
              <div className="bg-white">
                {(stocks || []).map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`flex items-center justify-between p-4 border-t hover:bg-secondary cursor-pointer transition-colors ${selectedStock?.symbol === stock.symbol ? 'bg-secondary ring-1 ring-primary/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {stock.symbol[0]}
                      </div>
                      <div>
                        <div className="font-bold">{stock.name}</div>
                        <div className="text-xs text-muted-foreground">{stock.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatValue(stock.price)}</div>
                      <div className={`flex items-center justify-end text-xs font-bold ${stock.change >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(stock.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {news && (
              <Card className="border-none shadow-md bg-white overflow-hidden">
                <div className="bg-accent h-2 w-full" />
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 border-accent text-accent">BREAKING NEWS</Badge>
                  <CardTitle className="text-2xl font-bold text-primary">{news.newsEventTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed text-slate-700">{news.newsEventContent}</p>
                  <Button 
                    onClick={() => setShowExplanation(true)}
                    variant="link" 
                    className="p-0 h-auto font-bold flex items-center gap-1 text-accent"
                    suppressHydrationWarning
                  >
                    <Info className="h-4 w-4" />
                    Why is this happening?
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-white sticky top-8">
              <CardHeader>
                <CardTitle>Trade Panel</CardTitle>
                <CardDescription className="text-primary-foreground/70">
                  {selectedStock ? `Trade ${selectedStock.name}` : 'Select a company to start trading'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStock && (
                  <>
                    <div className="bg-white/10 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Price</span>
                        <span className="font-bold">{formatValue(selectedStock.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Your Balance</span>
                        <span className="font-bold">{formatValue(balance)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-primary-foreground/60">Shares</label>
                      <Input 
                        type="number" 
                        value={tradeAmount} 
                        onChange={(e) => setTradeAmount(e.target.value)}
                        min="1"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        suppressHydrationWarning
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button onClick={handleBuy} className="bg-white text-primary hover:bg-white/90 font-bold" suppressHydrationWarning>Buy</Button>
                      <Button onClick={handleSell} variant="outline" className="border-white text-white hover:bg-white/10 font-bold" suppressHydrationWarning>Sell</Button>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-xs font-bold uppercase text-primary-foreground/60 mb-2">Your Portfolio</div>
                      {portfolio.find(p => p.symbol === selectedStock.symbol) ? (
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span className="text-sm">Held: {portfolio.find(p => p.symbol === selectedStock.symbol)?.shares} shares</span>
                          <span className="text-xs bg-primary/20 text-[#A8D5BC] px-2 py-0.5 rounded-full">Active</span>
                        </div>
                      ) : (
                        <div className="text-xs italic text-primary-foreground/40">You don't own any shares of this company yet.</div>
                      )}
                    </div>
                  </>
                )}
                {!selectedStock && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-primary-foreground/60">
                    <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                    <p>Pick a company from the feed to see details and trade.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Short Selling Explainer Card */}
        <div className="mt-6 rounded-2xl border-2 border-[#A8D5BC] bg-[#E8F5EE] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#2E7D5A] shrink-0" />
            <h3 className="font-black text-[#1A1F2E] text-base">What is Short Selling?</h3>
          </div>
          <p className="text-sm text-[#1A4035] leading-relaxed">
            <strong>Short selling</strong> is an advanced strategy where an investor <em>borrows</em> shares they don't own, sells them immediately at the current high price, and hopes to buy them back later at a lower price to return to the lender — pocketing the difference as profit.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white rounded-xl p-3 border border-[#A8D5BC]">
              <p className="text-[10px] font-black uppercase text-[#4EA07A] mb-1">Step 1 — Borrow & Sell</p>
              <p className="text-xs text-slate-700">Borrow 10 shares worth ₹100 each. Sell immediately for ₹1,000.</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#A8D5BC]">
              <p className="text-[10px] font-black uppercase text-[#4EA07A] mb-1">Step 2 — Wait</p>
              <p className="text-xs text-slate-700">Price drops to ₹60. Buy back 10 shares for ₹600 and return them.</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#A8D5BC]">
              <p className="text-[10px] font-black uppercase text-[#4EA07A] mb-1">Step 3 — Profit or Loss</p>
              <p className="text-xs text-slate-700">Profit: ₹1,000 − ₹600 = ₹400. But if price <em>rises</em>, your loss is unlimited.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 font-medium">
              <strong>High Risk:</strong> Regular investors can lose at most what they invested. Short sellers face theoretically <em>unlimited</em> losses because a price can keep rising forever. Short selling is banned for most retail investors in India without a broker-issued margin account.
            </p>
          </div>
        </div>

        {/* AI Explanation Dialog */}
        <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="h-12 w-12 bg-accent/20 rounded-xl flex items-center justify-center mb-2">
                <CircleCheckBig className="h-6 w-6 text-accent" />
              </div>
              <DialogTitle className="text-2xl font-bold text-primary">{news?.explanationTitle}</DialogTitle>
              <DialogDescription className="text-lg">
                Learning Moment
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-slate-700 space-y-4">
              <p className="text-lg leading-relaxed">{news?.explanationContent}</p>
              <div className="bg-secondary p-4 rounded-xl border border-primary/10">
                <h4 className="font-bold text-primary mb-1">Pro Tip:</h4>
                <p className="text-sm italic">When news is "{news?.impactDirection}", prices often reflect that change quickly. Smart investors think about the long-term!</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  setShowExplanation(false);
                  if (user?.uid && !newsXpAwarded.current) {
                    newsXpAwarded.current = true;
                    await safeUpdateDoc(doc(db, 'users', user.uid, 'progression', 'stats'), {
                      totalXP: increment(10),
                    });
                  }
                }}
                className="w-full h-12 text-lg"
                suppressHydrationWarning
              >
                I Got It! +10 XP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Investor's Guide Dialog */}
        <Dialog open={showGuide} onOpenChange={setShowGuide}>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 text-primary">
                <HelpCircle className="h-6 w-6" />
              </div>
              <DialogTitle className="text-3xl font-bold text-primary">Investor's Playbook</DialogTitle>
              <DialogDescription className="text-lg">
                Your step-by-step guide to mastering the virtual market.
              </DialogDescription>
            </DialogHeader>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-to">
                <AccordionTrigger className="text-lg font-bold">1. How to Invest</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
                    <p className="text-slate-600">**Select a Company**: Click on any company in the "Live Market Feed". You'll see its details in the Trade Panel.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
                    <p className="text-slate-600">**Enter Shares**: Decide how many "pieces" (shares) of the company you want to own. Your total cost is shown automatically.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">3</div>
                    <p className="text-slate-600">**Execute Trade**: Click "Buy". The money is taken from your Virtual Balance, and the shares move to your Portfolio.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="when-buy">
                <AccordionTrigger className="text-lg font-bold">2. When to Buy</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="p-4 bg-[#E8F5EE] border border-[#C8E8D8] rounded-xl flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-bold text-[#1A1F2E]">Strategy: Buy Low</h4>
                      <p className="text-sm text-[#1A4035]">The best time to buy is when a company has strong potential but the price is still low. Look for **Positive Breaking News** stories at the bottom of the screen—these often indicate a price jump is coming!</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="when-sell">
                <AccordionTrigger className="text-lg font-bold">3. When to Sell</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                    <Target className="h-5 w-5 text-rose-600 mt-1" />
                    <div>
                      <h4 className="font-bold text-rose-900">Strategy: Sell High</h4>
                      <p className="text-sm text-rose-800">Once your shares have grown in value (check the Green percentage on your dashboard), you might want to sell to "lock in" your profit. You should also consider selling if **Negative News** breaks about that specific company.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="best-company">
                <AccordionTrigger className="text-lg font-bold">4. Finding the Best Company</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <p className="text-slate-600 mb-4">A "good" company for investment usually has:</p>
                  <ul className="grid gap-3">
                    <li className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">A history of positive daily growth (%)</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Positive media attention in the News Feed</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Lower volatility (less extreme price swings)</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="short-selling">
                <AccordionTrigger className="text-lg font-bold">5. Short Selling — What It Is &amp; Why It's Risky</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <p className="text-slate-600">Most investors <strong>buy first, sell later</strong>. Short sellers do the opposite — they <strong>sell first, buy later</strong>, betting prices will fall.</p>
                  <div className="grid gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="text-xs font-black uppercase text-slate-400 mb-1">How it works</p>
                      <p className="text-sm text-slate-700">Borrow shares from a broker → sell at today's high price → wait for price to drop → buy back cheaper → return shares → keep the difference as profit.</p>
                    </div>
                    <div className="p-3 bg-[#E8F5EE] border border-[#C8E8D8] rounded-lg flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-[#1A4035]"><strong>Example:</strong> Borrow &amp; sell 5 shares at ₹200 = ₹1,000. Price falls to ₹120. Buy back for ₹600. Profit: ₹400.</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-800"><strong>The Risk:</strong> If the price rises instead of falls, losses are <em>unlimited</em>. Regular investing limits your loss to what you put in. Short selling has no such limit.</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">Short selling in India requires a SEBI-registered broker margin account. It is not available on most basic trading apps.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <DialogFooter className="mt-6">
              <Button onClick={() => setShowGuide(false)} className="w-full" suppressHydrationWarning>Start Trading Like a Pro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
