'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F7F4] flex flex-col items-center justify-center px-6 text-center">

      {/* Rank badge */}
      <div className="w-20 h-20 bg-[#1A1F2E] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <span className="text-4xl">🌫️</span>
      </div>

      {/* Error code */}
      <div className="text-[80px] font-black leading-none text-[#1A1F2E] mb-2 tracking-tighter">
        404
      </div>

      {/* Narrative flavour */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5EE] mb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D5A]">
          ⚖ Order of the Golden Ledger — Dispatch
        </span>
      </div>

      <h1 className="text-2xl font-black text-slate-900 mb-3 max-w-sm">
        The Gray Fog got here first.
      </h1>
      <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
        This page has been swallowed by the Fog. It may have moved, been deleted, or never existed.
        Return to HQ and continue your case files.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/dashboard"
          className="flex-1 py-3 rounded-xl bg-[#1A1F2E] text-white text-sm font-black uppercase tracking-widest text-center hover:bg-[#252B3B] transition-colors"
        >
          Back to HQ
        </Link>
        <Link
          href="/quests"
          className="flex-1 py-3 rounded-xl bg-[#E8F5EE] text-[#2E7D5A] text-sm font-black uppercase tracking-widest text-center hover:bg-[#C8E8D8] transition-colors"
        >
          Case Files
        </Link>
      </div>

      {/* Subtle footer */}
      <p className="mt-12 text-[10px] font-bold uppercase tracking-widest text-slate-300">
        SpendXP · Error 404
      </p>
    </div>
  );
}
