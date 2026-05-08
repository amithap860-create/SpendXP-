'use client';

/**
 * AvatarIllustration — Inline SVG portraits for the 12 SpendXP operative archetypes.
 *
 * Each character is a flat, MBTI-style bust portrait designed to render crisply at
 * any size from 40px to 200px. The SVG background is transparent — the parent's
 * gradient provides colour context.
 *
 * Usage:
 *   <AvatarIllustration id="voss" className="w-full h-full" />
 */

import React from 'react';

interface Props {
  id: string;
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Individual SVG character portraits                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

/** VOSS — The Strategist. Slicked hair, thin glasses, turtleneck. */
const Voss = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M6 120V97Q13 83 30 79Q50 73 70 79Q87 83 94 97V120Z" fill="#0f172a"/>
    <path d="M37 91Q50 86 63 91L65 106Q50 110 35 106Z" fill="#1e293b"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="19" rx="4" fill="#f5d5b5"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="30" fill="#f5d5b5"/>
    {/* Hair — slicked back */}
    <path d="M24 43Q24 19 50 17Q76 19 76 43Q70 22 50 20Q30 22 24 43Z" fill="#151525"/>
    {/* Ears */}
    <path d="M24 50Q18 50 17 56Q18 62 24 62L24 58Q22 56 22 53L24 50Z" fill="#e8c59a"/>
    <path d="M76 50Q82 50 83 56Q82 62 76 62L76 58Q78 56 78 53L76 50Z" fill="#e8c59a"/>
    {/* Glasses frames */}
    <rect x="25" y="46" width="20" height="12" rx="2.5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
    <rect x="55" y="46" width="20" height="12" rx="2.5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
    <line x1="45" y1="52" x2="55" y2="52" stroke="#64748b" strokeWidth="1.5"/>
    <line x1="25" y1="52" x2="21" y2="53" stroke="#64748b" strokeWidth="1"/>
    <line x1="75" y1="52" x2="79" y2="53" stroke="#64748b" strokeWidth="1"/>
    {/* Eyes */}
    <circle cx="35" cy="52" r="5" fill="#1e293b"/>
    <circle cx="36.5" cy="50.5" r="1.3" fill="white" opacity="0.75"/>
    <circle cx="65" cy="52" r="5" fill="#1e293b"/>
    <circle cx="66.5" cy="50.5" r="1.3" fill="white" opacity="0.75"/>
    {/* Eyebrows */}
    <path d="M26 43Q35 40 44 42" stroke="#151525" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M56 42Q65 40 74 43" stroke="#151525" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 63Q50 68 53 63" stroke="#c09070" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Mouth — slight smirk */}
    <path d="M41 72Q50 77 60 72" stroke="#9a7050" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** LUNA — The Hustler. Short choppy hair, strong brow, blazer. */
const Luna = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body / blazer */}
    <path d="M6 120V96Q13 82 29 78Q50 72 71 78Q87 82 94 96V120Z" fill="#1c1912"/>
    <path d="M36 93L47 84L50 100L53 84L64 93L68 120H32Z" fill="#252218"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="19" rx="4" fill="#d4956b"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="27" ry="30" fill="#d4956b"/>
    {/* Hair base */}
    <path d="M23 42Q23 17 50 15Q77 17 77 42Q72 21 50 19Q28 21 23 42Z" fill="#2d1510"/>
    {/* Choppy layers */}
    <path d="M23 36Q20 30 23 42L26 35Z" fill="#3a2018"/>
    <path d="M77 36Q80 30 77 42L74 35Z" fill="#3a2018"/>
    <path d="M36 17Q28 21 24 30Q30 22 36 18Z" fill="#3a2018"/>
    <path d="M64 17Q72 21 76 30Q70 22 64 18Z" fill="#3a2018"/>
    {/* Ears */}
    <path d="M23 50Q17 50 16 56Q17 63 23 63L23 59Q21 56 21 53L23 50Z" fill="#c08860"/>
    <path d="M77 50Q83 50 84 56Q83 63 77 63L77 59Q79 56 79 53L77 50Z" fill="#c08860"/>
    {/* Eyes */}
    <ellipse cx="35" cy="52" rx="6" ry="5.5" fill="#1a0a00"/>
    <circle cx="36.5" cy="50.5" r="1.4" fill="white" opacity="0.7"/>
    <ellipse cx="65" cy="52" rx="6" ry="5.5" fill="#1a0a00"/>
    <circle cx="66.5" cy="50.5" r="1.4" fill="white" opacity="0.7"/>
    {/* Strong brows */}
    <path d="M26 42Q35 38 44 41" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M56 41Q65 38 74 42" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 63Q50 69 53 63" stroke="#a06840" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Confident half-smile */}
    <path d="M41 73Q50 79 60 74" stroke="#884832" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** REI — The Minimalist. Smooth black bob, serene half-closed eyes, sage turtleneck. */
const Rei = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M10 120V97Q16 84 30 80Q50 75 70 80Q84 84 90 97V120Z" fill="#14291b"/>
    <path d="M37 90Q50 85 63 90L65 105Q50 109 35 105Z" fill="#1f3d27"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#f0d0b8"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="25" ry="29" fill="#f0d0b8"/>
    {/* Bob hair — framing sides + top */}
    <path d="M25 50Q25 21 50 19Q75 21 75 50Q74 62 72 70Q62 77 50 77Q38 77 28 70Q26 62 25 50Z" fill="#0f0f14"/>
    {/* Face window */}
    <ellipse cx="50" cy="50" rx="23" ry="27" fill="#f0d0b8"/>
    {/* Side panels */}
    <path d="M27 46Q25 38 25 50L27 66Q27 52 27 46Z" fill="#0f0f14"/>
    <path d="M73 46Q75 38 75 50L73 66Q73 52 73 46Z" fill="#0f0f14"/>
    {/* Ears */}
    <path d="M27 50Q21 50 20 55Q21 61 27 61L27 57Q25 55 25 53L27 50Z" fill="#e4c4a4"/>
    <path d="M73 50Q79 50 80 55Q79 61 73 61L73 57Q75 55 75 53L73 50Z" fill="#e4c4a4"/>
    {/* Eyes — hooded/serene */}
    <path d="M30 51Q35 47 40 51Q35 55 30 51Z" fill="#2a3d2a"/>
    <path d="M30 51Q35 49 40 51" stroke="#0f0f14" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M60 51Q65 47 70 51Q65 55 60 51Z" fill="#2a3d2a"/>
    <path d="M60 51Q65 49 70 51" stroke="#0f0f14" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Soft brows */}
    <path d="M29 46Q35 43 41 45" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M59 45Q65 43 71 46" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 62Q50 66 53 62" stroke="#c0a080" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Gentle closed smile */}
    <path d="M43 70Q50 75 57 70" stroke="#9a7860" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/** CIPHER — The Phantom. Hooded figure, only glowing teal eyes visible. */
const Cipher = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M4 120V96Q10 80 28 75Q50 68 72 75Q90 80 96 96V120Z" fill="#050810"/>
    {/* Hoodie body */}
    <path d="M20 96Q28 82 50 78Q72 82 80 96L84 120H16Z" fill="#0d1117"/>
    {/* Hood — large shape covering head */}
    <path d="M10 60Q10 20 50 16Q90 20 90 60Q90 80 82 92Q68 80 50 78Q32 80 18 92Q10 80 10 60Z" fill="#0d1117"/>
    {/* Shadow over face — darkness */}
    <ellipse cx="50" cy="52" rx="26" ry="30" fill="#0a0c10"/>
    {/* Face barely visible — just cheekbones */}
    <path d="M28 60Q32 55 50 54Q68 55 72 60Q66 70 50 72Q34 70 28 60Z" fill="#1a1c22" opacity="0.5"/>
    {/* Glowing eyes */}
    <ellipse cx="36" cy="52" rx="7" ry="5" fill="#00d4a8" opacity="0.15"/>
    <ellipse cx="64" cy="52" rx="7" ry="5" fill="#00d4a8" opacity="0.15"/>
    <ellipse cx="36" cy="52" rx="5" ry="3.5" fill="#00d4a8" opacity="0.4"/>
    <ellipse cx="64" cy="52" rx="5" ry="3.5" fill="#00d4a8" opacity="0.4"/>
    <ellipse cx="36" cy="52" rx="3" ry="2.2" fill="#00ffcc"/>
    <ellipse cx="64" cy="52" rx="3" ry="2.2" fill="#00ffcc"/>
    <circle cx="36" cy="52" r="1.2" fill="white"/>
    <circle cx="64" cy="52" r="1.2" fill="white"/>
    {/* Hood rim detail */}
    <path d="M18 62Q22 52 32 46Q50 40 68 46Q78 52 82 62" stroke="#1e2530" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Hoodie kangaroo pocket */}
    <path d="M36 106Q50 102 64 106L66 120H34Z" fill="#131720" opacity="0.8"/>
  </svg>
);

/** ATLAS — The Architect. Structured side-part, strong jaw, navy jacket. */
const Atlas = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body / jacket */}
    <path d="M6 120V96Q13 82 30 78Q50 72 70 78Q87 82 94 96V120Z" fill="#0f1e3d"/>
    {/* Collar */}
    <path d="M36 92L47 84L50 100L53 84L64 92L68 120H32Z" fill="#162040"/>
    <path d="M47 84L50 100L53 84Q50 82 47 84Z" fill="#1e3060"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="19" rx="4" fill="#f5d0b0"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="30" fill="#f5d0b0"/>
    {/* Hair — structured side part with wave */}
    <path d="M24 43Q24 18 50 16Q76 18 76 43Q72 21 58 19Q44 19 34 22Q26 27 24 43Z" fill="#1a2040"/>
    {/* Side-part detail */}
    <path d="M36 19Q30 24 26 34Q30 24 38 20Z" fill="#252a50"/>
    {/* Ears */}
    <path d="M24 50Q18 50 17 56Q18 62 24 62L24 58Q22 56 22 53L24 50Z" fill="#e8c09a"/>
    <path d="M76 50Q82 50 83 56Q82 62 76 62L76 58Q78 56 78 53L76 50Z" fill="#e8c09a"/>
    {/* Eyes — determined */}
    <ellipse cx="35" cy="52" rx="6" ry="5.5" fill="#0f2860"/>
    <circle cx="36.5" cy="50.5" r="1.4" fill="white" opacity="0.8"/>
    <ellipse cx="65" cy="52" rx="6" ry="5.5" fill="#0f2860"/>
    <circle cx="66.5" cy="50.5" r="1.4" fill="white" opacity="0.8"/>
    {/* Defined brows */}
    <path d="M26 43Q35 39 44 42" stroke="#1a2040" strokeWidth="2" strokeLinecap="round"/>
    <path d="M56 42Q65 39 74 43" stroke="#1a2040" strokeWidth="2" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 63Q50 68 53 63" stroke="#b89070" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Straight confident mouth */}
    <path d="M41 72Q50 75 59 72" stroke="#9a7050" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** NOVA — The Oracle. Long flowing dark hair, star details, wide visionary eyes. */
const Nova = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M8 120V97Q14 83 30 79Q50 73 70 79Q86 83 92 97V120Z" fill="#1a0530"/>
    {/* Draping top */}
    <path d="M34 90Q50 84 66 90L70 120H30Z" fill="#220840"/>
    {/* Long flowing hair — left side */}
    <path d="M24 42Q20 55 18 75Q14 90 18 110Q26 95 28 75Q26 60 24 42Z" fill="#1a0a2e"/>
    {/* Long flowing hair — right side */}
    <path d="M76 42Q80 55 82 75Q86 90 82 110Q74 95 72 75Q74 60 76 42Z" fill="#1a0a2e"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#c8856a"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="30" fill="#c8856a"/>
    {/* Hair — top + framing */}
    <path d="M24 43Q24 18 50 16Q76 18 76 43Q72 22 50 20Q28 22 24 43Z" fill="#1a0a2e"/>
    {/* Ears */}
    <path d="M24 50Q18 50 17 56Q18 62 24 62L24 58Q22 56 22 53L24 50Z" fill="#b87660"/>
    <path d="M76 50Q82 50 83 56Q82 62 76 62L76 58Q78 56 78 53L76 50Z" fill="#b87660"/>
    {/* Stars scattered — 5 point star shapes */}
    <polygon points="12,30 13.5,35 18,35 14.5,38 16,43 12,40 8,43 9.5,38 6,35 10.5,35" fill="#c4a4f0" opacity="0.7" transform="scale(0.6) translate(8,18)"/>
    <circle cx="16" cy="28" r="1.5" fill="#d4b8ff" opacity="0.8"/>
    <circle cx="84" cy="24" r="1" fill="#d4b8ff" opacity="0.9"/>
    <circle cx="88" cy="36" r="1.5" fill="#c4a4f0" opacity="0.7"/>
    <circle cx="12" cy="40" r="1" fill="#d4b8ff" opacity="0.6"/>
    <circle cx="86" cy="58" r="1.2" fill="#d4b8ff" opacity="0.5"/>
    {/* Eyes — wide, slightly unfocused */}
    <ellipse cx="35" cy="51" rx="6.5" ry="6" fill="#3a0a6a"/>
    <ellipse cx="35" cy="51" rx="4" ry="4" fill="#1a0040"/>
    <circle cx="36.5" cy="49.5" r="1.5" fill="white" opacity="0.8"/>
    <ellipse cx="65" cy="51" rx="6.5" ry="6" fill="#3a0a6a"/>
    <ellipse cx="65" cy="51" rx="4" ry="4" fill="#1a0040"/>
    <circle cx="66.5" cy="49.5" r="1.5" fill="white" opacity="0.8"/>
    {/* Soft brows */}
    <path d="M27 43Q35 40 44 42" stroke="#1a0a2e" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 42Q65 40 73 43" stroke="#1a0a2e" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 62Q50 67 53 62" stroke="#a06850" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Soft mouth */}
    <path d="M42 71Q50 76 58 71" stroke="#884840" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/** JADE — The Guardian. Close-cropped hair, broad presence, tactical collar. */
const Jade = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body — broader */}
    <path d="M4 120V95Q10 80 26 75Q50 68 74 75Q90 80 96 95V120Z" fill="#0a1f0f"/>
    {/* Tactical collar */}
    <path d="M30 88Q50 80 70 88L74 120H26Z" fill="#122818"/>
    <path d="M38 88Q50 84 62 88L62 100Q50 104 38 100Z" fill="#1a3420"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="19" rx="4" fill="#9a6040"/>
    {/* Head — slightly broader */}
    <ellipse cx="50" cy="50" rx="28" ry="30" fill="#9a6040"/>
    {/* Close-cropped hair */}
    <path d="M22 44Q22 19 50 17Q78 19 78 44Q76 22 50 20Q24 22 22 44Z" fill="#0a1a0f"/>
    {/* Fade effect on sides */}
    <path d="M22 44Q22 36 24 28Q24 36 26 44Z" fill="#0a1a0f"/>
    <path d="M78 44Q78 36 76 28Q76 36 74 44Z" fill="#0a1a0f"/>
    {/* Ears */}
    <path d="M22 50Q16 50 15 56Q16 63 22 63L22 59Q20 56 20 53L22 50Z" fill="#8a5030"/>
    <path d="M78 50Q84 50 85 56Q84 63 78 63L78 59Q80 56 80 53L78 50Z" fill="#8a5030"/>
    {/* Eyes — steady, level */}
    <ellipse cx="35" cy="52" rx="6.5" ry="5.5" fill="#0a2a14"/>
    <circle cx="36.5" cy="50.5" r="1.5" fill="white" opacity="0.8"/>
    <ellipse cx="65" cy="52" rx="6.5" ry="5.5" fill="#0a2a14"/>
    <circle cx="66.5" cy="50.5" r="1.5" fill="white" opacity="0.8"/>
    {/* Strong defined brows */}
    <path d="M24 42Q35 38 46 41" stroke="#0a1a0f" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M54 41Q65 38 76 42" stroke="#0a1a0f" strokeWidth="2.2" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M46 63Q50 69 54 63" stroke="#7a4828" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Firm steady mouth */}
    <path d="M40 72Q50 75 60 72" stroke="#6a3820" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

/** STORM — The Rebel. Wild spiky platinum hair, sharp electric eyes. */
const Storm = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M6 120V96Q12 82 28 78Q50 72 72 78Q88 82 94 96V120Z" fill="#0a1a2e"/>
    {/* Asymmetric jacket */}
    <path d="M32 92L46 84L50 100L50 120H26Z" fill="#0f2040"/>
    <path d="M68 92L54 84L50 100L50 120H74Z" fill="#0d1a38"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#f8e8e0"/>
    {/* Head */}
    <ellipse cx="50" cy="52" rx="24" ry="28" fill="#f8e8e0"/>
    {/* Spiky hair — wild platinum/white */}
    {/* Base hair volume */}
    <ellipse cx="50" cy="36" rx="22" ry="18" fill="#e8e8f8"/>
    {/* Individual spikes */}
    <path d="M50 18L46 2L48 18Z" fill="#e0e0f0"/>
    <path d="M50 18L54 2L52 18Z" fill="#e0e0f0"/>
    <path d="M42 22L34 8L40 22Z" fill="#e0e0f0"/>
    <path d="M58 22L66 8L60 22Z" fill="#e0e0f0"/>
    <path d="M34 30L22 18L32 30Z" fill="#e0e0f0"/>
    <path d="M66 30L78 18L68 30Z" fill="#e0e0f0"/>
    <path d="M30 40L16 32L28 40Z" fill="#dcdcf0"/>
    <path d="M70 40L84 32L72 40Z" fill="#dcdcf0"/>
    {/* Ears */}
    <path d="M26 52Q20 52 19 57Q20 63 26 63L26 59Q24 57 24 55L26 52Z" fill="#f0d8d0"/>
    <path d="M74 52Q80 52 81 57Q80 63 74 63L74 59Q76 57 76 55L74 52Z" fill="#f0d8d0"/>
    {/* Eyes — sharp, electric */}
    <path d="M28 50Q35 45 42 50Q35 56 28 50Z" fill="#0a3a8a"/>
    <path d="M28 50Q35 47 42 50" stroke="#0a1a60" strokeWidth="1.4" strokeLinecap="round"/>
    <ellipse cx="35" cy="51" rx="3.5" ry="3" fill="#0050cc"/>
    <circle cx="36" cy="50" r="1.2" fill="white" opacity="0.9"/>
    <path d="M58 50Q65 45 72 50Q65 56 58 50Z" fill="#0a3a8a"/>
    <path d="M58 50Q65 47 72 50" stroke="#0a1a60" strokeWidth="1.4" strokeLinecap="round"/>
    <ellipse cx="65" cy="51" rx="3.5" ry="3" fill="#0050cc"/>
    <circle cx="66" cy="50" r="1.2" fill="white" opacity="0.9"/>
    {/* Sharp angular brows */}
    <path d="M27 43Q35 38 43 42" stroke="#2a2a60" strokeWidth="2" strokeLinecap="round"/>
    <path d="M57 42Q65 38 73 43" stroke="#2a2a60" strokeWidth="2" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 63Q50 67 53 63" stroke="#d0a898" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Smirk / edge */}
    <path d="M41 72Q44 76 50 74Q55 72 60 73" stroke="#b08878" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Lightning accent */}
    <path d="M88 20L84 28L87 28L83 38" stroke="#60a8ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

/** FINN — The Scholar. Round wire glasses, wavy tousled warm-brown hair. */
const Finn = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body — layered jacket */}
    <path d="M8 120V97Q14 83 30 79Q50 73 70 79Q86 83 92 97V120Z" fill="#1c1208"/>
    {/* Inner layer */}
    <path d="M36 92Q50 87 64 92L66 120H34Z" fill="#2a1c0c"/>
    <path d="M44 90Q50 87 56 90L56 102Q50 105 44 102Z" fill="#3a2818"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#f0cc9a"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="30" fill="#f0cc9a"/>
    {/* Wavy tousled hair — warm honey brown */}
    <path d="M24 42Q24 18 50 16Q76 18 76 42Q72 22 62 18Q50 15 38 18Q28 21 24 42Z" fill="#8b5e3c"/>
    {/* Tousled texture — waves */}
    <path d="M24 38Q28 30 34 28Q30 34 28 40Z" fill="#7a5030"/>
    <path d="M76 38Q72 30 66 28Q70 34 72 40Z" fill="#7a5030"/>
    <path d="M38 17Q34 20 30 26Q36 20 40 17Z" fill="#9a6a40"/>
    <path d="M62 17Q66 20 70 26Q64 20 60 17Z" fill="#9a6a40"/>
    {/* Slight wave flop at forehead */}
    <path d="M38 24Q44 20 50 21Q46 24 40 26Z" fill="#9a6a40"/>
    {/* Ears */}
    <path d="M24 50Q18 50 17 56Q18 62 24 62L24 58Q22 56 22 53L24 50Z" fill="#e0b888"/>
    <path d="M76 50Q82 50 83 56Q82 62 76 62L76 58Q78 56 78 53L76 50Z" fill="#e0b888"/>
    {/* Round wire glasses */}
    <circle cx="35" cy="52" r="9" fill="none" stroke="#b8860b" strokeWidth="1.3"/>
    <circle cx="65" cy="52" r="9" fill="none" stroke="#b8860b" strokeWidth="1.3"/>
    <line x1="44" y1="52" x2="56" y2="52" stroke="#b8860b" strokeWidth="1.3"/>
    <line x1="26" y1="52" x2="22" y2="53" stroke="#b8860b" strokeWidth="1"/>
    <line x1="74" y1="52" x2="78" y2="53" stroke="#b8860b" strokeWidth="1"/>
    {/* Eyes behind glasses */}
    <circle cx="35" cy="52" r="5" fill="#3d2008"/>
    <circle cx="36.5" cy="50.5" r="1.3" fill="white" opacity="0.8"/>
    <circle cx="65" cy="52" r="5" fill="#3d2008"/>
    <circle cx="66.5" cy="50.5" r="1.3" fill="white" opacity="0.8"/>
    {/* Slightly raised curious brows */}
    <path d="M26 43Q35 39 44 42" stroke="#5a3010" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 42Q65 39 74 43" stroke="#5a3010" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 63Q50 68 53 63" stroke="#c0a068" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Thoughtful gentle smile */}
    <path d="M42 72Q50 77 58 72" stroke="#9a7840" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/** ZEN — The Nomad. Hair tied up in a bun, calm half-smile, minimal look. */
const Zen = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body — minimal */}
    <path d="M10 120V97Q16 84 30 80Q50 74 70 80Q84 84 90 97V120Z" fill="#1a2a0a"/>
    <path d="M38 90Q50 85 62 90L64 120H36Z" fill="#243414"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#f0dcc8"/>
    {/* Head */}
    <ellipse cx="50" cy="51" rx="25" ry="29" fill="#f0dcc8"/>
    {/* Short sides */}
    <path d="M25 46Q25 22 50 20Q75 22 75 46Q72 25 50 23Q28 25 25 46Z" fill="#1a1a1a"/>
    {/* Bun on top */}
    <circle cx="50" cy="18" r="8" fill="#1a1a1a"/>
    <ellipse cx="50" cy="22" rx="6" ry="4" fill="#252525"/>
    {/* Bun holder */}
    <rect x="46" y="22" width="8" height="2" rx="1" fill="#2a5a2a"/>
    {/* Ears — visible */}
    <path d="M25 50Q19 50 18 56Q19 62 25 62L25 58Q23 56 23 53L25 50Z" fill="#e4cca8"/>
    <path d="M75 50Q81 50 82 56Q81 62 75 62L75 58Q77 56 77 53L75 50Z" fill="#e4cca8"/>
    {/* Small earrings */}
    <circle cx="19" cy="57" r="1.5" fill="#4a8a4a"/>
    <circle cx="81" cy="57" r="1.5" fill="#4a8a4a"/>
    {/* Eyes — calm, squinting in a smile */}
    <path d="M29 51Q35 47 41 51Q35 55 29 51Z" fill="#2a3a2a"/>
    <path d="M29 51Q35 49 41 51" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M59 51Q65 47 71 51Q65 55 59 51Z" fill="#2a3a2a"/>
    <path d="M59 51Q65 49 71 51" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Relaxed brows */}
    <path d="M29 45Q35 43 41 44" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M59 44Q65 43 71 45" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M47 62Q50 66 53 62" stroke="#c0a888" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Genuine calm smile */}
    <path d="M42 70Q50 76 58 70" stroke="#9a8060" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M42 70Q44 73 50 74Q56 73 58 70" fill="#d4aa88" opacity="0.3"/>
  </svg>
);

/** ECHO — The Connector. Big voluminous curly hair, wide warm smile. */
const Echo = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M8 120V97Q14 83 30 79Q50 73 70 79Q86 83 92 97V120Z" fill="#2a0a18"/>
    {/* Fun collar detail */}
    <path d="M36 92Q50 86 64 92L68 120H32Z" fill="#380e22"/>
    <path d="M40 91Q50 87 60 91Q58 98 50 100Q42 98 40 91Z" fill="#4a1430"/>
    {/* Big voluminous curly hair — extends wide */}
    <ellipse cx="50" cy="40" rx="36" ry="28" fill="#5a2a1a"/>
    {/* Curly texture — multiple circles */}
    <circle cx="20" cy="42" r="8" fill="#4a2012"/>
    <circle cx="14" cy="36" r="7" fill="#5a2a1a"/>
    <circle cx="24" cy="28" r="9" fill="#4a2012"/>
    <circle cx="80" cy="42" r="8" fill="#4a2012"/>
    <circle cx="86" cy="36" r="7" fill="#5a2a1a"/>
    <circle cx="76" cy="28" r="9" fill="#4a2012"/>
    <circle cx="38" cy="18" r="8" fill="#4a2012"/>
    <circle cx="50" cy="14" r="9" fill="#5a2a1a"/>
    <circle cx="62" cy="18" r="8" fill="#4a2012"/>
    <circle cx="32" cy="26" r="7" fill="#5a2a1a"/>
    <circle cx="68" cy="26" r="7" fill="#5a2a1a"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#cc8060"/>
    {/* Head */}
    <ellipse cx="50" cy="52" rx="24" ry="28" fill="#cc8060"/>
    {/* Ears */}
    <path d="M26 52Q20 52 19 58Q20 64 26 64L26 60Q24 58 24 55L26 52Z" fill="#b87050"/>
    <path d="M74 52Q80 52 81 58Q80 64 74 64L74 60Q76 58 76 55L74 52Z" fill="#b87050"/>
    {/* Eyes — wide, expressive */}
    <ellipse cx="36" cy="52" rx="6.5" ry="6" fill="#2a0808"/>
    <ellipse cx="36" cy="52" rx="4.5" ry="4.5" fill="#1a0404"/>
    <circle cx="37.5" cy="50.5" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="36.5" cy="54" r="0.8" fill="white" opacity="0.4"/>
    <ellipse cx="64" cy="52" rx="6.5" ry="6" fill="#2a0808"/>
    <ellipse cx="64" cy="52" rx="4.5" ry="4.5" fill="#1a0404"/>
    <circle cx="65.5" cy="50.5" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="64.5" cy="54" r="0.8" fill="white" opacity="0.4"/>
    {/* Warm brows */}
    <path d="M28 44Q36 40 44 43" stroke="#2a0808" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M56 43Q64 40 72 44" stroke="#2a0808" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M46 63Q50 68 54 63" stroke="#a05838" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Big genuine smile */}
    <path d="M38 72Q50 80 62 72" stroke="#7a3820" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M38 72Q44 78 50 79Q56 78 62 72Q56 76 50 77Q44 76 38 72Z" fill="#dd9070" opacity="0.5"/>
  </svg>
);

/** BLAZE — The Alchemist. Dramatically swept auburn hair, intense gaze, high collar. */
const Blaze = () => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body — high collar */}
    <path d="M6 120V95Q12 80 28 76Q50 70 72 76Q88 80 94 95V120Z" fill="#1a0500"/>
    {/* High collar */}
    <path d="M32 88Q50 80 68 88L72 120H28Z" fill="#250800"/>
    <path d="M36 86Q50 80 64 86L64 96Q50 100 36 96Z" fill="#320a00"/>
    <path d="M40 84Q50 80 60 84L60 92Q50 95 40 92Z" fill="#420e00"/>
    {/* Neck */}
    <rect x="43" y="74" width="14" height="18" rx="4" fill="#b07050"/>
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="30" fill="#b07050"/>
    {/* Hair — swept dramatically to right */}
    {/* Main sweep */}
    <path d="M24 44Q24 18 50 16Q76 18 76 44Q74 22 60 17Q46 14 34 19Q26 24 24 44Z" fill="#5a1a0a"/>
    {/* Dramatic rightward sweep */}
    <path d="M60 17Q72 20 82 32Q88 42 84 54Q80 42 74 32Q68 22 60 17Z" fill="#5a1a0a"/>
    <path d="M74 32Q82 44 80 58Q78 44 74 32Z" fill="#6a2010"/>
    {/* Motion lines for energy */}
    <path d="M76 28Q84 38 82 50" stroke="#7a2a10" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M80 30Q88 42 86 55" stroke="#6a2008" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
    {/* Ear left — partially covered by hair */}
    <path d="M24 50Q18 50 17 56Q18 62 24 62L24 58Q22 56 22 53L24 50Z" fill="#9a6040"/>
    {/* Eyes — intense, piercing */}
    <path d="M27 50Q35 44 43 50Q35 56 27 50Z" fill="#3a1200"/>
    <path d="M27 50Q35 47 43 50" stroke="#1a0600" strokeWidth="1.4" strokeLinecap="round"/>
    <ellipse cx="35" cy="51" rx="4" ry="3.5" fill="#200800"/>
    <circle cx="36" cy="50" r="1.3" fill="white" opacity="0.85"/>
    <path d="M57 50Q65 44 73 50Q65 56 57 50Z" fill="#3a1200"/>
    <path d="M57 50Q65 47 73 50" stroke="#1a0600" strokeWidth="1.4" strokeLinecap="round"/>
    <ellipse cx="65" cy="51" rx="4" ry="3.5" fill="#200800"/>
    <circle cx="66" cy="50" r="1.3" fill="white" opacity="0.85"/>
    {/* Intense furrowed brows */}
    <path d="M26 43Q35 39 43 42" stroke="#2a0800" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M57 42Q65 39 74 43" stroke="#2a0800" strokeWidth="2.2" strokeLinecap="round"/>
    {/* Slight inner brow furrow */}
    <path d="M41 43Q43 41 45 42" stroke="#2a0800" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M55 42Q57 41 59 43" stroke="#2a0800" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M46 63Q50 69 54 63" stroke="#8a5030" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Determined mouth — slightly open */}
    <path d="M40 72Q50 77 60 72" stroke="#6a3010" strokeWidth="1.6" strokeLinecap="round"/>
    {/* Fire flicker accent */}
    <path d="M8 50L10 42L12 48L14 38L16 46L18 36L16 50Z" fill="#ff6820" opacity="0.5"/>
    <path d="M10 44L12 38L14 44Z" fill="#ffaa40" opacity="0.6"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Map + component                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

const ILLUSTRATIONS: Record<string, React.FC> = {
  voss: Voss,
  luna: Luna,
  rei: Rei,
  cipher: Cipher,
  atlas: Atlas,
  nova: Nova,
  jade: Jade,
  storm: Storm,
  finn: Finn,
  zen: Zen,
  echo: Echo,
  blaze: Blaze,
};

export default function AvatarIllustration({ id, className = 'w-full h-full' }: Props) {
  const Illustration = ILLUSTRATIONS[id];
  if (!Illustration) return null;
  return (
    <span className={className} aria-hidden="true">
      <Illustration />
    </span>
  );
}
