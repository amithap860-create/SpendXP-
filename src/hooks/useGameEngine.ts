'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, increment, writeBatch, serverTimestamp, arrayUnion, collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { playCorrect, playWrong, playGameOver, playCombo } from '@/lib/sounds';

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
      if (state.countdown <= 1) {
        return { ...state, status: 'PLAYING', countdown: 0 };
      }
      return { ...state, countdown: state.countdown - 1 };

    case 'TICK':
      if (state.status !== 'PLAYING') return state;
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

    case 'PAUSE':
      return { ...state, status: 'PAUSED' };

    case 'RESUME':
      return { ...state, status: 'PLAYING' };

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

    case 'SET_SCORE':
      return { ...state, score: action.score };

    case 'NEXT_ROUND':
      if (state.currentRound >= action.totalRounds) {
        return {
          ...state,
          status: 'RESULTS',
          xpEarned: state.xpEarned + action.xpPerWin,
        };
      }
      return {
        ...state,
        currentRound: state.currentRound + 1,
        timeLeft: action.timePerRound ?? 0,
        streak: 0,
      };

    case 'END_GAME':
      return { ...state, status: 'RESULTS' };

    case 'RESET_COMBO':
      return { ...state, comboActive: false };

    case 'RESET_GAME':
      return initialState(action.config);

    default:
      return state;
  }
}

export function useGameEngine(config: GameConfig) {
  const db = useFirestore();
  const { user } = useUser();
  const [state, dispatch] = useReducer(gameReducer, config, initialState);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.status !== 'PLAYING' && state.status !== 'COUNTDOWN') return;

    const intervalId = setInterval(() => {
      if (state.status === 'COUNTDOWN') {
        dispatch({ type: 'COUNTDOWN_TICK' });
      } else if (state.status === 'PLAYING' && config.timePerRound !== undefined) {
        dispatch({ type: 'TICK' });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [state.status, config.timePerRound]);

  useEffect(() => {
    if (state.comboActive) {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RESET_COMBO' });
      }, 1500);
    }
    return () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, [state.comboActive]);

  const startGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME', config });
    dispatch({ type: 'START_COUNTDOWN' });
  }, [config]);

  const pauseGame = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resumeGame = useCallback(() => dispatch({ type: 'RESUME' }), []);

  const setScore = useCallback((score: number) => {
    dispatch({ type: 'SET_SCORE', score });
  }, []);

  const correctAnswer = useCallback((bonusXp?: number) => {
    dispatch({
      type: 'CORRECT_ANSWER',
      bonusXp,
      xpPerCorrectAnswer: config.xpPerCorrectAnswer
    });
  }, [config.xpPerCorrectAnswer]);

  const wrongAnswer = useCallback(() => {
    dispatch({
      type: 'WRONG_ANSWER',
      livesEnabled: config.livesEnabled
    });
  }, [config.livesEnabled]);

  const nextRound = useCallback(() => {
    dispatch({
      type: 'NEXT_ROUND',
      totalRounds: config.totalRounds,
      timePerRound: config.timePerRound,
      xpPerWin: config.xpPerWin
    });
  }, [config.totalRounds, config.timePerRound, config.xpPerWin]);

  const endGame = useCallback(async (finalXpBonus = 0, metadata: any = {}) => {
    if (!user || !db) return { isHighScore: false };
    
    dispatch({ type: 'END_GAME' });

    const sessionXp = state.xpEarned + finalXpBonus;
    const walletReward = state.score * 10;
    const batch = writeBatch(db);
    
    const gameScoreRef = doc(db, 'users', user.uid, 'gameScores', config.gameName);
    const progressionRef = doc(db, 'users', user.uid, 'progression', 'stats');
    const userRootRef = doc(db, 'users', user.uid);
    const activityLogRef = doc(collection(db, 'users', user.uid, 'activityLog'));

    try {
      const gameSnap = await getDoc(gameScoreRef);
      const existingGameData = gameSnap.exists() ? gameSnap.data() : { highScore: 0 };
      const isHighScore = state.score > (existingGameData.highScore || 0);
      const newHighScore = Math.max(existingGameData.highScore || 0, state.score);

      // Path 1: Per-game scores
      batch.set(gameScoreRef, {
        lastScore: state.score,
        highScore: newHighScore,
        xpEarned: increment(sessionXp),
        gamesPlayed: increment(1),
        lastPlayedAt: serverTimestamp(),
        scoreHistory: arrayUnion(state.score),
        ...metadata // Extra fields like categoryAccuracy
      }, { merge: true });

      const highScoreKeyMap: Record<string, string> = {
        budgetBlitz: 'budgetBlitz',
        finIQ: 'finIQQuiz',
        moneyMaze: 'moneyMaze',
        stockMarketSim: 'stockMarketSim',
        creditScoreBuilder: 'creditScoreBuilder',
        compoundClicker: 'compoundClicker'
      };

      const highScoresKey = highScoreKeyMap[config.gameName];

      // Badge Logic
      const newBadges: string[] = [];
      if (!gameSnap.exists()) newBadges.push('first-win');
      if (state.score === config.totalRounds && config.totalRounds > 0) newBadges.push('perfect-round');
      if (state.bestStreak >= 5) newBadges.push('streak-5');

      // Path 2: Aggregated progression
      batch.set(progressionRef, {
        totalXP: increment(sessionXp),
        totalGamesPlayed: increment(1),
        walletBalance: increment(walletReward),
        lastActivityAt: serverTimestamp(),
        badges: arrayUnion(...newBadges),
        gameHighScores: {
          [highScoresKey]: newHighScore
        }
      }, { merge: true });

      // Activity Log for parent
      batch.set(activityLogRef, {
        gameName: config.gameName,
        score: state.score,
        xpEarned: sessionXp,
        playedAt: serverTimestamp()
      });

      // Update root user XP
      batch.update(userRootRef, {
        xp: increment(sessionXp)
      });

      await batch.commit();
      return { isHighScore };
    } catch (error) {
      console.error('Failed to save game results via batch:', error);
      return { isHighScore: false };
    }
  }, [db, user, config, state.score, state.xpEarned, state.bestStreak]);

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
