'use client';

/**
 * SpendXP Sound + Haptic Engine
 * Sound: Web Audio API procedural tones (no external assets)
 * Haptics: Capacitor native feedback, no-ops on web
 */

import { haptic } from '@/lib/native';

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function isEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('spendxp_sound') !== 'false';
}

export function toggleSound() {
  const currentState = isEnabled();
  localStorage.setItem('spendxp_sound', (!currentState).toString());
  return !currentState;
}

function playTone(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  const ctx = getCtx();
  if (!ctx || !isEnabled()) return;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * 0.1));
    osc.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  });
}

export const playCorrect = () => {
  playTone([523.25, 659.25], 0.4, 'sine', 0.1);
  haptic('success');
};

export const playWrong = () => {
  playTone([220, 180], 0.3, 'sawtooth', 0.05);
  haptic('error');
};

export const playLevelUp = () => {
  playTone([261.63, 329.63, 392.00, 523.25], 0.8, 'square', 0.05);
  haptic('heavy');
};

export const playCombo = () => {
  playTone([880], 0.1, 'sine', 0.1);
  setTimeout(() => playTone([987.77], 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone([1046.50], 0.1, 'sine', 0.1), 200);
  haptic('medium');
};

export const playCoinEarn = () => {
  playTone([1046.50], 0.2, 'sine', 0.1);
  haptic('light');
};

export const playGameOver = () => {
  playTone([392.00, 329.63, 261.63], 0.6, 'sine', 0.1);
  haptic('warning');
};
