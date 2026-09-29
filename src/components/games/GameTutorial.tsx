'use client';

/**
 * @fileOverview Shared first-time "How to Play" tutorial for mini-games.
 *
 * Added 2026-09 per founder request: new players were dropped straight into
 * each game's UI (buy/sell dialogs, drag-and-drop, timers, etc.) with no
 * explanation of what to do or what anything meant. This shows a short,
 * dismissible step-by-step modal automatically the FIRST time a user opens
 * a given game (tracked in localStorage per game id), and leaves a small
 * "How to Play" button so they can reopen it anytime after that.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_PREFIX = 'spendxp_tutorial_seen_';

/**
 * Tracks whether this is the user's first time opening `gameId`'s tutorial
 * on this device, and exposes controls to show/dismiss it.
 */
export function useGameTutorial(gameId: string) {
  const storageKey = `${STORAGE_PREFIX}${gameId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setOpen(true);
    } catch {
      // localStorage unavailable (e.g. private browsing) — just skip
      // auto-showing rather than crashing the game.
    }
    // Only ever auto-open once per mount, based on the stored flag at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore — worst case the tutorial shows again next time
    }
  }, [storageKey]);

  const reopen = useCallback(() => setOpen(true), []);

  return { open, dismiss, reopen };
}

interface GameTutorialModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: string[];
}

export function GameTutorialModal({ open, onClose, title, steps }: GameTutorialModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-black">{title}</DialogTitle>
          </DialogHeader>
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">How to Play</p>
        </div>
        <div className="p-6 space-y-5">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground leading-snug">{step}</span>
              </li>
            ))}
          </ol>
          <Button onClick={onClose} className="w-full h-12 font-black rounded-xl min-h-[44px]">
            Got it, let&apos;s go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small reusable "How to Play" reopen button for a game's IDLE screen.
 * Defaults to the top-left corner since several games already have their
 * own info/help button pinned top-right — pass `position="right"` when a
 * game has nothing else there. Use `variant="onLight"` when the button sits
 * on a plain/white background instead of a colored header banner.
 */
export function HowToPlayButton({
  onClick,
  position = 'left',
  variant = 'onColor',
}: {
  onClick: () => void;
  position?: 'left' | 'right';
  variant?: 'onColor' | 'onLight';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-4 h-8 px-3 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase',
        position === 'left' ? 'left-4' : 'right-4',
        variant === 'onColor'
          ? 'bg-white/20 hover:bg-white/30 text-white'
          : 'bg-primary/10 hover:bg-primary/20 text-primary'
      )}
      aria-label="How to play"
    >
      <HelpCircle className="h-3.5 w-3.5" /> How to Play
    </button>
  );
}
