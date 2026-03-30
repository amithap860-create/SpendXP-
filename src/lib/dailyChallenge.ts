import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export interface DailyChallenge {
  userId: string;
  date: string; // YYYY-MM-DD format
  spendLogged: boolean;
  goalReviewed: boolean;
  checklistCompleted: boolean;
  streak: number;
  xp: number;
  completed: boolean;
  createdAt: any;
  updatedAt?: any;
}

export async function getDailyChallenge(userId: string): Promise<DailyChallenge | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    const snap = await getDoc(challengeRef);
    
    if (!snap.exists()) {
      // Create new daily challenge
      const newChallenge: DailyChallenge = {
        userId,
        date: today,
        spendLogged: false,
        goalReviewed: false,
        checklistCompleted: false,
        streak: 1, // Will be updated based on previous day
        xp: 0,
        completed: false,
        createdAt: serverTimestamp()
      };

      // Get yesterday's challenge to calculate streak
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterdayRef = doc(db, 'dailyChallenges', `${userId}_${yesterday}`);
      const yesterdaySnap = await getDoc(yesterdayRef);
      
      if (yesterdaySnap.exists()) {
        const yesterdayData = yesterdaySnap.data() as DailyChallenge;
        if (yesterdayData.completed) {
          newChallenge.streak = yesterdayData.streak + 1;
        } else {
          newChallenge.streak = 1; // Reset streak
        }
      }

      await setDoc(challengeRef, newChallenge);
      return newChallenge;
    }
    
    return snap.data() as DailyChallenge;
  } catch (error) {
    console.error('[SpendXP] Error getting daily challenge:', error);
    return null;
  }
}

export async function updateDailyChallenge(
  userId: string, 
  updates: Partial<DailyChallenge>
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    
    await updateDoc(challengeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('[SpendXP] Error updating daily challenge:', error);
    return false;
  }
}

export async function logSpendingForToday(userId: string): Promise<boolean> {
  const challenge = await getDailyChallenge(userId);
  if (!challenge) return false;
  
  return await updateDailyChallenge(userId, {
    spendLogged: true,
    xp: challenge.xp + 10
  });
}

export async function completeDailyChecklist(userId: string): Promise<boolean> {
  const challenge = await getDailyChallenge(userId);
  if (!challenge) return false;
  
  const isCompleted = challenge.spendLogged && challenge.goalReviewed;
  
  return await updateDailyChallenge(userId, {
    checklistCompleted: true,
    completed: isCompleted,
    xp: isCompleted ? challenge.xp + 30 : challenge.xp
  });
}

export async function getCurrentStreak(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    const snap = await getDoc(challengeRef);
    
    if (snap.exists()) {
      const data = snap.data() as DailyChallenge;
      return data.streak;
    }
    
    return 0;
  } catch (error) {
    console.error('[SpendXP] Error getting current streak:', error);
    return 0;
  }
}
