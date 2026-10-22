import { MAX_RETIREMENT_AMOUNT } from '../constants';
import type { RetirementInput, RetirementProjection, RetirementValidation, RetirementYear } from '../types';

export function validateRetirementInput(input: RetirementInput): RetirementValidation {
  const errors: RetirementValidation = {};
  const ranges = [
    ['currentAge', 0, 119, 'Current age'], ['retirementAge', 1, 120, 'Retirement age'],
    ['currentSavings', 0, MAX_RETIREMENT_AMOUNT, 'Current savings'],
    ['monthlyContribution', 0, MAX_RETIREMENT_AMOUNT, 'Monthly contribution'],
    ['retirementGoal', 0.01, MAX_RETIREMENT_AMOUNT, 'Retirement goal'],
    ['annualReturn', -50, 50, 'Expected annual return'],
    ['contributionIncrease', 0, 20, 'Annual contribution increase'],
    ['inflation', 0, 20, 'Inflation'],
  ] as const;
  for (const [key, min, max, label] of ranges) {
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) {
      errors[key] = `${label} must be between ${min} and ${max.toLocaleString('en-US')}.`;
    }
  }
  for (const key of ['currentAge', 'retirementAge'] as const) {
    if (!errors[key] && !Number.isInteger(input[key])) errors[key] = 'Enter an age in whole years.';
  }
  if (!errors.currentAge && !errors.retirementAge && input.retirementAge <= input.currentAge) {
    errors.retirementAge = 'Retirement age must be greater than your current age.';
  }
  return errors;
}

export function calculateRetirementProjection(input: RetirementInput): RetirementProjection {
  const validation = validateRetirementInput(input);
  if (Object.keys(validation).length) throw new RangeError(Object.values(validation).join(' '));
  const yearsToRetirement = input.retirementAge - input.currentAge;
  // Treat the entered return as an effective annual rate; deposits are made at month end.
  const monthlyRate = Math.expm1(Math.log1p(input.annualReturn / 100) / 12);
  let balance = input.currentSavings;
  let futureContributions = 0;
  let contributionFactor = 0;
  const yearly: RetirementYear[] = [{ age: input.currentAge, balance, contributions: input.currentSavings, growth: 0 }];

  for (let year = 0; year < yearsToRetirement; year++) {
    const increaseFactor = Math.pow(1 + input.contributionIncrease / 100, year);
    const monthlyContribution = input.monthlyContribution * increaseFactor;
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      futureContributions += monthlyContribution;
      // Future value of a starting RD$1 monthly deposit, including annual increases.
      contributionFactor = contributionFactor * (1 + monthlyRate) + increaseFactor;
    }
    if (!Number.isFinite(balance) || balance > Number.MAX_SAFE_INTEGER / 100 || !Number.isFinite(contributionFactor)) {
      throw new RangeError('These assumptions exceed the supported projection range. Try a shorter horizon or smaller amounts.');
    }
    yearly.push({ age: input.currentAge + year + 1, balance, contributions: input.currentSavings + futureContributions, growth: balance - input.currentSavings - futureContributions });
  }

  const totalContributions = input.currentSavings + futureContributions;
  const investmentGrowth = balance - totalContributions;
  const currentSavingsAtRetirement = input.currentSavings * Math.pow(1 + input.annualReturn / 100, yearsToRetirement);
  const goalProgress = balance / input.retirementGoal * 100;
  const recommendedContribution = Math.ceil(Math.max(0, (input.retirementGoal - currentSavingsAtRetirement) / contributionFactor) * 100) / 100;
  const positiveGrowth = Math.max(0, investmentGrowth);
  const barTotal = totalContributions + positiveGrowth;
  return {
    yearsToRetirement, projectedBalance: balance, futureContributions, totalContributions, investmentGrowth,
    currentSavingsAtRetirement, purchasingPower: balance / Math.pow(1 + input.inflation / 100, yearsToRetirement),
    goalProgress, progressBarValue: Math.min(100, Math.max(0, goalProgress)),
    shortfall: Math.max(0, input.retirementGoal - balance), surplus: Math.max(0, balance - input.retirementGoal),
    status: goalProgress >= 100 ? 'On track' : goalProgress >= 80 ? 'Close to your goal' : 'Needs adjustment',
    yearly, milestones: yearly.filter(row => row.age === input.currentAge || row.age === input.retirementAge || row.age % 10 === 0),
    contributionShare: barTotal > 0 ? totalContributions / barTotal * 100 : 0,
    growthShare: barTotal > 0 ? positiveGrowth / barTotal * 100 : 0,
    recommendedContribution,
  };
}
