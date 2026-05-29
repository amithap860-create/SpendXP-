'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is SpendXP?',
        a: 'SpendXP is a gamified financial literacy app for ages 8–25. You earn XP by playing games, completing Case Files (quests), and solving daily challenges — all while learning real money skills like budgeting, investing, and managing credit.',
      },
      {
        q: 'Is SpendXP free?',
        a: 'Yes — the core experience is completely free. SpendXP Pro unlocks premium games (Stock Market Sim, Credit Builder) and removes the 3-quest daily limit. You can upgrade anytime from your profile page.',
      },
      {
        q: 'What age group is SpendXP for?',
        a: 'SpendXP is designed for ages 8–25. Content is automatically adapted based on your age group — younger users get simpler explanations, older users get more complex scenarios.',
      },
      {
        q: 'Do I need an account to use SpendXP?',
        a: 'Yes, a free account is required so your XP, rank, and progress are saved. You can sign up with email or Google.',
      },
    ],
  },
  {
    category: 'Account & Login',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Go to the login page and tap "Forgot password." Enter your email address and we\'ll send you a password reset link within a few minutes. Check your spam folder if it doesn\'t arrive.',
      },
      {
        q: 'How do I verify my email address?',
        a: 'After signing up, a verification email is sent automatically. Click the link in that email. If you didn\'t receive it, go to your profile page and tap "Resend verification email."',
      },
      {
        q: 'Can I change my username or avatar?',
        a: 'Yes. Go to your Profile page and tap the edit icon next to your name or avatar. Changes are saved immediately.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To request account deletion, email us at support@spendxp.app with the subject "Delete my account" from your registered email address. We will process the request within 7 business days and confirm once complete. All your data will be permanently deleted.',
      },
    ],
  },
  {
    category: 'Parent & Child Accounts',
    items: [
      {
        q: 'How does the parent dashboard work?',
        a: 'Parents can create a parent account, generate an invite code, and link it to their child\'s account. The parent dashboard shows your child\'s daily activity, XP earned, games played, and which financial topics they\'re learning.',
      },
      {
        q: 'My child is under 13. Do I need to approve their account?',
        a: 'Yes. If a child is under 13 (in the US) or under 16 (in the EU), we send a COPPA/parental consent request to the parent email provided during signup. The child\'s account is held in a pending state until the parent approves. This is required by law.',
      },
      {
        q: 'How do I link my parent account to my child\'s account?',
        a: 'From your parent dashboard, tap "Generate Invite Code." Share that code with your child. They enter it during signup (or in their profile settings) to link the accounts.',
      },
    ],
  },
  {
    category: 'XP, Ranks & Streaks',
    items: [
      {
        q: 'How do I earn XP?',
        a: 'You earn XP by completing Case Files (quests), playing games, finishing daily challenges, and maintaining streaks. Each activity shows exactly how much XP you\'ll earn before you start.',
      },
      {
        q: 'My streak reset even though I played yesterday. What happened?',
        a: 'Streaks reset at midnight IST (Indian Standard Time) each day. If you play just before midnight and it crosses into the next day\'s window, the streak resets. We\'re working on making the timezone configurable. If you believe this was an error, contact us with your account email.',
      },
      {
        q: 'What are ranks and how do I level up?',
        a: 'Ranks are part of the Order of the Golden Ledger — the in-app narrative. You start as a Copper Recruit and progress through Silver, Gold, Platinum, and Diamond tiers by earning XP. Your rank unlocks new story chapters and changes your dashboard.',
      },
      {
        q: 'What is the daily challenge?',
        a: 'The FinIQ Daily Blitz is a set of questions that\'s the same for every user on a given day. Your score is ranked against all other players. The daily challenge resets at midnight IST.',
      },
    ],
  },
  {
    category: 'SpendXP Pro',
    items: [
      {
        q: 'What does SpendXP Pro include?',
        a: 'Pro unlocks: Stock Market Simulator, Credit Score Builder, unlimited daily quests (free users are capped at 3/day), and early access to new features like Group Play.',
      },
      {
        q: 'How do I cancel my Pro subscription?',
        a: 'You can cancel anytime. On iOS: Settings → Apple ID → Subscriptions → SpendXP → Cancel. On Android: Google Play → Subscriptions → SpendXP → Cancel. You keep Pro access until the end of your billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Refund requests for iOS purchases must be made through Apple (reportaproblem.apple.com). For Android, through Google Play. For direct web purchases, email support@spendxp.app within 14 days of your charge with your order details.',
      },
    ],
  },
  {
    category: 'Technical Issues',
    items: [
      {
        q: 'The app is not loading or showing an error. What should I do?',
        a: 'First, try a hard refresh (pull down on mobile). If the issue persists, check your internet connection. If you\'re on the web, clear your browser cache. If the problem continues, use the contact form below to report it — include what device and browser you\'re using.',
      },
      {
        q: 'My progress didn\'t save after completing a quest.',
        a: 'Progress saves automatically when you complete each quest step. If it didn\'t save, it\'s likely a connection issue at the moment of completion. Check your internet and try the quest again — you won\'t lose XP from a partial redo. If the issue repeats, contact us.',
      },
      {
        q: 'The app works on web but not on my phone.',
        a: 'Make sure you\'re using a supported browser (Chrome 90+, Safari 14+, Firefox 90+). On mobile, some features require the app to be installed as a PWA — tap "Add to Home Screen" from your browser menu for the best experience.',
      },
    ],
  },
];

export default function SupportPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', category: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key: string) => setOpenItem(prev => (prev === key ? null : key));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error('Request failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try emailing support@spendxp.app directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-16">

        {/* Header */}
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
            ← Back to SpendXP
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-slate-500 mt-2 font-medium text-base">
            Find answers below or send us a message — we typically reply within 24 hours.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { emoji: '🔐', label: 'Reset password', href: '/forgot-password' },
            { emoji: '👤', label: 'Edit profile', href: '/profile' },
            { emoji: '⭐', label: 'Upgrade to Pro', href: '/upgrade' },
            { emoji: '👨‍👩‍👧', label: 'Parent dashboard', href: '/parent' },
            { emoji: '🔒', label: 'Privacy policy', href: '/privacy' },
            { emoji: '📄', label: 'Terms of service', href: '/terms' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-sm transition-all group"
            >
              <span className="text-xl">{link.emoji}</span>
              <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          {FAQS.map(section => (
            <div key={section.category}>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-bold text-slate-800">{item.q}</span>
                        <span className={`text-slate-400 flex-shrink-0 transition-transform duration-200 mt-0.5 ${isOpen ? 'rotate-45' : ''}`}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Contact Us</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Can&apos;t find your answer above? Send us a message and we&apos;ll get back to you.
            </p>
          </div>

          {submitted ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-2">
              <div className="text-3xl">✅</div>
              <p className="font-black text-slate-900">Message sent!</p>
              <p className="text-sm text-slate-500">We typically reply within 24 hours. Check your email for a confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Name *</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-primary bg-slate-50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email *</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-primary bg-slate-50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                <select
                  value={formState.category}
                  onChange={e => setFormState(s => ({ ...s, category: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-primary bg-slate-50 transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="account">Account / Login</option>
                  <option value="billing">Billing / Pro subscription</option>
                  <option value="bug">Bug report</option>
                  <option value="parent">Parent / child accounts</option>
                  <option value="privacy">Privacy / data request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Message *</label>
                <textarea
                  value={formState.message}
                  onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-primary bg-slate-50 transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>

              <p className="text-xs text-slate-400 text-center font-medium">
                Or email us directly at{' '}
                <a href="mailto:support@spendxp.app" className="text-primary hover:underline font-bold">
                  support@spendxp.app
                </a>
              </p>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center font-medium pb-8">
          SpendXP · Financial literacy for the next generation ·{' '}
          <Link href="/privacy" className="hover:underline">Privacy</Link> ·{' '}
          <Link href="/terms" className="hover:underline">Terms</Link>
        </p>

      </div>
    </div>
  );
}
