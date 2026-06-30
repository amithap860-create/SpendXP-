/**
 * SpendXP Premium Configuration
 * Defines all premium features and their lock status.
 * When a user is on the free tier, LOCKED features show a PremiumGate.
 */

export type PremiumFeature =
  | 'group_play'
  | 'stock_market_sim'
  | 'credit_score_builder'
  | 'streak_shield'
  | 'premium_avatars'
  | 'deep_analytics'
  | 'unlimited_quests'
  | 'shareable_rank_card'
  | 'early_access';

export interface PremiumTier {
  id: 'free' | 'premium';
  name: string;
  price: string;
  billingPeriod: string;
  features: string[];
  lockedFeatures: PremiumFeature[];
}

export const PREMIUM_FEATURES: Record<PremiumFeature, {
  label: string;
  description: string;
  icon: string;
}> = {
  group_play: {
    label: 'Group Play',
    description: 'Challenge friends and compete on leaderboards',
    icon: '👥',
  },
  stock_market_sim: {
    label: 'Stock Market Simulator',
    description: 'Simulate real market conditions and learn to invest',
    icon: '📈',
  },
  credit_score_builder: {
    label: 'Credit Score Builder',
    description: 'Master credit scores and build your financial reputation',
    icon: '💳',
  },
  streak_shield: {
    label: 'Streak Shield',
    description: 'Protect your streak once a week if you miss a day',
    icon: '🛡️',
  },
  premium_avatars: {
    label: 'Exclusive Avatars',
    description: 'Unlock rare characters only available for premium members',
    icon: '✨',
  },
  deep_analytics: {
    label: 'Deep Analytics',
    description: 'Full concept mastery breakdown and spending pattern insights',
    icon: '📊',
  },
  unlimited_quests: {
    label: 'Unlimited Quests',
    description: 'Free tier gets 3 quests/day — premium is fully unlimited',
    icon: '🗂️',
  },
  shareable_rank_card: {
    label: 'Shareable Rank Card',
    description: 'Generate a branded image of your rank for social media',
    icon: '🎖️',
  },
  early_access: {
    label: 'Early Access',
    description: 'Try new games and features before free users',
    icon: '🚀',
  },
};

export const FREE_TIER: PremiumTier = {
  id: 'free',
  name: 'Explorer',
  price: 'Free',
  billingPeriod: 'forever',
  features: [
    '3 quests per day',
    'Budget Blitz & FinIQ Quiz',
    'Money Maze game',
    'Basic dashboard & rank tracking',
    'Order of the Golden Ledger storyline',
    'Daily challenges',
  ],
  lockedFeatures: [
    'group_play',
    'stock_market_sim',
    'credit_score_builder',
    'streak_shield',
    'premium_avatars',
    'deep_analytics',
    'unlimited_quests',
    'shareable_rank_card',
    'early_access',
  ],
};

/**
 * Razorpay pricing — INR only (Razorpay processes INR).
 * Display prices in other currencies are for UI localisation only.
 *
 * Vercel env vars required:
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID   — rzp_live_T7rvEPuehbeRPt
 *   RAZORPAY_KEY_SECRET            — from Razorpay dashboard (keep secret, server-only)
 */
export const RAZORPAY_PLANS = {
  monthly: { amountPaise: 14900, display: '₹149', label: '1 Month' },
  annual:  { amountPaise: 59900, display: '₹599', label: '12 Months · ₹50/mo' },
} as const;

export const PREMIUM_TIER: PremiumTier = {
  id: 'premium',
  name: 'Agent',
  price: '₹149/mo or ₹599/yr',
  billingPeriod: 'monthly or annual',
  features: [
    'Everything in Explorer',
    'Unlimited quests',
    'Stock Market Simulator',
    'Credit Score Builder',
    'Group play & friend challenges',
    'Streak Shield (1× per week)',
    'Exclusive premium avatars',
    'Deep analytics & insights',
    'Shareable rank card for social media',
    'Early access to new features',
  ],
  lockedFeatures: [],
};

/**
 * Check if a feature is available for a given tier.
 * Pass the user's tier ID ('free' | 'premium').
 */
export function isFeatureAvailable(
  feature: PremiumFeature,
  tierId: 'free' | 'premium' = 'free'
): boolean {
  if (tierId === 'premium') return true;
  return !FREE_TIER.lockedFeatures.includes(feature);
}
