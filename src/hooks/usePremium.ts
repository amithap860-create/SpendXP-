'use client';

import { useAuthContext } from '@/context/AuthContext';
import { isFeatureAvailable, type PremiumFeature } from '@/config/premium';

/**
 * Hook to check the current user's premium status.
 * For now, premium status is stored in the user's Firestore profile under `isPremium`.
 * Replace with a real subscription check (Stripe, RevenueCat, etc.) when billing is live.
 */
export function usePremium() {
  const { user } = useAuthContext();

  // TODO: Replace with real Firestore subscription check when billing is live.
  // For now, all users are on the free tier unless explicitly flagged.
  const isPremium = false; // will read from Firestore profile later
  const tierId: 'free' | 'premium' = isPremium ? 'premium' : 'free';

  function canAccess(feature: PremiumFeature): boolean {
    return isFeatureAvailable(feature, tierId);
  }

  return {
    isPremium,
    tierId,
    canAccess,
  };
}
