import React from 'react';
import type { Emotion, Speaker } from '@/config/characters';

/**
 * Hand-built SVG faces for the story cast (2026-10-19). One expression system
 * shared by all four characters: each mood sets brow angles, eye shape and
 * mouth; each character supplies hair, skin, glasses, collar and extras.
 * Colours are fixed (not theme tokens) so faces look the same in light and dark.
 */
type Look = {
  skin: string; hairBack?: React.ReactNode; hairFront?: React.ReactNode; collar: React.ReactNode;
  extras?: React.ReactNode; extrasTop?: React.ReactNode; brow: string; eyeFill: string; hollow?: boolean; mouthFill: string;
  mouthStroke: string;
};

const EX = [46, 74], EY = 62, BY = 50;

// brow offsets (y delta from BY): left brow [outer, inner], right brow [inner, outer]
const BROWS: Record<Emotion, { L: [number, number]; R: [number, number] }> = {
  neutral:    { L: [0, 0],   R: [0, 0] },
  content:    { L: [-1, -1], R: [-1, -1] },
  happy:      { L: [-4, -4], R: [-4, -4] },
  worried:    { L: [1, -4],  R: [-4, 1] },
  surprised:  { L: [-8, -8], R: [-8, -8] },
  determined: { L: [-2, 3],  R: [3, -2] },
  proud:      { L: [-3, -3], R: [-3, -3] },
  sly:        { L: [-1, 1],  R: [-3, -7] },
  sad:        { L: [2, -4],  R: [-4, 2] },
};

function Eyes({ mood, look }: { mood: Emotion; look: Look }) {
  const closed = mood === 'content' || mood === 'proud';
  return (
    <g>
      {EX.map((x, i) => {
        if (closed) {
          return <path key={i} d={`M${x - 6} ${EY + 2} Q${x} ${EY - 6} ${x + 6} ${EY + 2}`} fill="none" stroke={look.hollow ? '#0c0b10' : '#1b1b1f'} strokeWidth="3" strokeLinecap="round" />;
        }
        const rx = mood === 'surprised' ? 6.2 : look.hollow ? 6 : 4.8;
        const ry = mood === 'surprised' ? 7.4 : mood === 'determined' ? 3.4 : mood === 'sly' ? 3.6 : look.hollow ? 8 : 5.6;
        return (
          <g key={i}>
            <ellipse cx={x} cy={EY} rx={rx} ry={ry} fill={look.eyeFill} />
            {!look.hollow && <circle cx={x + 1.6} cy={EY - 1.8} r="1.5" fill="#fff" />}
            {look.hollow && <circle cx={x} cy={EY + 1} r="1.8" fill="#6f6a86" />}
            {mood === 'sly' && <path d={`M${x - rx - 1} ${EY - ry + 1} L${x + rx + 1} ${EY - ry + 1}`} stroke="#00000055" strokeWidth="2" />}
          </g>
        );
      })}
    </g>
  );
}

function Brows({ mood, look }: { mood: Emotion; look: Look }) {
  const b = BROWS[mood];
  const [lo, li] = b.L, [ri, ro] = b.R;
  return (
    <g stroke={look.brow} strokeWidth="3.2" strokeLinecap="round">
      <line x1={EX[0] - 8} y1={BY + lo} x2={EX[0] + 7} y2={BY + li} />
      <line x1={EX[1] - 7} y1={BY + ri} x2={EX[1] + 8} y2={BY + ro} />
    </g>
  );
}

function Mouth({ mood, look }: { mood: Emotion; look: Look }) {
  const s = look.mouthStroke;
  switch (mood) {
    case 'content':   return <path d="M50 79 Q60 89 70 79" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
    case 'happy':     return (<g><path d="M48 78 Q60 97 72 78 Z" fill={look.mouthFill} stroke={s} strokeWidth="2" strokeLinejoin="round" /><ellipse cx="60" cy="88" rx="6" ry="3" fill="#e0707f" /></g>);
    case 'worried':   return <path d="M52 87 Q60 80 68 87" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
    case 'surprised': return <ellipse cx="60" cy="85" rx="5" ry="7" fill={look.mouthFill} stroke={s} strokeWidth="2" />;
    case 'determined':return <path d="M51 84 L69 84" stroke={s} strokeWidth="3.2" strokeLinecap="round" />;
    case 'proud':     return <path d="M49 79 Q60 92 71 79" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
    case 'sly':       return <path d="M50 84 Q62 85 71 77" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
    case 'sad':       return <path d="M52 89 Q60 80 68 89" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
    default:          return <path d="M52 83 Q60 85 68 83" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />;
  }
}

function Marks({ mood, hollow }: { mood: Emotion; hollow?: boolean }) {
  return (
    <g>
      {!hollow && (mood === 'content' || mood === 'happy' || mood === 'proud') && (<g fill="#f0868a" opacity="0.45"><ellipse cx="38" cy="74" rx="6" ry="3.5" /><ellipse cx="82" cy="74" rx="6" ry="3.5" /></g>)}
      {mood === 'worried' && <path d="M92 40 Q96 48 92 52 Q88 48 92 40Z" fill="#8ecae6" stroke="#4aa3c8" strokeWidth="1" />}
      {mood === 'sad' && <path d="M40 70 Q43 76 40 80 Q37 76 40 70Z" fill="#8ecae6" stroke="#4aa3c8" strokeWidth="1" />}
      {mood === 'proud' && <path d="M96 22 l3 7 7 1 -5.5 4.5 2 7 -6.5 -4 -6.5 4 2 -7 -5.5 -4.5 7 -1z" fill="#e6b422" />}
      {mood === 'surprised' && <g stroke="#e6b422" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="30" x2="28" y2="36" /><line x1="98" y1="30" x2="92" y2="36" /><line x1="60" y1="10" x2="60" y2="18" /></g>}
    </g>
  );
}

const LOOKS: Record<Speaker, Look> = {
  'Pip': {
    skin: '#f2c9a0', brow: '#4a2f20', eyeFill: '#1b1b1f', mouthFill: '#7a2230', mouthStroke: '#7a3b2a',
    collar: <path d="M32 108 Q60 124 88 108 L94 124 L26 124Z" fill="#2a9d8f" />,
    hairFront: (<g fill="#5b3a29"><path d="M25 58 Q20 20 60 18 Q100 20 95 58 Q90 36 60 35 Q32 36 25 58Z" /><path d="M56 21 Q50 4 68 8 Q60 13 66 22Z" /></g>),
    extras: (<g fill="#c98a5e"><circle cx="40" cy="70" r="1.1" /><circle cx="44" cy="73" r="1.1" /><circle cx="36" cy="73" r="1.1" /><circle cx="80" cy="70" r="1.1" /><circle cx="76" cy="73" r="1.1" /><circle cx="84" cy="73" r="1.1" /></g>),
  },
  'Warden Vale': {
    skin: '#d9a77c', brow: '#8b909a', eyeFill: '#1b1b1f', mouthFill: '#6e2230', mouthStroke: '#6e3a2a',
    collar: (<g><path d="M30 108 L50 100 L60 112 L70 100 L90 108 L96 124 L24 124Z" fill="#1f5b3a" /><path d="M50 100 L60 112 L70 100" fill="none" stroke="#d9b02b" strokeWidth="3" /></g>),
    hairFront: (<g><path d="M24 60 Q18 18 60 15 Q102 18 96 60 Q92 32 60 31 Q28 32 24 60Z" fill="#c9ced6" /><path d="M40 24 Q60 14 82 24" fill="none" stroke="#9aa1ad" strokeWidth="3" /><path d="M24 60 L29 76 L31 58Z M96 60 L91 76 L89 58Z" fill="#c9ced6" /></g>),
    extras: (<g><path d="M47 76 Q60 71 73 76 Q66 80 60 78 Q54 80 47 76Z" fill="#b2b8c2" /></g>),
    extrasTop: (<g fill="none" stroke="#35373d" strokeWidth="2.2"><circle cx="46" cy="62" r="10" /><circle cx="74" cy="62" r="10" /><path d="M56 61 Q60 58 64 61" /></g>),
  },
  'Archivist Ines': {
    skin: '#c58f6b', brow: '#d8d4c8', eyeFill: '#1b1b1f', mouthFill: '#6e2230', mouthStroke: '#6a2f2a',
    collar: <path d="M30 108 Q60 126 90 108 L96 124 L24 124Z" fill="#8a3b4a" />,
    hairBack: <circle cx="60" cy="14" r="12" fill="#e8e4da" />,
    hairFront: (<path d="M25 60 Q20 20 60 18 Q100 20 95 60 Q90 34 60 33 Q30 34 25 60Z" fill="#e8e4da" />),
    extras: (<g fill="#e6b422"><circle cx="27" cy="70" r="2.4" /><circle cx="93" cy="70" r="2.4" /></g>),
    extrasTop: (<g fill="none" stroke="#6b4b2a" strokeWidth="2"><rect x="37" y="55" width="18" height="14" rx="4" /><rect x="65" y="55" width="18" height="14" rx="4" /><path d="M55 61 L65 61" /></g>),
  },
  'The Broker': {
    skin: '#e7e3d8', brow: '#b9b4c8', eyeFill: '#0c0b10', hollow: true, mouthFill: '#0c0b10', mouthStroke: '#2b2735',
    hairBack: <path d="M12 124 Q6 22 60 8 Q114 22 108 124Z" fill="#1f1c2a" />,
    collar: <path d="M26 112 Q60 126 94 112 L100 124 L20 124Z" fill="#1f1c2a" />,
    hairFront: (<g><path d="M22 70 Q18 20 60 16 Q102 20 98 70 Q92 36 60 34 Q28 36 22 70Z" fill="#1f1c2a" /></g>),
    extras: (<g fill="none" stroke="#9aa0b4" strokeWidth="1.6" opacity="0.6"><path d="M44 42 Q60 38 76 42" /></g>),
  },
};

export function CharacterFace({ who, mood = 'neutral', size = 120, className = '' }: { who: Speaker; mood?: Emotion; size?: number; className?: string }) {
  const look = LOOKS[who];
  return (
    <svg viewBox="0 0 120 124" width={size} height={size * (124 / 120)} className={className} role="img" aria-label={`${who}, ${mood}`}>
      {look.hairBack}
      {look.collar}
      <rect x="50" y="94" width="20" height="16" rx="6" fill={look.skin} />
      <ellipse cx="26" cy="64" rx="5.5" ry="8" fill={look.skin} /><ellipse cx="94" cy="64" rx="5.5" ry="8" fill={look.skin} />
      <ellipse cx="60" cy="62" rx="34" ry="38" fill={look.skin} stroke="#00000022" strokeWidth="1.5" />
      {look.hairFront}
      {look.extras}
      <Brows mood={mood} look={look} />
      <Eyes mood={mood} look={look} />
      {look.extrasTop}
      <Mouth mood={mood} look={look} />
      <Marks mood={mood} hollow={look.hollow} />
    </svg>
  );
}
