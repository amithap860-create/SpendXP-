
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { FirestoreErrorBoundary } from '@/components/FirestoreErrorBoundary';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGroupProvider } from '@/lib/ageAdapt';
import { UserProvider } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();

  const isAuthPage = ['/login', '/signup', '/verify-email', '/onboarding', '/consent'].includes(pathname);

  const navLinks = [
    { label: 'Home', href: '/dashboard', icon: 'grid' },
    { label: 'Quests', href: '/quests', icon: 'flag' },
    { label: 'Games', href: '/games', icon: 'arcade' },
    { label: 'Tools', href: '/tools', icon: 'wrench' },
    { label: 'Learn', href: '/learn', icon: 'book' },
    { label: 'Profile', href: '/profile', icon: 'user' }
  ];

  return (
    <div className="flex flex-col min-h-screen-safe">
      {/* TOP NAV (Desktop) */}
      {!loading && user && !isAuthPage && (
        <header className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-5 relative">
                  <div className="absolute bottom-0 left-0 w-full h-full bg-white rounded-t-full rounded-br-full -rotate-45" />
                </div>
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900">SpendXP</span>
            </Link>
            <nav className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-colors",
                    pathname === link.href ? "text-teal-600 bg-teal-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}

      <div className={cn("flex-1", !isAuthPage && user && "pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-0")}>
        {children}
      </div>

      {/* BOTTOM NAV (Mobile) */}
      {!loading && user && !isAuthPage && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
          style={{ 
            height: 'calc(80px + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)' 
          }}
        >
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href}>
              {link.icon === 'grid' && (
                <div className="grid grid-cols-2 gap-0.5 p-0.5">
                  {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-current rounded-sm" />)}
                </div>
              )}
              {link.icon === 'flag' && (
                <div className="w-4 h-5 relative">
                  <div className="absolute top-0 left-0 w-3 h-2.5 bg-current rounded-sm" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                  <div className="absolute top-0 left-0 w-0.5 h-5 bg-current rounded-full" />
                </div>
              )}
              {link.icon === 'arcade' && (
                <div className="w-5 h-3.5 bg-current rounded-sm relative overflow-hidden">
                  <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-50" />
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-50" />
                </div>
              )}
              {link.icon === 'wrench' && (
                <div className="w-4 h-4 border-2 border-current rounded-sm relative flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
              )}
              {link.icon === 'book' && (
                <div className="w-4 h-5 bg-current rounded-sm relative">
                  <div className="absolute top-1 left-1 right-1 h-0.5 bg-white opacity-30" />
                  <div className="absolute top-2.5 left-1 right-1 h-0.5 bg-white opacity-30" />
                </div>
              )}
              {link.icon === 'user' && (
                <div className="w-4 h-4 rounded-full border-2 border-current flex flex-col items-center justify-center overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mb-0.5" />
                  <div className="w-3 h-1.5 rounded-full bg-current" />
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      )}
      <Toaster />
    </div>
  );
}

function NavLink({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 transition-all duration-300",
      active ? "text-teal-600 scale-110" : "text-slate-300"
    )}>
      {children}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body 
        className={cn(inter.variable, "font-sans antialiased bg-slate-50 text-slate-900")}
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <AgeGroupProvider>
            <AuthProvider>
              <UserProvider>
                <FirestoreErrorBoundary>
                  <RootLayoutContent>{children}</RootLayoutContent>
                </FirestoreErrorBoundary>
              </UserProvider>
            </AuthProvider>
          </AgeGroupProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
