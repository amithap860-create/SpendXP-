'use client';

import { useState, Suspense } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XPWallet } from '@/components/XPWallet';
import { getAgeGroup } from '@/lib/ageAdapt';
import { safeSetDoc } from '@/firebase';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVATARS, AvatarConfig } from '@/config/avatars';
import Image from 'next/image';
import { COUNTRIES, CountryConfig } from '@/config/currency';

const TOTAL_STEPS = 6;

const TOPICS = [
  { id: 'saving', label: '💰 Saving money' },
  { id: 'investing', label: '📈 Investing' },
  { id: 'credit', label: '💳 Credit cards' },
  { id: 'taxes', label: '🧾 Taxes' },
  { id: 'budgeting', label: '📊 Budgeting' },
];

/** Pill progress dots */
function StepDots({ step }: { step: number }) {
  return (
    <div className="flex gap-2 items-center justify-center mb-10">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-500',
            step === i + 1
              ? 'bg-primary w-8 h-3'
              : step > i + 1
              ? 'bg-primary/40 w-3 h-3'
              : 'bg-slate-200 w-3 h-3'
          )}
        />
      ))}
    </div>
  );
}

function OnboardingContent() {
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-populate birthYear from signup age gate if provided
  const prefillYear = searchParams.get('birthYear');
  const initialYear = prefillYear ? parseInt(prefillYear, 10) : null;

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(user?.displayName || '');
  const [birthYear, setBirthYear] = useState<number | null>(initialYear);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(AVATARS[0]);
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(COUNTRIES[0]); // India default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 13 }, (_, i) => currentYear - 8 - i);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const completeOnboarding = async () => {
    if (!user) { router.push('/login'); return; }

    const uid = user.uid;
    if (!uid || uid.length < 10) {
      router.push('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ageGroup = birthYear ? getAgeGroup(birthYear) : 'junior';
      const userRef = doc(db, 'users', uid);

      const success = await safeSetDoc(userRef, {
        displayName: nickname,
        nickname,
        birthYear,
        ageGroup,
        interests,
        avatarId: selectedAvatar.id,
        countryCode: selectedCountry.code,
        currencyCode: selectedCountry.currency.code,
        balance: selectedCountry.startingBalance,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      if (success) {
        router.push('/games');
      } else {
        setError('Could not save your profile. Please try again.');
      }
    } catch (err: any) {
      console.error('[SpendXP] Onboarding error:', err);
      if (err?.message?.includes('INTERNAL ASSERTION') || err?.message?.includes('ca9')) {
        window.location.reload();
        return;
      }
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #dbeafe 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #f0fdf4 0%, transparent 60%), #f8fafc'
      }}
    >
      {/* Ambient decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo wordmark */}
        <div className="text-center mb-6">
          <span className="text-2xl font-black tracking-tighter">
            <span className="text-slate-900">Spend</span><span style={{ color: '#2E7D5A' }}>XP</span>
          </span>
        </div>

        <StepDots step={step} />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold text-sm">
            {error}
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* ── Step 1: Nickname ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-8 text-center">
              <div className="space-y-3">
                <div className="text-6xl animate-bounce">👋</div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">What's your nickname?</h2>
                <p className="text-slate-500 font-medium">This is how you'll appear on leaderboards.</p>
              </div>
              <Input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="h-16 text-2xl font-bold text-center rounded-2xl border-2 focus:ring-4 focus:ring-primary/20"
                placeholder="e.g. MoneyMaster99"
                maxLength={20}
                suppressHydrationWarning
              />
              <Button
                onClick={nextStep}
                disabled={!nickname.trim()}
                size="lg"
                className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20"
                suppressHydrationWarning
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Avatar picker ─────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className={cn('w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br shadow-lg', selectedAvatar.bgGradient)}>
                  <Image src={selectedAvatar.imagePath} alt={selectedAvatar.name} width={144} height={144} className="w-full h-full object-cover object-top scale-110" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pick your character</h2>
                <p className="text-slate-500 font-medium">Your financial alter-ego awaits.</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    suppressHydrationWarning
                    className={cn(
                      'relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-300',
                      selectedAvatar.id === avatar.id
                        ? `border-primary bg-primary/5 scale-105 shadow-lg`
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:scale-102'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br',
                      avatar.bgGradient
                    )}>
                      <Image src={avatar.imagePath} alt={avatar.name} width={48} height={48} className="w-full h-full object-cover object-top scale-110" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate w-full text-center">
                      {avatar.name}
                    </span>
                    {selectedAvatar.id === avatar.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected character card */}
              <div className={cn(
                'p-4 rounded-2xl border-2 border-primary/20 bg-gradient-to-r text-white text-left flex items-center gap-4',
                selectedAvatar.bgGradient
              )}>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  <Image src={selectedAvatar.imagePath} alt={selectedAvatar.name} width={144} height={144} className="w-full h-full object-cover object-top scale-110" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-widest text-white/60 mb-0.5">{selectedAvatar.archetype}</p>
                  <p className="font-black text-lg">{selectedAvatar.name}</p>
                  <p className="text-white/80 text-sm font-medium">{selectedAvatar.tagline}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-none h-12 px-6 font-bold border-2" suppressHydrationWarning>Back</Button>
                <Button onClick={nextStep} className="flex-1 h-12 font-black rounded-xl" suppressHydrationWarning>
                  That's me! <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Country picker (optional) ─────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="text-5xl">{selectedCountry.flag}</div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Where are you from?</h2>
                <p className="text-slate-500 font-medium">We'll show amounts in your local currency — or skip and use ₹ (India).</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country)}
                    suppressHydrationWarning
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 font-bold',
                      selectedCountry.code === country.code
                        ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    )}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">{country.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{country.currency.code}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#E8F5EE] border border-[#C8E8D8] text-left">
                <p className="text-xs font-black uppercase text-primary tracking-widest mb-1">Your Starting Balance</p>
                <p className="text-2xl font-black text-[#1A4035]">
                  {selectedCountry.currency.symbol}{selectedCountry.startingBalance.toLocaleString()} {selectedCountry.currency.code}
                </p>
                <p className="text-xs text-primary mt-1">Virtual money to practice with — no real money involved!</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-none h-12 px-6 font-bold border-2" suppressHydrationWarning>Back</Button>
                <Button onClick={nextStep} className="flex-1 h-12 font-black rounded-xl" suppressHydrationWarning>
                  This is me! <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Skip option */}
              <button
                onClick={nextStep}
                suppressHydrationWarning
                className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors font-medium"
              >
                Skip — use India (₹) as default
              </button>
            </div>
          )}

          {/* ── Step 4: Birth year ─────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <div className="text-5xl">🎂</div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">When were you born?</h2>
                <p className="text-slate-500 font-medium">We'll show content that matches your level.</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-4 -mx-4">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setBirthYear(year)}
                    suppressHydrationWarning
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all',
                      birthYear === year
                        ? 'border-primary bg-primary text-white shadow-lg scale-110'
                        : 'border-slate-100 bg-white hover:border-primary/40'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-none h-12 px-6 font-bold border-2" suppressHydrationWarning>Back</Button>
                <Button disabled={!birthYear} onClick={nextStep} className="flex-1 h-12 font-black rounded-xl" suppressHydrationWarning>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Interests ─────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <div className="text-5xl">🎯</div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">What excites you?</h2>
                <p className="text-slate-500 font-medium">Pick your money topics — or skip to explore everything.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => toggleInterest(topic.id)}
                    suppressHydrationWarning
                    className={cn(
                      'px-5 py-3 rounded-full border-2 font-bold text-sm transition-all duration-200',
                      interests.includes(topic.id)
                        ? 'bg-primary border-primary text-white shadow-lg scale-105'
                        : 'bg-white border-slate-200 hover:border-primary/40 text-slate-700'
                    )}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-none h-12 px-6 font-bold border-2" suppressHydrationWarning>Back</Button>
                <Button onClick={nextStep} className="flex-1 h-12 font-black rounded-xl" suppressHydrationWarning>
                  {interests.length === 0 ? 'Show me everything →' : `Let's learn! →`}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 6: Order Induction ────────────────────────── */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              {/* Order seal + avatar */}
              <div className="relative mx-auto w-36 h-36">
                <div className={cn(
                  'w-36 h-36 rounded-3xl overflow-hidden bg-gradient-to-br shadow-2xl',
                  selectedAvatar.bgGradient
                )}>
                  <Image src={selectedAvatar.imagePath} alt={selectedAvatar.name} width={144} height={144} className="w-full h-full object-cover object-top scale-110" />
                </div>
                {/* Seal badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#4EA07A] rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white">
                  ⚖️
                </div>
              </div>

              {/* Induction message */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#A8D5BC] rounded-full px-4 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#2E7D5A]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#2E7D5A]">Induction Complete</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Welcome to the Order,<br />
                  <span className="text-primary">{nickname}</span> 👑
                </h2>
                <p className="text-slate-500 font-medium">
                  The Order of the Golden Ledger has been expecting you.
                </p>
              </div>

              {/* Dossier card — dark themed */}
              <div className="bg-slate-900 rounded-2xl p-5 text-left space-y-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#2E7D5A]">
                  ⚖️ Order Intelligence File · {selectedCountry.flag} {selectedCountry.name}
                </div>
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detective Persona</span>
                    <span className="text-sm font-black text-white">{selectedAvatar.name} · {selectedAvatar.archetype}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Starting Rank</span>
                    <span className="text-sm font-black text-slate-300">🔍 Apprentice</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Funds</span>
                    <span className="text-sm font-black text-[#4EA07A]">
                      {selectedCountry.currency.symbol}{selectedCountry.startingBalance.toLocaleString()} {selectedCountry.currency.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">First Mission</span>
                    <span className="text-sm font-black text-[#4EA07A]">Case File CF-001</span>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    &ldquo;{selectedAvatar.tagline}&rdquo; — {selectedAvatar.name}
                  </p>
                </div>
              </div>

              {/* First fog warning */}
              <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-4 text-left">
                <div className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-2">⚠️ Intelligence Report</div>
                <p className="text-xs text-red-300 leading-relaxed">
                  The <span className="font-black">Impulse Storm</span> is already moving through The Neighbourhood. Your first Case File is open. SpendCity needs you — now.
                </p>
              </div>

              <Button
                onClick={completeOnboarding}
                disabled={loading}
                size="lg"
                className="w-full h-14 text-xl font-black rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 text-white gap-2"
                suppressHydrationWarning
              >
                {loading ? '⚖️ Entering the Order...' : '⚖️ Accept Induction'}
              </Button>

              <p className="text-xs text-slate-400">
                By accepting you agree to our{' '}
                <a href="/terms" className="underline hover:text-primary">Terms</a> &amp;{' '}
                <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
