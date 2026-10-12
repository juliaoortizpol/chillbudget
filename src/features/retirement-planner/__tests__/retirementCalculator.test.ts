import { describe, expect, it } from 'vitest';
import { DEFAULT_RETIREMENT_INPUT } from '../constants';
import type { RetirementInput } from '../types';
import { calculateRetirementProjection } from '../utils/retirementCalculator';

const project = (overrides: Partial<RetirementInput> = {}) => calculateRetirementProjection({ ...DEFAULT_RETIREMENT_INPUT, ...overrides });

describe('retirement projection engine', () => {
  it('matches an independent future-value formula for the default assumptions', () => {
    const result = project();
    const rate = Math.pow(1.07, 1 / 12) - 1;
    const months = 38 * 12;
    const expected = 100000 * Math.pow(1 + rate, months) + 10000 * (Math.pow(1 + rate, months) - 1) / rate;
    expect(result.projectedBalance).toBeCloseTo(expected, 5);
    expect(result.futureContributions).toBe(4560000);
    expect(result.totalContributions).toBe(4660000);
    expect(result.projectedBalance).toBeCloseTo(result.totalContributions + result.investmentGrowth, 7);
    expect(result.yearsToRetirement).toBe(38);
    expect(result.yearly).toHaveLength(39);
    expect(result.yearly[0]).toEqual({ age: 27, balance: 100000, contributions: 100000, growth: 0 });
    expect(result.yearly.at(-1)?.age).toBe(65);
  });

  it('handles zero return and zero savings without division by zero', () => {
    const result = project({ currentAge: 60, retirementAge: 65, currentSavings: 0, monthlyContribution: 100, annualReturn: 0, inflation: 0 });
    expect(result.projectedBalance).toBe(6000);
    expect(result.investmentGrowth).toBe(0);
    expect(result.purchasingPower).toBe(6000);
    expect(result.recommendedContribution).toBe(166666.67);
    const empty = project({ currentSavings: 0, monthlyContribution: 0 });
    expect(empty.projectedBalance).toBe(0);
    expect(empty.contributionShare).toBe(0);
    expect(empty.growthShare).toBe(0);
  });

  it('raises deposits after each complete year, not before the first deposit', () => {
    const result = project({ currentAge: 30, retirementAge: 32, currentSavings: 0, monthlyContribution: 100, annualReturn: 0, contributionIncrease: 10 });
    expect(result.yearly[1].balance).toBeCloseTo(1200, 8);
    expect(result.futureContributions).toBeCloseTo(2520, 8);
    expect(result.projectedBalance).toBeCloseTo(2520, 8);
  });

  it('keeps nominal goal progress separate from purchasing power', () => {
    const zeroInflation = project({ inflation: 0 });
    const withInflation = project({ inflation: 3 });
    expect(withInflation.projectedBalance).toBe(zeroInflation.projectedBalance);
    expect(withInflation.goalProgress).toBe(zeroInflation.goalProgress);
    expect(withInflation.purchasingPower).toBeCloseTo(withInflation.projectedBalance / Math.pow(1.03, 38), 6);
  });

  it.each([0, 7, -5])('recommends a monthly contribution that reaches the goal at %s%% return', annualReturn => {
    const input = { currentAge: 30, retirementAge: 60, currentSavings: 1000, monthlyContribution: 10, retirementGoal: 1000000, contributionIncrease: 3, annualReturn };
    const result = project(input);
    const recommended = project({ ...input, monthlyContribution: result.recommendedContribution });
    expect(recommended.projectedBalance).toBeGreaterThanOrEqual(input.retirementGoal - 1e-6);
    expect(result.recommendedContribution).toBeGreaterThan(10);
  });

  it('needs no additional deposits when existing savings already cover the goal', () => {
    expect(project({ currentSavings: 10000000, retirementGoal: 1000000 }).recommendedContribution).toBe(0);
  });

  it.each([
    [1200, 'On track'], [1000, 'On track'], [850, 'Close to your goal'], [799, 'Needs adjustment'],
  ] as const)('classifies %s saved toward a 1000 goal as %s', (currentSavings, status) => {
    const result = project({ currentSavings, retirementGoal: 1000, monthlyContribution: 0, annualReturn: 0 });
    expect(result.status).toBe(status);
    expect(result.progressBarValue).toBeLessThanOrEqual(100);
  });

  it('more monthly savings increases the projected balance and contributions', () => {
    const baseline = project();
    const extra = project({ monthlyContribution: 15000 });
    expect(extra.projectedBalance).toBeGreaterThan(baseline.projectedBalance);
    expect(extra.futureContributions - baseline.futureContributions).toBe(5000 * 38 * 12);
  });

  it('supports negative returns and describes the loss without negative bar widths', () => {
    const result = project({ annualReturn: -5 });
    expect(result.investmentGrowth).toBeLessThan(0);
    expect(result.projectedBalance).toBeGreaterThanOrEqual(0);
    expect(result.growthShare).toBe(0);
    expect(result.contributionShare).toBe(100);
  });

  it('includes starting and final ages without duplicating decade milestones', () => {
    expect(project().milestones.map(row => row.age)).toEqual([27, 30, 40, 50, 60, 65]);
    expect(project({ currentAge: 30, retirementAge: 60 }).milestones.map(row => row.age)).toEqual([30, 40, 50, 60]);
  });

  it.each([
    { currentAge: NaN }, { retirementAge: 27 }, { retirementAge: 26 }, { currentAge: 27.5 },
    { retirementAge: 121 }, { currentSavings: -1 }, { monthlyContribution: -1 },
    { retirementGoal: 0 }, { annualReturn: -100 }, { inflation: -1 },
    { contributionIncrease: 21 }, { currentSavings: Infinity },
  ])('rejects invalid assumptions %j', overrides => expect(() => project(overrides)).toThrow(RangeError));

  it('rejects a projection beyond supported monetary precision', () => {
    expect(() => project({ currentAge: 0, retirementAge: 120, annualReturn: 50 })).toThrow(/range/);
  });
});
