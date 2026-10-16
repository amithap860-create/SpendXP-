'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, ShoppingCart, PiggyBank, CreditCard, ExternalLink, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EducationalDisclaimer } from '@/components/EducationalDisclaimer';

/**
 * Parent guide — "Raising money-smart kids" (added 2026-10-16).
 *
 * Written in our own words (examples localised to ₹), following the four
 * habits outlined in FINRA Investor Education's article "Financial Education
 * for Kids: Creating a Path to Financial Fluency" (22 Apr 2025). The numbers
 * below were checked: Rule of 72 → 72 ÷ 4% = 18 years; 72 ÷ 36% = 2 years.
 */

type Stage = { label: string; text: string; highlight?: boolean };
type Habit = {
  icon: React.ReactNode;
  title: string;
  intro: string;
  stages: Stage[];
  tryThis: string;
};

const HABITS: Habit[] = [
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: '1. Talk about money — early and often',
    intro: 'Kids who hear ordinary, calm conversations about money grow up less anxious about it. You do not need to be an expert; you need to be open.',
    stages: [
      { label: 'Ages 9–12', highlight: true, text: 'Include them in simple household money talk. Show them how the family separates needs from wants, and let them see what a monthly bill looks like. Explain why you say "not now" to some purchases.' },
      { label: 'Ages 13–16', text: 'Let them track their own spending for a month and set their own budget. As the things they want get more expensive, the budget becomes real to them.' },
      { label: 'Younger siblings', text: 'Even at 3–5, kids understand buying and selling. Practise waiting for something they want; delayed gratification is the root skill of saving.' },
    ],
    tryThis: 'At the next family shop, say your decisions out loud: "This is cheaper per kg, so I am taking it" or "That is a want — we will wait until next month."',
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: '2. Make money part of daily life',
    intro: 'Children learn by watching and doing. Everyday errands are a free classroom.',
    stages: [
      { label: 'Ages 9–12', highlight: true, text: 'Play board games that involve money, and bring them along when you shop. Teach them to compare prices and unit prices, and to spot sales. Show that saving small amounts adds up over time.' },
      { label: 'Ages 13–16', text: 'Give them a real budget for the grocery list or a family outing and see how much of it they can get done.' },
      { label: 'Teachable moments', text: 'Buying second-hand, cooking at home instead of ordering in, repairing instead of replacing. Each shows that spending on one thing means choosing not to spend on another.' },
    ],
    tryThis: 'Give your child ₹500 and the weekly vegetable list. Let them choose where to buy and bring back the receipt and the change.',
  },
  {
    icon: <PiggyBank className="h-5 w-5" />,
    title: '3. Make saving possible, not just preached',
    intro: 'Saying "save more" does little. A system that makes saving easy does a lot.',
    stages: [
      { label: 'Ages 9–12', highlight: true, text: 'Consider pocket money, or small payments for extra jobs around the house. Help them pick a goal and work out how much and how long: a ₹600 goal at ₹50 a week is 12 weeks. A paper savings chart makes progress visible.' },
      { label: 'Ages 13–16', text: 'Help them open a savings account (with you as guardian) and see interest at work. If they earn money later, encourage a fixed share set aside every time. Introduce long-term ideas like education funds and retirement savings.' },
      { label: 'The Rule of 72', text: 'Divide 72 by the interest rate to estimate how long money takes to double. At 4% a year, about 18 years (72 ÷ 4). Starting early gives compound interest more time to work.' },
    ],
    tryThis: 'Set up a goal chart with your child this week: the item, the price, the weekly amount, and a date. Colour in one box each time they save.',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: '4. Teach borrowing — carefully',
    intro: 'The earlier children understand that debt has a cost, the better their choices as adults.',
    stages: [
      { label: 'Ages 9–12', highlight: true, text: 'The basic idea: borrowed money gives you flexibility for something expensive, but it has to be repaid, often with interest or fees. A small, real example works well: lend them ₹100 for a want, agree on a repayment plan, and discuss what happens if they are late.' },
      { label: 'Ages 13–16', text: 'Talk about how credit cards, vehicle loans and "pay later" plans work, how a missed payment can lower a credit score, and why every repayment must fit into the month\'s budget.' },
      { label: 'The Rule of 72 for debt', text: 'It works against debt too. If a card charges 36% a year (common in India) and the balance goes unpaid, it can double in about 2 years (72 ÷ 36). Paying only the minimum lets interest keep adding to the balance. A promotional "no-cost EMI" may still charge interest or fees if the terms are not met.' },
    ],
    tryThis: 'Next time your child asks for something they cannot afford, work out together how they could pay it back in instalments and what the extra cost would be if they were late.',
  },
];

export default function ParentGuidePage() {
  useEffect(() => {
    document.title = 'Parent Guide | SpendXP';
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div className="space-y-3">
        <Link href="/parent" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Parent dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Raising money-smart kids</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Four habits that help children grow into confident, financially capable adults, and how to use everyday moments to build them.
          The lessons in SpendXP's <strong className="text-foreground">Money Basics for Kids</strong> track (ages 9–12) follow the same ideas, so you can read this guide and then explore the lessons together.
        </p>
      </div>

      {HABITS.map(h => (
        <Card key={h.title} className="border-none shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{h.icon}</div>
              <CardTitle className="text-xl font-black leading-snug">{h.title}</CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed">{h.intro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {h.stages.map(s => (
                <div
                  key={s.label}
                  className={s.highlight ? 'rounded-2xl border-2 border-primary/30 bg-primary/5 p-4' : 'rounded-2xl border bg-card p-4'}
                >
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${s.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</p>
                  <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/30 dark:border-amber-900">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">Try this week</p>
              <p className="text-sm text-foreground leading-relaxed">{h.tryThis}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-none shadow-md">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-black">Keep it safe</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Children under 14 should not take paid jobs; learn about earning through pocket money, chores and small family projects instead.
            Open any bank account, loan or investment in your own name or jointly as guardian, and never let a child share PINs, OTPs or passwords with anyone but you.
            If you or your child lose money to an online fraud in India, report it quickly on the cybercrime helpline 1930 or at cybercrime.gov.in.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Adapted in our own words from FINRA Investor Education's article{' '}
          <a
            href="https://www.finra.org/investors/insights/financial-education-kids"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-primary underline-offset-2 hover:underline"
          >
            Financial Education for Kids <ExternalLink className="h-3 w-3" />
          </a>{' '}
          (22 April 2025). The kids' lessons draw on the topic outline of the FDIC's{' '}
          <a
            href="https://www.fdic.gov/consumer-resource-center/money-smart-basics-kids"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-primary underline-offset-2 hover:underline"
          >
            Money Smart Basics for Kids <ExternalLink className="h-3 w-3" />
          </a>
          . Both are US resources; examples here are adapted to India and are simplified. This guide is general education, not financial advice.
        </p>
        <EducationalDisclaimer />
      </div>
    </div>
  );
}
