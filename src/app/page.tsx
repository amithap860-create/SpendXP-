"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WalletCards, Sparkles, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderById } from '@/lib/placeholder-images';

export default function LandingPage() {
  const router = useRouter();
  const { login, isLoggedIn, isInitialLoading } = useUser();
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age);
    if (!email || isNaN(ageNum)) return;
    
    setIsSubmitting(true);
    try {
      await login(email, ageNum);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatars = [
    getPlaceholderById('avatar-1'),
    getPlaceholderById('avatar-2'),
    getPlaceholderById('avatar-3'),
    getPlaceholderById('avatar-4')
  ];

  if (!isMounted || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border animate-bounce">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-primary">Join 50,000+ young investors</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight">
            Master your money with <span className="text-accent">SpendXP</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
            The fun, gamified way to learn about stocks, savings, and budgeting. Built for the next generation of financial pros.
          </p>
          <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-blue-200 overflow-hidden relative">
                   {avatar && (
                     <Image 
                      src={avatar.imageUrl} 
                      alt={avatar.description} 
                      fill 
                      className="object-cover"
                      data-ai-hint={avatar.imageHint}
                    />
                   )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-primary">Already trusted by students worldwide</p>
          </div>
        </div>

        <Card className="shadow-xl border-none ring-1 ring-black/5 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <WalletCards className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Start Your Journey</CardTitle>
            <CardDescription>Enter your details to enter your personalized learning portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Student Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@school.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-lg bg-white/50"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">How old are you?</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Your age (8-20)" 
                  min="8" 
                  max="20"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="h-12 rounded-lg bg-white/50"
                  suppressHydrationWarning
                />
                <p className="text-[10px] text-muted-foreground pt-1">We customize SpendXP based on your age!</p>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin mr-2" /> : null}
                Unlock My XP
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
