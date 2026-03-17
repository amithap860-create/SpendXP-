'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useUser, db, safeGetDoc, safeSetDoc } from '@/firebase';
import { playCorrect, playWrong, playGameOver, playCombo } from '@/lib/sounds';
import { validateScore, validateXP } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';
import { getRefreshedToken } from '@/lib/authHelpers';
import { doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { updateLeaderboardEntry } from '@/lib/progressionService';
import { waitForAuth } from '@/lib/waitForAuth';
import { fireConfettiPersonalBest } from '@/lib/confetti';

export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'RESULTS';

export interface GameConfig {
  gameName: 'budgetBlitz' | 'finIQ' | 'moneyMaze' | 'stockMarketSim' | 'creditScoreBuilder' | 'compoundClicker';
  totalRounds: number;
  timePerRound?: number;
  livesEnabled: boolean;
  xpPerWin: number;
  xpPerCorrectAnswer: number;
}

interface GameState {
  status: GameStatus;
  score: number;
  xpEarned: number;
  lives: number;
  currentRound: number;
  timeLeft: number;
  streak: number;
  bestStreak: number;
  comboActive: boolean;
  correctAnswerTimestamps: number[];
  countdown: number;
}

type Action =
  | { type: 'START_COUNTDOWN' }
  | { type: 'START_PLAYING'; timePerRound?: number }
  | { type: 'TICK' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'CORRECT_ANSWER'; bonusXp?: number; xpPerCorrectAnswer: number }
  | { type: 'WRONG_ANSWER'; livesEnabled: boolean }
  | { type: 'NEXT_ROUND'; totalRounds: number; timePerRound?: number; xpPerWin: number }
  | { type: 'SET_SCORE'; score: number }
  | { type: 'END_GAME' }
  | { type: 'RESET_COMBO' }
  | { type: 'RESET_GAME'; config: GameConfig };

const initialState = (config: GameConfig): GameState => ({
  status: 'IDLE',
  score: 0,
  xpEarned: 0,
  lives: 3,
  currentRound: 1,
  timeLeft: config.timePerRound ?? 0,
  streak: 0,
  bestStreak: 0,
  comboActive: false,
  correctAnswerTimestamps: [],
  countdown: 3,
});

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_COUNTDOWN':
      return { ...state, status: 'COUNTDOWN', countdown: 3 };
    case 'COUNTDOWN_TICK':
      if (state.countdown <= 1) return { ...state, status: 'PLAYING', countdown: 0 };
      return { ...state, countdown: state.countdown - 1 };
    case 'SET_TIME':
      return { ...state, timeLeft: action.payload };
    case 'TIMER_EXPIRED':
      return { ...state, timeLeft: 0 };
    case 'PAUSE': return { ...state, status: 'PAUSED' };
    case 'RESUME': return { ...state, status: 'PLAYING' };
    case 'CORRECT_ANSWER': {
      const now = Date.now();
      const newTimestamps = [...state.correctAnswerTimestamps, now].slice(-3);
      let comboBonus = 0;
      let comboActive = false;
      if (newTimestamps.length === 3 && now - newTimestamps[0] <= 2500) {
        comboBonus = 50;
        comboActive = true;
        playCombo();
      } else {
        playCorrect();
      }
      const totalXpGain = action.xpPerCorrectAnswer + (action.bonusXp || 0) + comboBonus;
      const newStreak = state.streak + 1;
      return {
        ...state,
        score: state.score + 1,
        xpEarned: state.xpEarned + totalXpGain,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
        correctAnswerTimestamps: newTimestamps,
        comboActive: comboActive || state.comboActive,
      };
    }
    case 'WRONG_ANSWER': {
      playWrong();
      const newLives = action.livesEnabled ? state.lives - 1 : state.lives;
      const shouldGameOver = action.livesEnabled && newLives <= 0;
      if (shouldGameOver) playGameOver();
      return {
        ...state,
        lives: newLives,
        streak: 0,
        status: shouldGameOver ? 'GAME_OVER' : state.status,
      };
    }
    case 'SET_SCORE': return { ...state, score: action.score };
    case 'NEXT_ROUND':
      if (state.currentRound >= action.totalRounds) {
        return { ...state, status: 'RESULTS', xpEarned: state.xpEarned + action.xpPerWin };
      }
      return { ...state, currentRound: state.currentRound + 1, timeLeft: action.timePerRound ?? 0, streak: 0 };
    case 'END_GAME': return { ...state, status: 'RESULTS' };
    case 'RESET_COMBO': return { ...state, comboActive: false };
    case 'RESET_GAME': return initialState(action.config);
    default: return state;
  }
}

export function useGameEngine(config: GameConfig) {
  const { user: hookUser } = useUser();
  const [state, dispatch] = useReducer(gameReducer, config, initialState);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const hasEnded = useRef(false);
  
  const timerStartRef = useRef<number>(0);
  const timerDurationRef = useRef<number>(0);

  const startTimer = useCallback((durationSeconds: number) => {
    timerStartRef.current = Date.now();
    timerDurationRef.current = durationSeconds * 1000;
  }, []);

  useEffect(() => {
    if (state.status === 'PLAYING' && config.timePerRound !== undefined) {
      startTimer(state.timeLeft);
    }
  }, [state.status, config.timePerRound, state.currentRound, startTimer, state.timeLeft]);

  useEffect(() => {
    if (state.status !== 'PLAYING') return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartRef.current;
      const remaining = Math.max(0, timerDurationRef.current - elapsed);
      const remainingSeconds = Math.ceil(remaining / 1000);
      
      dispatch({ type: 'SET_TIME', payload: remainingSeconds });
      
      if (remaining <= 0) {
        clearInterval(interval);
        dispatch({ type: 'TIMER_EXPIRED' });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'COUNTDOWN') {
      const interval = setInterval(() => {
        dispatch({ type: 'COUNTDOWN_TICK' });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.status]);

  useEffect(() => {
    if (state.comboActive) {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => dispatch({ type: 'RESET_COMBO' }), 1500);
    }
    return () => { if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current); };
  }, [state.comboActive]);

  const startGame = useCallback(() => {
    hasEnded.current = false;
    dispatch({ type: 'RESET_GAME', config });
    dispatch({ type: 'START_COUNTDOWN' });
  }, [config]);

  const pauseGame = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resumeGame = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const setScore = useCallback((score: number) => dispatch({ type: 'SET_SCORE', score }), []);
  const correctAnswer = useCallback((bonusXp?: number) => dispatch({ type: 'CORRECT_ANSWER', bonusXp, xpPerCorrectAnswer: config.xpPerCorrectAnswer }), [config.xpPerCorrectAnswer]);
  const wrongAnswer = useCallback(() => dispatch({ type: 'WRONG_ANSWER', livesEnabled: config.livesEnabled }), [config.livesEnabled]);
  const nextRound = useCallback(() => dispatch({ type: 'NEXT_ROUND', totalRounds: config.totalRounds, timePerRound: config.timePerRound, xpPerWin: config.xpPerWin }), [config.totalRounds, config.timePerRound, config.xpPerWin]);

  const endGame = useCallback(async (finalXpBonus = 0) => {
    const user = await waitForAuth();
    if (!user || hasEnded.current) return { isHighScore: false };
    hasEnded.current = true;

    const safeScore = Math.max(0, state.score);
    const safeXP = Math.max(0, state.xpEarned + finalXpBonus);

    const allowed = rateLimiter.check({
      key: `game:${config.gameName}:score`,
      maxCalls: 1,
      windowMs: 30000
    });
    if (!allowed) return { isHighScore: false };

    const scoreVal = validateScore(config.gameName, safeScore);
    const xpVal = validateXP(safeXP);
    if (!scoreVal.valid || !xpVal.valid) return { isHighScore: false };

    dispatch({ type: 'END_GAME' });

    // Celebration
    fireConfettiPersonalBest();

    try {
      const gameScoreRef = doc(db, 'users', user.uid, 'gameScores', config.gameName);
      const prevDoc = await safeGetDoc(gameScoreRef);
      const prevXP = prevDoc?.xpEarned ?? 0;
      const xpDelta = Math.max(0, safeXP - prevXP);

      const batch = writeBatch(db);
      const progressionRef = doc(db, 'users', user.uid, 'progression', 'stats');
      
      batch.set(gameScoreRef, {
        gameName: config.gameName,
        lastScore: safeScore,
        highScore: increment(0),
        xpEarned: safeXP,
        lastPlayedAt: serverTimestamp(),
      }, { merge: true });

      batch.set(progressionRef, {
        totalXP: increment(xpDelta),
        lastActivityAt: serverTimestamp(),
      }, { merge: true });

      await batch.commit();
      await updateLeaderboardEntry(user.uid, user.displayName || 'Strategist');
      
      return { isHighScore: true };
    } catch (error) {
      console.error('[SpendXP] Failed to submit score:', error);
      return { isHighScore: false };
    }
  }, [config, state.score, state.xpEarned]);

  return {
    gameState: state.status,
    score: state.score,
    xpEarned: state.xpEarned,
    lives: state.lives,
    currentRound: state.currentRound,
    timeLeft: state.timeLeft,
    streak: state.streak,
    bestStreak: state.bestStreak,
    comboActive: state.comboActive,
    countdown: state.countdown,
    startGame,
    pauseGame,
    resumeGame,
    setScore,
    correctAnswer,
    wrongAnswer,
    nextRound,
    endGame,
  };
}
