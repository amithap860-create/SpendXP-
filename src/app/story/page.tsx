'use client';

import Link from 'next/link';

/* ── SVG icon components — all in Slate + Sage palette ── */

const IconScale = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M14 3v22M4 25h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M14 6L8 14h12L14 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="8" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="20" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

const IconFolder = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M7 13h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconBolt = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

const IconController = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M7 11v4M5 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <circle cx="16" cy="12" r="1.2" fill="currentColor"/>
    <circle cx="19" cy="12" r="1.2" fill="currentColor"/>
  </svg>
);

const IconCalculator = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <rect x="7" y="5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="16" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="18" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="18" r="1.2" fill="currentColor"/>
    <circle cx="16" cy="18" r="1.2" fill="currentColor"/>
  </svg>
);

const IconRank = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
);

const IconFog = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 10a5 5 0 0 1 9.9-1A4 4 0 1 1 18 17H5a4 4 0 0 1-2-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M7 20h10M9 23h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconArrow = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Rank icon set — geometric, no emoji ── */
const RANK_ICONS = [
  // Apprentice — magnifier
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7"/><path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  // Scout — compass
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.7"/><path d="M10 5v2M10 13v2M5 10h2M13 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/></svg>,
  // Agent — shield
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5.5v5C3 14.5 6 17.5 10 19c4-1.5 7-4.5 7-8.5v-5L10 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  // Inspector — globe
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.7"/><path d="M10 2.5C10 2.5 7 6 7 10s3 7.5 3 7.5M10 2.5C10 2.5 13 6 13 10s-3 7.5-3 7.5M2.5 10h15" stroke="currentColor" strokeWidth="1.4"/></svg>,
  // Detective — building
  <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" stroke="currentColor" strokeWidth="1.7"/><path d="M1 8l9-6 9 6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><rect x="8" y="12" width="4" height="6" stroke="currentColor" strokeWidth="1.4"/></svg>,
  // Chief — clipboard
  <svg key="5" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><path d="M8 4V3a2 2 0 0 1 4 0v1M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  // Grandmaster — crossed swords
  <svg key="6" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 14l3 3M14 3l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  // Legend — scroll
  <svg key="7" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4 5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="1.4"/></svg>,
];

/* ── Fog enemy icons — geometric ── */
const FOG_ICONS = [
  <svg key="0" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v16M6 7l5-4 5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 17l4 2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="1" width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.9 4.9l2.1 2.1M14.9 14.9l2.1 2.1M4.9 17.1l2.1-2.1M14.9 7.1l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2 16l4-8 4 5 3-3 4 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 8V4M16 6h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="10" r="5" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5"/><path d="M9 19l2-4 2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 18C4 12 8 8 11 4c3 4 7 8 7 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M8 18c0-3 1.5-5 3-7 1.5 2 3 4 3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="5" width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.7"/><path d="M11 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 3.5L5 1.5M15 3.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
];

const RANKS = [
  { name: 'Apprentice', xp: '0',    district: 'The Neighbourhood', fog: 'Impulse Storm',    desc: 'Your first case file. The streets of the Neighbourhood are watching.' },
  { name: 'Scout',      xp: '500',  district: 'Bank Row',          fog: 'Debt Web',         desc: 'The Debt Web is spinning traps in Bank Row. Credit card scams, hidden fees.' },
  { name: 'Agent',      xp: '1.5K', district: 'Market District',   fog: 'Market Madness',   desc: 'Panic selling, bubble chasing. The Market District needs someone clear-headed.' },
  { name: 'Inspector',  xp: '3.5K', district: 'The World Gate',    fog: 'The Scammer',      desc: 'Eight countries. One enemy. The Scammer wears a different face in every city.' },
  { name: 'Detective',  xp: '7.5K', district: 'Central Hall',      fog: 'Inflation Spiral', desc: 'Everything costs more. Savings are standing still. The Spiral hits everywhere at once.' },
  { name: 'Chief',      xp: '15K',  district: "Order's Academy",   fog: 'The Procrastinator', desc: '"Save tomorrow." The most dangerous enemy is the one that sounds reasonable.' },
  { name: 'Grandmaster',xp: '30K',  district: 'Infinite City',     fog: 'All Fog Forces',   desc: 'Every enemy. Every district. Simultaneously. The Order needs everything you have.' },
  { name: 'Legend',     xp: '60K',  district: 'The Golden Ledger', fog: 'Seasonal Threats', desc: 'Your name is written. But the Fog never retires. Neither do Legends.' },
];

const FOG_ENEMIES = [
  { name: 'Impulse Storm',       trap: 'Flash sales, FOMO, peer spending',         weakness: 'The 24-hour rule' },
  { name: 'Debt Web',            trap: 'Credit minimums, EMI spirals, hidden fees', weakness: 'Avalanche repayment' },
  { name: 'Market Madness',      trap: 'Panic selling, chasing hot stocks',         weakness: 'Index funds, long horizon' },
  { name: 'The Scammer',         trap: 'Ponzi schemes, crypto cons, fake platforms',weakness: 'SEBI-registered only' },
  { name: 'Inflation Spiral',    trap: 'Savings sitting still as prices rise',      weakness: 'Real-return assets' },
  { name: 'The Procrastinator',  trap: '"Start tomorrow" — compounding missed',     weakness: 'Automate. Today.' },
];

const STEPS = [
  { icon: <IconFolder size={22} />, label: 'Open a Case File', body: 'Pick a quest. Read the scenario. Every decision you make has a consequence — just like real money.' },
  { icon: <IconBolt size={22} />,   label: 'Earn XP',          body: 'Correct decisions, completed lessons, games played. XP is the currency of financial mastery.' },
  { icon: <IconController size={22} />, label: 'The Arcade',   body: 'Budget Blitz, FinIQ Quiz, Stock Market Sim. Short sessions, real knowledge. Play daily.' },
  { icon: <IconRank size={22} />,   label: 'Rise in Rank',     body: 'XP unlocks ranks. Each rank reveals a new district of SpendCity — a new enemy to defeat.' },
  { icon: <IconCalculator size={22} />, label: 'Use the Tools', body: 'SIP, EMI, compound interest. The Tools section calculates your real future money, not virtual XP.' },
];

export default function StoryPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F2F7F4' }}>

      {/* ── Back ── */}
      <div className="max-w-3xl mx-auto px-5 pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to HQ
        </Link>
      </div>

      {/* ── HERO — dark, full-width ── */}
      <div style={{ background: '#1A1F2E' }} className="mt-6">
        <div className="max-w-3xl mx-auto px-5 py-14 md:py-20">
          <div className="flex items-center gap-2 mb-7">
            <div style={{ color: '#2E7D5A' }}><IconScale size={18} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: '#2E7D5A' }}>Order of the Golden Ledger</span>
          </div>

          <h1 className="font-black text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
            SpendCity is in<br />
            <span style={{ color: '#4EA07A' }}>trouble.</span>
          </h1>

          <p className="text-[#A8D5BC] leading-relaxed max-w-lg" style={{ fontSize: '15px' }}>
            The Gray Fog is spreading — impulse traps, debt spirals, market hysteria, scams.
            It costs cities billions every year. The Order of the Golden Ledger fights back
            with the only weapon that actually works: financial intelligence.
          </p>

          <div className="mt-8 h-px w-full" style={{ background: 'rgba(168,213,188,0.15)' }} />

          <p className="mt-6 text-[13px] font-black uppercase tracking-widest" style={{ color: '#4EA07A' }}>
            You are the new recruit. The first case file is open.
          </p>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">How it works</span>
          <div className="h-px flex-1" style={{ background: '#d1e8db' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.label}
              className="rounded-2xl p-5 border flex gap-4 items-start"
              style={{ background: '#fff', borderColor: '#daeee5' }}>
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#E8F5EE', color: '#2E7D5A' }}>
                {step.icon}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#A8D5BC' }}>
                  0{i + 1}
                </div>
                <div className="font-black text-slate-900 text-sm mb-1">{step.label}</div>
                <div className="text-[12px] text-slate-500 leading-relaxed">{step.body}</div>
              </div>
            </div>
          ))}

          {/* Span the last step if odd */}
          <div className="rounded-2xl p-5 sm:col-span-2 border flex gap-4 items-center"
            style={{ background: '#1A1F2E', borderColor: '#252B3B' }}>
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(46,125,90,0.2)', color: '#4EA07A' }}>
              <IconFog size={22} />
            </div>
            <div>
              <div className="font-black text-sm mb-0.5" style={{ color: '#E8F5EE' }}>Fight the Gray Fog</div>
              <div className="text-[12px] leading-relaxed" style={{ color: '#A8D5BC' }}>
                Every bad financial habit has a name in SpendCity. Defeat it with knowledge. That's the only way the Fog clears.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RANK PROGRESSION ── */}
      <div style={{ background: '#1A1F2E' }}>
        <div className="max-w-3xl mx-auto px-5 py-14">
          <div className="flex items-center gap-4 mb-10">
            <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#4EA07A' }}>Rank progression</span>
            <div className="h-px flex-1" style={{ background: 'rgba(168,213,188,0.2)' }} />
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#4A556B' }}>8 ranks</span>
          </div>

          <div className="space-y-2">
            {RANKS.map((rank, i) => (
              <div key={rank.name}
                className="rounded-2xl p-4 flex items-start gap-4 transition-colors"
                style={{
                  background: i === 0 ? 'rgba(46,125,90,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${i === 0 ? 'rgba(46,125,90,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                {/* Rank icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: i === 0 ? '#2E7D5A' : 'rgba(255,255,255,0.07)',
                    color: i === 0 ? '#fff' : '#7A8FA8',
                  }}>
                  {RANK_ICONS[i]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-black text-white text-sm">{rank.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4A556B' }}>{rank.xp} XP</span>
                  </div>
                  <div className="text-[11px] mt-0.5 mb-1" style={{ color: '#7A8FA8' }}>{rank.district}</div>
                  <div className="text-[11px] leading-relaxed hidden sm:block" style={{ color: '#4A556B' }}>{rank.desc}</div>
                </div>
                {/* Active fog */}
                <div className="shrink-0 text-right hidden md:block">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#4A556B' }}>Active threat</div>
                  <div className="text-[11px] font-black" style={{ color: '#E05252' }}>{rank.fog}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRAY FOG ENEMIES — light section ── */}
      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">The Gray Fog</span>
          <div className="h-px flex-1" style={{ background: '#d1e8db' }} />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#A8D5BC' }}>6 enemies</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FOG_ENEMIES.map((enemy, i) => (
            <div key={enemy.name}
              className="rounded-2xl p-5 border"
              style={{ background: '#fff', borderColor: '#daeee5' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(224,82,82,0.08)', color: '#E05252' }}>
                  {FOG_ICONS[i]}
                </div>
                <span className="font-black text-slate-900 text-sm">{enemy.name}</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest shrink-0 mt-0.5" style={{ color: '#E05252' }}>Trap</span>
                  <span className="text-[12px] text-slate-600 leading-relaxed">{enemy.trap}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest shrink-0 mt-0.5" style={{ color: '#2E7D5A' }}>Counter</span>
                  <span className="text-[12px] font-bold leading-relaxed" style={{ color: '#2E7D5A' }}>{enemy.weakness}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: '#1A1F2E' }}>
        <div className="max-w-3xl mx-auto px-5 py-14 md:py-20">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-5" style={{ color: '#2E7D5A' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5v15M3 5.5l6-4 6 4v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Field Manual · Entry 001</span>
            </div>
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
              The Fog doesn't care<br />
              how smart you are.<br />
              <span style={{ color: '#4EA07A' }}>It cares how prepared.</span>
            </h2>
            <p style={{ color: '#A8D5BC', fontSize: '14px', lineHeight: '1.7' }} className="mb-8">
              Every case file you close is a financial decision you'll make better in real life.
              That's the only metric that matters.
            </p>
            <Link href="/quests"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
              style={{ background: '#2E7D5A', color: '#fff' }}>
              Open first Case File
              <IconArrow size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer spacer ── */}
      <div className="h-12" />
    </div>
  );
}
