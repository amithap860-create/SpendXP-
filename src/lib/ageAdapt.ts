// Types and utilities for age-adaptive content
export type AgeGroup = 'junior' | 'teen' | 'senior';

export type DifficultyConfig = {
  moneyAmounts: {
    small: number;
    medium: number;
    large: number;
  };
  timePerQuestion: number; // in seconds
  vocabularyLevel: 'simple' | 'standard' | 'advanced';
  showPercentages: boolean;
  showInterestRates: boolean;
  showTaxCalculations: boolean;
};

export function getAgeGroup(birthYear: number): AgeGroup {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age <= 12) return 'junior';
  if (age <= 16) return 'teen';
  return 'senior';
}

export function getDifficultyConfig(group: AgeGroup): DifficultyConfig {
  switch (group) {
    case 'junior':
      return {
        moneyAmounts: { small: 5, medium: 20, large: 100 },
        timePerQuestion: 60,
        vocabularyLevel: 'simple',
        showPercentages: false,
        showInterestRates: false,
        showTaxCalculations: false,
      };
    case 'teen':
      return {
        moneyAmounts: { small: 50, medium: 200, large: 1000 },
        timePerQuestion: 45,
        vocabularyLevel: 'standard',
        showPercentages: true,
        showInterestRates: true,
        showTaxCalculations: false,
      };
    case 'senior':
      return {
        moneyAmounts: { small: 500, medium: 2000, large: 10000 },
        timePerQuestion: 30,
        vocabularyLevel: 'advanced',
        showPercentages: true,
        showInterestRates: true,
        showTaxCalculations: true,
      };
    default:
      return getDifficultyConfig('junior');
  }
}

// Re-export React components and hooks from provider file
export { AgeGroupProvider, useAgeAdapt } from './ageAdaptProvider';
