'use client';

import { useState, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { XPWallet } from '@/components/XPWallet';
import { getAgeGroup } from '@/lib/ageAdapt';
import { Sparkles, ChevronRight, User, Calendar, Target, Wallet, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const { user } = useAuthContext();
  const db = useFirestore();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const TOPICS = [
    { id: 'saving', label: 'Saving money' },
    { id: 'investing', label: 'Investing' },
    { id: 'credit', label: 'Credit cards' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'budgeting', label: 'Budgeting' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 13 }, (_, i) => currentYear - 8 - i); // 8 to 20 years old

  const nextStep = () => setStep(prev => prev + 1);

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ageGroup = birthYear ? getAgeGroup(birthYear) : 'junior';
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        birthYear,
        ageGroup,
        interests,
        onboardingComplete: true
      });
      router.push('/games');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-500", step >= i ? "bg-primary w-8" : "bg-slate-200")} />
        ))}
      </div>

      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {step === 1 && (
          <div className="space-y-8">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
              <User className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">What should we call you?</h2>
              <p className="text-slate-500 font-medium">Your strategist name will appear on leaderboards.</p>
            </div>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-16 text-2xl font-bold text-center rounded-2xl border-2 focus:ring-4"
              placeholder="Your Name"
            />
            <Button onClick={nextStep} size="lg" className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20">
              Next <ChevronRight className="ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="h-20 w-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent">
              <Calendar className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">When were you born?</h2>
              <p className="text-slate-500 font-medium">We customize your journey based on your age.</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-4 -mx-4">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setBirthYear(year)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all",
                    birthYear === year ? "border-primary bg-primary text-white shadow-lg" : "border-slate-100 hover:border-slate-300"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
            {birthYear && (currentYear - birthYear) < 13 && (
              <div className="p-4 bg-amber-50 rounded-xl text-amber-800 text-sm font-medium border border-amber-100 animate-in zoom-in duration-300">
                Ask a parent to help set up your account — we'll send them a link!
              </div>
            )}
            <Button 
              disabled={!birthYear} 
              onClick={nextStep} 
              size="lg" 
              className="w-full h-16 text-xl font-black rounded-2xl"
            >
              Next <ChevronRight className="ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="h-20 w-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
              <Target className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pick what interests you</h2>
              <p className="text-slate-500 font-medium">We'll show these challenges first.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => toggleInterest(topic.id)}
                  className={cn(
                    "px-6 py-3 rounded-full border-2 font-bold transition-all",
                    interests.includes(topic.id) ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-slate-100"
                  )}
                >
                  {topic.label}
                </button>
              ))}
            </div>
            <Button onClick={nextStep} size="lg" className="w-full h-16 text-xl font-black rounded-2xl">
              Next <ChevronRight className="ml-2" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="h-20 w-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
              <Wallet className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Meet your wallet</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Every game you play earns XP. Reach new levels to unlock harder challenges and bigger rewards.
              </p>
            </div>
            
            <div className="relative p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
              <div className="absolute -top-4 -right-4 bg-primary text-white p-2 rounded-full animate-bounce">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="opacity-50 pointer-events-none scale-90">
                <XPWallet />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl text-primary font-black flex items-center gap-2 border">
                  <ArrowRight className="h-5 w-5 animate-pulse" /> START AT LEVEL 1
                </div>
              </div>
            </div>

            <Button onClick={completeOnboarding} disabled={loading} size="lg" className="w-full h-16 text-2xl font-black rounded-2xl shadow-2xl">
              {loading ? 'Entering Arcade...' : "Let's go!"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
