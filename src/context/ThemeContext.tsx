'use client';

/**
 * @fileOverview Dark mode toggle infrastructure.
 *
 * The actual dark-theme CSS variables have existed in globals.css (the
 * `.dark { ... }` block) since long before this file — someone designed
 * the full dark palette but never wired up anything to apply it. This
 * provides that missing piece: persistence + applying/removing the `dark`
 * class on <html> (Tailwind is already configured with `darkMode: ['class']`
 * in tailwind.config.ts, so this is the only mechanism needed).
 *
 * SCOPE NOTE: this makes the THEME SYSTEM itself work. It does not, by
 * itself, make every screen look dark — most components in this app use
 * hardcoded literal colors (bg-white, text-slate-900, bg-[#E8F5EE], etc.)
 * rather than the theme-aware classes (bg-background, text-foreground,
 * bg-card). Converting those is a separate, much larger follow-up (~50+
 * files as of 2026-09-26). This only guarantees the toggle + persistence
 * + any component that DOES use the theme-aware classes responds correctly.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'spendxp_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to 'light' for the server-rendered markup — the inline script in
  // layout.tsx's <head> applies the real stored preference to <html> BEFORE
  // hydration, so there's no flash of the wrong theme. This state just needs
  // to agree with what that script already did once React takes over.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — silently keep default
    }
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // non-critical — theme just won't persist across sessions
    }
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = useCallback((next: Theme) => applyTheme(next), [applyTheme]);
  const toggleTheme = useCallback(() => applyTheme(theme === 'dark' ? 'light' : 'dark'), [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
