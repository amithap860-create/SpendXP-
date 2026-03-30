'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { CheckCircle2, Circle, Target, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logSpendingForToday, completeDailyChecklist } from '@/lib/dailyChallenge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  icon: React.ReactNode;
}

export default function OnboardingOverlay() {
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'log-spend',
      title: 'Log Your First Spend',
      description: 'Record your first expense to start tracking your financial journey',
      xp: 10,
      completed: false,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'set-goal',
      title: 'Set a Savings Goal',
      description: 'Create your first savings goal to work towards',
      xp: 20,
      completed: false,
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'complete-checklist',
      title: 'Complete Day 1',
      description: 'Finish your first day checklist to establish your routine',
      xp: 30,
      completed: false,
      icon: <Calendar className="h-5 w-5" />
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show onboarding if URL parameter is present and user exists
    if (searchParams.get('onboarding') === '1' && user) {
      setShowOnboarding(true);
      initializeOnboarding();
    }
  }, [searchParams, user]);

  const initializeOnboarding = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Create default wallet with starting balance
      await setDoc(doc(db, 'wallets', `${user.uid}_default`), {
        userId: user.uid,
        balance: 10000,
        currencyCode: 'INR',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'default'
      });

      // Create first savings goal
      await setDoc(doc(db, 'savingsGoals', `${user.uid}_first`), {
        userId: user.uid,
        title: 'Emergency Fund',
        targetAmount: 50000,
        currentAmount: 0,
        currencyCode: 'INR',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        category: 'emergency'
      });

      // Create daily challenge stub
      await setDoc(doc(db, 'dailyChallenges', `${user.uid}_${new Date().toISOString().split('T')[0]}`), {
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        spendLogged: false,
        goalReviewed: false,
        checklistCompleted: false,
        streak: 1,
        xp: 0,
        completed: false,
        createdAt: serverTimestamp()
      });

      // Mark onboarding as started
      await updateDoc(userRef, {
        onboardingStarted: true,
        onboardingStartedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[SpendXP] Onboarding initialization error:', error);
    }
  };

  const completeStep = async (stepId: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const step = steps.find(s => s.id === stepId);
      if (!step || step.completed) return;

      // Update step completion
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, completed: true } : s
      ));

      // Award XP
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentXP = userSnap.data()?.xp || 0;
      
      await updateDoc(userRef, {
        xp: currentXP + step.xp,
        [`onboardingSteps.${stepId}`]: true,
        [`onboardingSteps.${stepId}At`]: serverTimestamp()
      });

      // Update daily challenge if applicable
      if (stepId === 'log-spend') {
        await logSpendingForToday(user.uid);
      }

      // Check if all steps are completed
      const updatedSteps = steps.map(s => s.id === stepId ? { ...s, completed: true } : s);
      const allCompleted = updatedSteps.every(s => s.completed);

      if (allCompleted) {
        // Complete daily checklist
        await completeDailyChecklist(user.uid);
        
        // Mark onboarding as complete
        await updateDoc(userRef, {
          onboardingComplete: true,
          onboardingCompletedAt: serverTimestamp()
        });

        // Close onboarding after a delay
        setTimeout(() => {
          setShowOnboarding(false);
          // Clean URL parameter
          router.replace('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('[SpendXP] Step completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalXP = steps.filter(s => s.completed).reduce((sum, step) => sum + step.xp, 0);
  const allCompleted = steps.every(s => s.completed);

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to SpendXP! 🎯
            </h1>
            <p className="text-slate-600">
              Complete your Day 1 checklist to start your financial journey
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  step.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      +{step.xp} XP
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  {step.icon}
                </div>

                {!step.completed && (
                  <Button
                    onClick={() => completeStep(step.id)}
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? 'Loading...' : 'Complete'}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-600">Total XP Earned</p>
              <p className="text-2xl font-bold text-primary">{totalXP}</p>
            </div>
            
            {allCompleted && (
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 mb-2">🎉 Onboarding Complete!</p>
                <p className="text-sm text-slate-600">Redirecting to dashboard...</p>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowOnboarding(false)}
              className="text-slate-500"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
