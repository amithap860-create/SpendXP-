'use client';

import { useAuthContext } from '@/context/AuthContext';
import { isFeatureAvailable, type PremiumFeature } from '@/config/premium';

/**
 * Hook to check the current user's premium status.
 *
 * Reads isPremium + subscriptionEndAt from the user's Firestore profile
 * (loaded in AuthContext). If subscriptionEndAt is in the past, the user
 * is treated as free even if isPremium is still true in Firestore
 * (the verify-payment route will clean it up server-side on next login).
 */
export function usePremium() {
  const { user } = useAuthContext();

  const rawIsPremium = user?.isPremium ?? false;
  const subscriptionEndAt = user?.subscriptionEndAt ?? null;

  // Check if the subscription has expired client-side
  let isExpired = false;
  if (rawIsPremium && subscriptionEndAt) {
    try {
      isExpired = new Date(subscriptionEndAt) < new Date();
    } catch { /* ignore date parse errors */ }
  }

  const isPremium = rawIsPremium && !isExpired;
  const tierId: 'free' | 'premium' = isPremium ? 'premium' : 'free';

  // How many days until expiry (positive = active, 0 = today, negative = expired)
  let daysLeft: number | null = null;
  if (subscriptionEndAt) {
    try {
      const msLeft = new Date(subscriptionEndAt).getTime() - Date.now();
      daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    } catch { /* ignore */ }
  }

  function canAccess(feature: PremiumFeature): boolean {
    return isFeatureAvailable(feature, tierId);
  }

  return {
    isPremium,
    tierId,
    canAccess,
    daysLeft,
    subscriptionEndAt,
    premiumPlan: user?.premiumPlan ?? null,
  };
}
