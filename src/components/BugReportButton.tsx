'use client';

import { useState, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bug, X, Send, CheckCircle2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const SCREEN_OPTIONS = [
  'Dashboard', 'Games — Budget Blitz', 'Games — FinIQ Quiz', 'Games — Money Maze',
  'Games — Stock Market Sim', 'Games — Credit Builder', 'Games — Compound Clicker',
  'Quests', 'Learn', 'Tools', 'Resources', 'Profile', 'Login / Signup',
  'Onboarding', 'Parent Dashboard', 'Other',
];

const MAX_FILE_BYTES = 150_000; // 150 KB source → ~200 KB base64, well under 1 MB doc limit

export function BugReportButton() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [screen, setScreen] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [fileError, setFileError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-derive a readable screen name from the pathname
  const derivedScreen = () => {
    if (!pathname) return 'Unknown';
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard', '/games': 'Games Hub', '/quests': 'Quests',
      '/learn': 'Learn', '/tools': 'Tools', '/resources': 'Resources',
      '/profile': 'Profile', '/parent': 'Parent Dashboard', '/onboarding': 'Onboarding',
    };
    for (const [path, label] of Object.entries(map)) {
      if (pathname.startsWith(path)) return label;
    }
    return pathname;
  };

  const openForm = () => {
    setScreen(derivedScreen());
    setDescription('');
    setScreenshot(null);
    setScreenshotName('');
    setFileError('');
    setSubmitted(false);
    setOpen(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`Image too large (${Math.round(file.size / 1024)} KB). Please crop or compress it to under 150 KB first.`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({ title: 'Please describe the bug first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'bugReports'), {
        description: description.trim(),
        screen: screen.trim() || derivedScreen(),
        screenshot: screenshot ?? null,
        uid: user?.uid ?? 'anonymous',
        userEmail: user?.email ?? null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      toast({ title: 'Could not send report. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Don't show on auth/onboarding pages
  if (typeof pathname === 'string' && ['/login', '/signup', '/onboarding', '/consent', '/verify-email'].some(p => pathname.startsWith(p))) {
    return null;
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={openForm}
        aria-label="Report a bug"
        className="fixed right-4 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] md:bottom-6 z-40 h-12 w-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        suppressHydrationWarning
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-900">
              <div className="flex items-center gap-2 text-white">
                <Bug className="h-4 w-4" />
                <span className="font-black text-sm">Report a Bug</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors" suppressHydrationWarning>
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              /* Thank-you state */
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
                <h3 className="font-black text-xl text-slate-900">Thanks for the report!</h3>
                <p className="text-sm text-slate-500">We&apos;ve logged the bug and will look into it. Your feedback helps make SpendXP better for everyone.</p>
                <Button onClick={() => setOpen(false)} className="w-full min-h-[44px]" suppressHydrationWarning>Close</Button>
              </div>
            ) : (
              /* Form */
              <div className="p-5 space-y-4">
                {/* Description */}
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    What went wrong? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what happened and what you expected instead…"
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Screen */}
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Which screen?</label>
                  <select
                    value={screen}
                    onChange={e => setScreen(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {SCREEN_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Screenshot */}
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Screenshot (optional, max 150 KB)</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors',
                      screenshot ? 'border-[#4EA07A] bg-[#E8F5EE]' : 'border-slate-200 hover:border-primary/40 hover:bg-primary/5'
                    )}
                  >
                    <ImagePlus className={cn('h-5 w-5 shrink-0', screenshot ? 'text-primary' : 'text-slate-400')} />
                    <span className={cn('text-sm font-medium truncate', screenshot ? 'text-primary' : 'text-slate-400')}>
                      {screenshot ? screenshotName : 'Tap to attach a screenshot'}
                    </span>
                    {screenshot && (
                      <button
                        onClick={e => { e.stopPropagation(); setScreenshot(null); setScreenshotName(''); if (fileRef.current) fileRef.current.value = ''; }}
                        className="ml-auto text-primary hover:text-rose-500"
                        suppressHydrationWarning
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  {fileError && <p className="text-xs text-rose-600 mt-1 font-medium">{fileError}</p>}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !description.trim()}
                  className="w-full min-h-[44px] gap-2 font-black"
                  suppressHydrationWarning
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending…' : 'Send Report'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
