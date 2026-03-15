"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { useFirestore } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { getConceptStrengths, ConceptStrengths } from '@/lib/progressionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Globe, Banknote, Calendar, RefreshCcw, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Japan", "India", "Brazil", "South Africa"
];

const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR", "BRL", "ZAR"
];

export default function Profile() {
  const { name, email, age, country, currency, updateProfile, resetAccount, tasks } = useUser();
  const { user } = useAuthContext();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isResetting, setIsResetting] = useState(false);
  const [strengths, setStrengths] = useState<ConceptStrengths | null>(null);
  const [formData, setFormData] = useState({
    name: name,
    email: email,
    age: age,
    country: country,
    currency: currency
  });

  useEffect(() => {
    if (user && db) {
      getConceptStrengths(db, user.uid).then(setStrengths);
    }
  }, [user, db, tasks]);

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.age) {
      toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
      return;
    }
    updateProfile({
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.age.toString()),
      country: formData.country,
      currency: formData.currency
    });
    toast({ title: "Profile Updated", description: "Your settings have been saved successfully." });
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAccount();
      toast({ title: "Account Reset", description: "Your balance has been restored to $1,000 and progress cleared." });
    } catch (error) {
      toast({ title: "Error", description: "Could not reset account.", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold text-primary">Your Strategist Profile</h2>
          <p className="text-muted-foreground">Master your identity and track your growth.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 max-w-6xl mx-auto">
          {/* Settings Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-sm">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle>{name || 'User Name'}</CardTitle>
                    <CardDescription>{email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11" suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11" suppressHydrationWarning />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Age</Label>
                      <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} min="8" max="20" className="h-11" suppressHydrationWarning />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Banknote className="h-4 w-4 text-muted-foreground" />Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select currency" /></SelectTrigger>
                        <SelectContent>{CURRENCIES.map(curr => (<SelectItem key={curr} value={curr}>{curr}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-rose-50 border-rose-100 overflow-hidden">
              <CardHeader className="bg-rose-100/50 pb-3"><CardTitle className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">Danger Zone</CardTitle></CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-rose-800 mb-6">Resetting will restore balance to <strong>$1,000</strong> and clear all XP/mission progress.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-100 font-bold gap-2">
                      {isResetting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                      Reset My Journey
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This wipes all XP, levels, and completed missions. Your balance returns to $1,000.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-rose-600 hover:bg-rose-700">Reset Everything</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Strengths Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6" />
                  Your Strengths
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">Based on game performance and academy progress.</CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                {strengths ? (
                  Object.entries(strengths).map(([key, val]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider capitalize">{key}</span>
                        <span className="text-sm font-black text-primary">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic">
                    <LoaderCircle className="h-8 w-8 animate-spin mb-4 text-primary" />
                    Calculating your mastery...
                  </div>
                )}

                <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-primary/10 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    <strong>Boost your score:</strong> Complete academy lessons or finish games with higher scores to increase your concept proficiency!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
