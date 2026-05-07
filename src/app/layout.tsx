'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FirestoreErrorBoundary } from '@/components/FirestoreErrorBoundary';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGroupProvider } from '@/lib/ageAdapt';
import { UserProvider } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState } from 'react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { BugReportButton } from '@/components/BugReportButton';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkSize = () => setIsSmallScreen(window.innerWidth < 360);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const isAuthPage = [
    '/login', '/signup', '/verify-email', '/onboarding', '/consent',
    '/forgot-password', '/reset-password',
  ].includes(pathname);

  const navLinks = [
    { label: 'Home', href: '/dashboard', icon: 'grid' },
    { label: 'Quests', href: '/quests', icon: 'flag' },
    { label: 'Games', href: '/games', icon: 'arcade' },
    { label: 'Tools', href: '/tools', icon: 'wrench' },
    { label: 'Learn', href: '/learn', icon: 'book' },
    { label: 'Resources', href: '/resources', icon: 'open-book' },
    { label: 'Profile', href: '/profile', icon: 'user' }
  ];

  return (
    <div className="flex flex-col min-h-screen-safe">
      <OfflineBanner />
      
      {/* TOP NAV (Desktop) */}
      {!isAuthPage && (
        <header className="hidden md:block bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              {/* Logo mark: navy foundation + amber scale accent */}
              <div className="w-8 h-8 bg-[#1A1F2E] rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform relative overflow-hidden">
                {/* Scales of financial balance — SVG, no emoji */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#4EA07A' }}>
                  <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="6" y1="21" x2="18" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M6 9 L3 15 Q6 17 9 15 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                  <path d="M18 9 L15 15 Q18 17 21 15 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-black text-xl tracking-tighter text-slate-900">Spend</span>
                <span className="font-black text-xl tracking-tighter" style={{ color: '#2E7D5A' }}>XP</span>
              </div>
            </Link>
            <nav className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all duration-200",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}

      <div className={cn("flex-1", !isAuthPage && "pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-0")}>
        {children}
      </div>

      {/* BOTTOM NAV (Mobile) — Golden Ledger edition */}
      {!isAuthPage && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around z-50"
          style={{
            height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.04)'
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={pathname === link.href}
              isSmallScreen={isSmallScreen}
            />
          ))}
        </nav>
      )}
      <BugReportButton />
      <Toaster />
      {/* Legal footer — desktop only, hidden on auth pages */}
      {!isAuthPage && (
        <footer className="hidden md:flex items-center justify-center gap-4 py-3 border-t border-slate-100 bg-white text-[11px] font-bold text-slate-500">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} SpendXP</span>
        </footer>
      )}
    </div>
  );
}

// SVG icon map — clean 20×20 paths, no emoji
const NAV_ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
    </svg>
  ),
  flag: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 2v16M4 3l12 3.5L4 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arcade: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="14" cy="11" r="1.5" fill="currentColor"/>
      <path d="M5 9v4M3 11h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  wrench: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14 3a3 3 0 0 1 0 6 3 3 0 0 1-2.45-1.26L5.7 13.6a1.5 1.5 0 1 1-2.12-2.12l5.86-5.87A3 3 0 0 1 14 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  book: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 3h5.5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H4V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3h-4.5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2H16V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'open-book': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M18 5c0-1.1-.9-2-2-2h-4a2 2 0 0 0-2 2v10h6a2 2 0 0 0 2-2V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="10" y1="5" x2="10" y2="15" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
};

function NavLink({ href, label, active, isSmallScreen }: { href: string; label: string; active: boolean; isSmallScreen: boolean }) {
  // Map href → icon key
  const iconKey = href === '/dashboard' ? 'grid'
    : href === '/quests' ? 'flag'
    : href === '/games' ? 'arcade'
    : href === '/tools' ? 'wrench'
    : href === '/learn' ? 'book'
    : href === '/resources' ? 'open-book'
    : 'user';

  // Tour anchor IDs for the tooltip walkthrough
  const tourId = href === '/quests' ? 'tour-quests'
    : href === '/games' ? 'tour-games'
    : href === '/profile' ? 'tour-profile'
    : undefined;

  return (
    <Link href={href} id={tourId} className={cn(
      "flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 transition-all duration-200 relative",
      active ? "text-primary" : "text-slate-300 hover:text-slate-400"
    )}>
      {/* Gold active indicator dot above icon */}
      {active && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
          style={{ background: '#2E7D5A' }}
        />
      )}
      <div className={cn("transition-transform duration-200", active && "scale-110")}>
        {NAV_ICONS[iconKey]}
      </div>
      {!isSmallScreen && (
        <span className={cn(
          "text-[9px] font-black uppercase tracking-wider truncate w-full text-center px-0.5 transition-colors",
          active ? "text-primary" : "text-slate-400"
        )}>
          {label}
        </span>
      )}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SpendXP" />
        <meta name="theme-color" content="#1A1F2E" />
        <link rel="manifest" href="/manifest.json" />
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
