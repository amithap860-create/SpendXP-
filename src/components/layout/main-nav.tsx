"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Library, 
  PiggyBank, 
  LogOut 
} from 'lucide-react';
import { useUser } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function MainNav() {
  const pathname = usePathname();
  const { logout, balance } = useUser();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'Flashcards', href: '/flashcards', icon: Library },
    { name: 'Savings', href: '/savings', icon: PiggyBank },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t bg-white px-4 py-3 md:relative md:flex-col md:h-screen md:w-64 md:border-r md:border-t-0 md:justify-start md:gap-8 md:p-6">
      <div className="hidden md:flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold text-primary tracking-tight">SpendXP</h1>
        <div className="bg-secondary p-3 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Virtual Balance</p>
          <p className="text-xl font-bold text-primary">${balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex w-full justify-around md:flex-col md:gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors md:flex-row md:gap-3 md:text-sm md:px-4 md:py-3",
              pathname === item.href
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="hidden md:flex flex-col mt-auto w-full gap-4">
        <Button 
          variant="ghost" 
          onClick={logout} 
          className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </nav>
  );
}