'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#1A1F2E] flex flex-col items-center justify-center px-6 text-center">
      {/* Lightning bolt icon */}
      <div className="w-20 h-20 mb-8 relative">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#252B3B"/>
          <path
            d="M46 12L22 44h18l-6 24 24-32H40l6-24z"
            fill="#2E7D5A"
            stroke="#4EA07A"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight mb-2">
        You&apos;re offline
      </h1>
      <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed mb-8">
        SpendXP needs an internet connection to load your progress and play games. Connect to Wi-Fi or mobile data and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="h-12 px-8 bg-[#2E7D5A] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#3A9B6F] transition-colors"
      >
        Try again
      </button>

      <p className="mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        SpendXP — Level up your finances
      </p>
    </div>
  );
}
