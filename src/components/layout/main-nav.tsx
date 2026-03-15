"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Gamepad2, 
  GraduationCap, 
  UserCircle,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { useUser } from '@/lib/store';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function MainNav() {
  const pathname = usePathname();
  const { balance, formatValue } = useUser();
  const { signOut } = useAuthContext();

  const navItems = [
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Learn', href: '/learn', icon: GraduationCap },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-between border-t bg-white px-4 py-3 md:relative md:flex-col md:h-screen md:w-64 md:border-r md:border-t-0 md:justify-start md:gap-8 md:p-6">
      <div className="hidden md:flex flex-col gap-2 mb-8 w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-primary tracking-tighter">SpendXP</h1>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 shadow-inner">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Game Balance</p>
          <p className="text-xl font-black text-slate-900 truncate">{formatValue(balance)}</p>
        </div>
      </div>

      <div className="flex w-full justify-around md:flex-col md:gap-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-black transition-all md:flex-row md:gap-4 md:text-sm md:px-5 md:py-4",
              pathname === item.href
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                : "text-slate-400 hover:bg-slate-50 hover:text-primary"
            )}
          >
            <item.icon className="h-6 w-6 md:h-5 md:w-5" />
            <span className="uppercase tracking-widest">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="hidden md:flex flex-col mt-auto w-full">
        <Button 
          variant="ghost" 
          onClick={signOut} 
          className="justify-start gap-4 h-14 px-5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-black uppercase tracking-widest"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </nav>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 12 2.29l1 8.57h7l-8 12.43-1-8.57z" />
    </svg>
  );
}
