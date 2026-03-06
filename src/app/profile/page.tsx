
"use client"

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Globe, Banknote, Calendar, RefreshCcw, LoaderCircle } from 'lucide-react';
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
  const { name, email, age, country, currency, updateProfile, resetAccount } = useUser();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const [formData, setFormData] = useState({
    name: name,
    email: email,
    age: age,
    country: country,
    currency: currency
  });

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }

    updateProfile({
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.age.toString()),
      country: formData.country,
      currency: formData.currency
    });

    toast({
      title: "Profile Updated",
      description: "Your settings have been saved successfully."
    });
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAccount();
      toast({
        title: "Account Reset",
        description: "Your balance has been restored to $1,000 and progress cleared."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not reset account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold text-primary">Your Profile</h2>
          <p className="text-muted-foreground">Manage your personal settings and preferences.</p>
        </header>

        <div className="max-w-2xl mx-auto space-y-6">
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
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="h-11"
                    suppressHydrationWarning
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@school.com"
                    className="h-11"
                    suppressHydrationWarning
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Age
                    </Label>
                    <Input 
                      id="age" 
                      type="number"
                      value={formData.age} 
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="Your age"
                      min="8"
                      max="20"
                      className="h-11"
                      suppressHydrationWarning
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      Preferred Currency
                    </Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData({...formData, currency: value})}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Country of Residence
                  </Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => setFormData({...formData, country: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-rose-50 border-rose-100 overflow-hidden">
            <CardHeader className="bg-rose-100/50 pb-3">
              <CardTitle className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-rose-800 mb-6 leading-relaxed">
                If your balance isn't showing correctly, or you want to restart your financial journey, you can reset your account. This will restore your balance to <strong>$1,000</strong> and clear all mission progress.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-100 font-bold gap-2">
                      {isResetting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                      Reset Account to $1,000
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will reset your virtual wallet balance to $1,000 USD and wipe all your earned XP, levels, and completed missions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-rose-600 hover:bg-rose-700">
                        Yes, Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="ghost" className="text-muted-foreground hover:text-rose-600 font-bold" onClick={() => window.location.href = '/'}>
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
