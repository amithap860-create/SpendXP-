"use client"

import { useState, useEffect } from 'react';
import { useUser, Stock } from '@/lib/store';
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
  BarChart3
} from 'lucide-react';
import { generateMarketNewsAndExplanations } from '@/ai/flows/generate-market-news-and-explanations-flow';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function MarketSimulation() {
  const { ageGroup, balance, portfolio, buyStock, sellStock, formatValue, stocks, updateStocks, currency } = useUser();
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
    const totalCostUsd = selectedStock.price * amount;
    if (balance < totalCostUsd) {
      toast({ title: "Insufficient Balance", variant: "destructive" });
      return;
    }
    buyStock?.(selectedStock.symbol, amount);
    toast({ title: "Purchase Successful!", description: `Bought ${amount} shares of ${selectedStock.name}` });
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
      toast({ title: "Insufficient Shares", variant: "destructive" });
      return;
    }
    sellStock?.(selectedStock.symbol, amount);
    toast({ title: "Sale Successful!", description: `Sold ${amount} shares of ${selectedStock.name}` });
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
                      <div className={`flex items-center justify-end text-xs font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Active</span>
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
              <Button onClick={() => setShowExplanation(false)} className="w-full h-12 text-lg" suppressHydrationWarning>I Got It! +10 XP</Button>
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
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <h4 className="font-bold text-emerald-900">Strategy: Buy Low</h4>
                      <p className="text-sm text-emerald-800">The best time to buy is when a company has strong potential but the price is still low. Look for **Positive Breaking News** stories at the bottom of the screen—these often indicate a price jump is coming!</p>
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
