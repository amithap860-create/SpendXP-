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

  // Reads isPremium from the Firestore user document (loaded in AuthContext).
  // Set users.{uid}.isPremium = true in Firestore to grant premium access.
  // When Stripe/billing is live, update this field via a Cloud Function webhook.
  const isPremium = user?.isPremium ?? false;
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
