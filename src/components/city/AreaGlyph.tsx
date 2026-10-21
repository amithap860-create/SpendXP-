import React from 'react';

/** Line-art glyphs for SpendCity areas (24x24 grid, stroke = currentColor). Replaces emoji. */
export function AreaGlyphPaths({ id }: { id: string }) {
  switch (id) {
    case 'pocket_park': // tree
      return <><circle cx="12" cy="9" r="5.5" /><path d="M12 14.5V21M8 21h8" /></>;
    case 'neighbourhood': // house
      return <><path d="M3.5 11.5 12 4l8.5 7.5" /><path d="M6 10v10h12V10" /><path d="M10 20v-5.5h4V20" /></>;
    case 'bank_row': // bank
      return <><path d="M3 9.5 12 4l9 5.5z" /><path d="M5.5 11.5v6M10 11.5v6M14 11.5v6M18.5 11.5v6" /><path d="M3.5 20h17" /></>;
    case 'world_gate': // globe
      return <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><ellipse cx="12" cy="12" rx="3.8" ry="8.5" /></>;
    case 'central_hall': // domed hall
      return <><path d="M6 12a6 6 0 0 1 12 0" /><path d="M12 4v2" /><path d="M5 12h14" /><path d="M7 12v6M12 12v6M17 12v6" /><path d="M4 20h16" /></>;
    case 'market_district': // rising chart
      return <><path d="M3.5 4v16.5H20.5" /><path d="m7 15 4-4.5 3 2.5 5-6" /><path d="M15.5 7H19v3.5" /></>;
    case 'academy': // graduation cap
      return <><path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5z" /><path d="M6.5 11.8V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.2" /><path d="M21.5 9.5V15" /></>;
    default: // shield
      return <path d="M12 3.5 19 6v5.5c0 4.2-3 7.5-7 9-4-1.5-7-4.8-7-9V6z" />;
  }
}

export function AreaIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-5 w-5'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <AreaGlyphPaths id={id} />
    </svg>
  );
}
