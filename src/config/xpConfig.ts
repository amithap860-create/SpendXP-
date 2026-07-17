/**
 * SpendXP — Full XP Award Map
 *
 * Every place in the app where XP is awarded is documented here.
 * When adding a new activity, add its XP entry here too.
 *
 * Sources:
 *  GAME     — useGameEngine (server-written via /api/scores/submit)
 *  CLIENT   — direct Firestore increment from browser (capped/guarded)
 */

// ─── Games ────────────────────────────────────────────────────────────────────
// XP is delta-based: only the amount above previous personal best is credited.
// This prevents infinite farming. Combo bonus (+50) fires on 3 correct in 2.5s.

export const GAME_XP = {
  budgetBlitz: {
    xpPerWin: 200,
    xpPerCorrectAnswer: 5,
    comboBonus: 50,
  },
  finIQ: {
    xpPerWin: 100,
    xpPerCorrectAnswer: 10, // plus question.xpReward bonus per question
    comboBonus: 50,
  },
  moneyMaze: {
    xpPerWin: 250,
    xpPerCorrectAnswer: 0,
    comboBonus: 50,
  },
  stockMarketSim: {
    xpPerWin: 200,
    xpPerCorrectAnswer: 0,
    comboBonus: 50,
  },
  creditScoreBuilder: {
    xpPerWin: 150,
    xpPerCorrectAnswer: 0,
    comboBonus: 50,
  },
} as const;

// ─── Lessons ──────────────────────────────────────────────────────────────────
// Per lesson card — XP is written when completeTask() is called in LessonViewer.
// Each lesson's total XP = sum of its cards' xpReward.

export const LESSON_XP = {
  perCard: 20,          // budgeting, investing
  perCardETF: 30,       // ETF lesson
  perCardCrypto: 25,    // Crypto lesson
  quizBonus: 0,         // currently no bonus for quiz correct — gap identified
} as const;

// ─── Quests ───────────────────────────────────────────────────────────────────
// XP is awarded by the quest engine on completion. Optimal choice rates give bonus.

export const QUEST_XP = {
  firstPaycheck: 300,
  firstApartment: 350,
  phoneEmi: 200,
  emergencyExpense: 300,
  vacationPlanning: 250,
  firstCreditCard: 300,
  calculationsQuest: 400,
} as const;

// ─── Tools (CLIENT) ───────────────────────────────────────────────────────────
// Awarded the first time a user opens each tool. Capped at first-use.

export const TOOL_XP = {
  firstUseEach: 10,     // +10 per unique tool opened (5 tools = up to 50 XP)
} as const;

// ─── Market Page (CLIENT) ─────────────────────────────────────────────────────

export const MARKET_XP = {
  readExplanation: 10,  // "I Got It!" button after news explanation (once per news item)
} as const;

// ─── Resources ────────────────────────────────────────────────────────────────
// Awarded by resourceProgress tracking in the Resource Hub.

export const RESOURCE_XP = {
  perCardExplored: 10,
  completedFramework: 100,
} as const;

// ─── Badges ───────────────────────────────────────────────────────────────────
// Bonus XP awarded when a badge is unlocked (by badgeService.ts).

export const BADGE_XP = {
  firstWin: 50,
  fiveGameStreak: 100,
  budgetMaster: 75,
  debtDestroyer: 100,
  smartInvestor: 100,
  taxWhiz: 75,
  dailyChallenger: 50,
  speedDemon: 50,
  perfectRound: 75,
  financeScholar: 150,
  toolExplorer: 50,
  goalGetter: 75,
  financiallyStable: 200,
  moneyMaster: 200,
  mathsMaster: 100,
  frameworkMaster: 100,
  familyLinked: 50,
  scholar: 150,
} as const;

// ─── Known Gaps (TODO) ────────────────────────────────────────────────────────
// These are places where XP SHOULD be awarded but currently isn't.
// Fix each one by adding the relevant increment call.
//
// 1. Lesson quiz correct answer  → FIXED (2026-07) — LessonViewer.handleFinish now
//    only pays the +20 bonus when selectedQuizIndex === quizCard.correctIndex.
// 2. Onboarding completion       → add +100 XP in onboarding/page.tsx final step
// 3. Daily login streak          → not yet implemented; add login streak counter
// 4. Quest optimal-choice bonus  → audit questEngine for extra bonus on 100% optimal rate
// 5. Profile completion          → add +25 XP when displayName + birthYear set
