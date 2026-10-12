import type { RetirementInput } from './types';

export const DEFAULT_RETIREMENT_INPUT: RetirementInput = {
  currentAge: 27, retirementAge: 65, currentSavings: 100000,
  monthlyContribution: 10000, annualReturn: 7, retirementGoal: 10000000,
  contributionIncrease: 0, inflation: 3,
};
export const EXTRA_CONTRIBUTION_OPTIONS = [0, 2500, 5000, 10000];
export const MAX_RETIREMENT_AMOUNT = 1e12;
