"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Shield, GamepadIcon, BookOpen, Trophy } from 'lucide-react';
import Image from 'next/image';
import { AVATARS } from '@/config/avatars';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'SpendXP — Learn Money. Earn XP.';
  }, []);

  // Redirect already-authenticated users straight to the dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', background: 'white'
      }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #E1F5EE', borderTop: '3px solid #1A1F2E',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black text-primary tracking-tighter">SpendXP</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-primary">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="font-bold shadow-lg shadow-primary/20">Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border mb-6 animate-bounce">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-primary">Built for ages 8 to 20 · India-first</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary leading-tight mb-6">
          Master your money<br />
          <span className="text-accent">with SpendXP</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Learn budgeting, investing, saving, and credit through games, quests, and real-life scenarios.
          Everything adapts to your age — from pocket money to salary.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 text-lg font-black shadow-xl shadow-primary/30 w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-2 w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Character showcase */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-2">Pick your operative</p>
          <h2 className="text-2xl md:text-3xl font-black text-primary">12 financial archetypes. Which one are you?</h2>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar md:grid md:grid-cols-6 md:overflow-visible">
          {AVATARS.map(avatar => (
            <Link href="/signup" key={avatar.id} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br ${avatar.bgGradient} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}>
                <Image src={avatar.imagePath} alt={avatar.name} width={80} height={80} className="w-full h-full object-cover object-top" />
              </div>
              <span className="text-[10px] font-black text-slate-700 truncate">{avatar.name}</span>
              <span className="text-[9px] text-slate-400 truncate text-center">{avatar.archetype}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <GamepadIcon className="h-7 w-7 text-primary" />,
            title: '6 Learning Games',
            desc: 'Budget Blitz, Stock Market Simulator, Credit Score Builder, and more — real skills disguised as fun.'
          },
          {
            icon: <BookOpen className="h-7 w-7 text-primary" />,
            title: '7 Real-Life Quests',
            desc: 'Make decisions about your first paycheck, renting, EMIs, emergencies, and credit cards.'
          },
          {
            icon: <Trophy className="h-7 w-7 text-primary" />,
            title: 'XP & Badges',
            desc: 'Earn XP, level up from Saver to Money Master, and unlock 19 achievement badges.'
          },
          {
            icon: <TrendingUp className="h-7 w-7 text-primary" />,
            title: 'Financial Health Score',
            desc: 'Track how your decisions improve your financial health score from 0 to 100.'
          },
          {
            icon: <Shield className="h-7 w-7 text-primary" />,
            title: 'Parent Dashboard',
            desc: 'Parents can monitor progress, set time limits, and receive weekly reports.'
          },
          {
            icon: <Sparkles className="h-7 w-7 text-primary" />,
            title: 'Age-Adapted Content',
            desc: 'Juniors (8–12) learn with pocket money. Teens (13–16) tackle allowances. Seniors (17–20) handle salaries.'
          }
        ].map((f, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border shadow-sm">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="bg-primary rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-3">Ready to level up?</h2>
          <p className="text-primary-foreground/80 mb-8">Free to use. No ads. No in-app purchases. Built for everyone.</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-black">
              Start Earning XP Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground pb-8">
        © 2025 SpendXP · <Link href="/login" className="hover:underline">Sign In</Link>
      </footer>
    </div>
  );
}
