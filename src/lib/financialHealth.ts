/**
 * @fileOverview Logic for calculating and labelling the Financial Health Score.
 * This measures the quality of financial decisions rather than just participation.
 */

export type HealthLabel = {
  label: string;
  color: 'red' | 'amber' | 'teal' | 'green';
  description: string;
};

/**
 * Maps a numerical health score (0-100) to a human-readable label and color.
 * @param score Current health score
 * @returns HealthLabel details
 */
export function calculateHealthLabel(score: number): HealthLabel {
  if (score < 25) return {
    label: 'At Risk',
    color: 'red',
    description: 'Your financial decisions need attention. Focus on saving and avoiding debt.'
  };
  if (score < 50) return {
    label: 'Developing',
    color: 'amber',
    description: "You're learning—keep making better choices to build your safety net."
  };
  if (score < 75) return {
    label: 'Stable',
    color: 'teal',
    description: 'Good financial habits are forming. You are well-positioned for growth.'
  };
  return {
    label: 'Thriving',
    color: 'green',
    description: 'Excellent financial decision-making! You are mastering your financial destiny.'
  };
}

/**
 * Clamps a value between 0 and 100.
 */
export function clampHealth(val: number): number {
  return Math.max(0, Math.min(100, val));
}
