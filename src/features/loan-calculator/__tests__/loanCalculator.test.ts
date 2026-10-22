import { describe, expect, it } from 'vitest';
import { DEFAULT_LOAN_INPUT, PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import { buildLoanBalanceData, calculateLoanScenario, calculatePeriodicRate, calculateScheduledPayment, compareLoanScenarios } from '../utils/loanCalculator';
import { calculatePaymentDate, isValidLoanDate } from '../utils/loanDates';
import { formatLoanMoney, roundMoney } from '../utils/loanFormatting';
import type { LoanCalculatorInput, LoanPaymentFrequency } from '../types/loanCalculator.types';

const scenario = (overrides: Partial<LoanCalculatorInput> = {}) => calculateLoanScenario({ ...DEFAULT_LOAN_INPUT, ...overrides });

describe('fixed-rate loan engine', () => {
  it('matches the Scotiabank inputs against an independent PMT regression', () => {
    const result = scenario();
    expect(calculatePeriodicRate(0.1695, 12)).toBeCloseTo(0.014125, 12);
    expect(result.scheduledPayment).toBeCloseTo(13908.618742377907, 8);
    expect(result.scheduledNumberOfPayments).toBe(72);
    expect(result.actualNumberOfPayments).toBe(72);
    expect(result.totalInterest).toBeCloseTo(375420.54945120926, 6);
    expect(result.totalPaid).toBeCloseTo(1001420.5494512093, 6);
    expect(result.payoffDate).toBe('2032-05-21');
  });

  it('calculates zero-interest payments without dividing by zero', () => {
    const result = scenario({ loanAmount: 1200, annualInterestRate: 0, loanTermYears: 1 });
    expect(result.scheduledPayment).toBe(100);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBe(1200);
  });

  it('reconciles the first amortization installment', () => {
    const row = scenario().schedule[0];
    expect(row.beginningBalance).toBe(626000);
    expect(row.interest).toBeCloseTo(8842.25, 8);
    expect(row.principal).toBeCloseTo(5066.368742377907, 8);
    expect(row.endingBalance).toBeCloseTo(620933.63125762, 7);
    expect(row.paymentDate).toBe('2026-06-21');
  });

  it.each([0, 1, 5000, 1000000])('reconciles every row and totals with an extra payment of %s', extraPayment => {
    const result = scenario({ extraPayment, otherAmount: 250 });
    const last = result.schedule.at(-1)!;
    expect(last.endingBalance).toBe(0);
    expect(last.scheduledPayment).toBeLessThanOrEqual(last.beginningBalance + last.interest + 1e-8);
    expect(result.totalPrincipal).toBeCloseTo(626000, 7);
    expect(result.totalInterest).toBe(result.schedule.reduce((sum, row) => sum + row.interest, 0));
    expect(result.totalPaid).toBeCloseTo(result.totalPrincipal + result.totalInterest + result.totalOtherCharges, 7);
    expect(result.totalExtraPayments).toBe(result.schedule.reduce((sum, row) => sum + row.extraPayment, 0));
    expect(last.cumulativeInterest).toBe(result.totalInterest);
    for (const row of result.schedule) {
      expect(row.extraPayment).toBeGreaterThanOrEqual(0);
      expect(row.extraPayment).toBeLessThanOrEqual(extraPayment);
      expect(row.principal).toBeLessThanOrEqual(row.beginningBalance + 1e-8);
      expect(row.endingBalance).toBeGreaterThanOrEqual(0);
      expect(row.totalPayment).toBeCloseTo(row.scheduledPayment + row.extraPayment + row.otherAmount, 8);
      expect(row.beginningBalance - row.principal).toBeCloseTo(row.endingBalance, 8);
    }
  });

  it.each([0, 1, 5000, 1000000])('extra payment %s cannot increase interest or duration', extraPayment => {
    const baseline = scenario();
    const accelerated = scenario({ extraPayment });
    expect(accelerated.actualNumberOfPayments).toBeLessThanOrEqual(baseline.actualNumberOfPayments);
    expect(accelerated.totalInterest).toBeLessThanOrEqual(baseline.totalInterest);
    const comparison = compareLoanScenarios(baseline, accelerated);
    expect(comparison.paymentsSaved).toBe(baseline.schedule.length - accelerated.schedule.length);
    expect(comparison.interestSaved).toBeCloseTo(baseline.totalInterest - accelerated.totalInterest, 8);
    if (extraPayment === 5000) {
      expect(comparison.paymentsSaved).toBeGreaterThan(0);
      expect(comparison.monthsSaved).toBe(comparison.paymentsSaved);
    }
  });

  it('caps an oversized final extra payment without overpaying', () => {
    const result = scenario({ loanAmount: 100, annualInterestRate: 0, loanTermYears: 1, extraPayment: 10000 });
    expect(result.schedule).toHaveLength(1);
    expect(result.schedule[0].extraPayment).toBeCloseTo(100 - 100 / 12, 10);
    expect(result.totalPaid).toBe(100);
  });

  it('charges increase cash outflow without changing principal or interest', () => {
    const without = scenario({ extraPayment: 5000 });
    const withCharges = scenario({ extraPayment: 5000, otherAmount: 300 });
    expect(withCharges.schedule.map(row => row.endingBalance)).toEqual(without.schedule.map(row => row.endingBalance));
    expect(withCharges.totalInterest).toBe(without.totalInterest);
    expect(withCharges.totalOtherCharges).toBe(300 * withCharges.actualNumberOfPayments);
    expect(withCharges.totalPaid - without.totalPaid).toBeCloseTo(withCharges.totalOtherCharges, 7);
  });

  it.each(['monthly', 'biweekly', 'weekly'] as const)('supports %s payments consistently', paymentFrequency => {
    const result = scenario({ paymentFrequency });
    expect(result.scheduledNumberOfPayments).toBe(6 * PAYMENT_FREQUENCIES[paymentFrequency].paymentsPerYear);
    expect(result.schedule.at(-1)?.endingBalance).toBe(0);
    expect(result.totalPrincipal).toBeCloseTo(626000, 6);
  });

  it.each([
    { loanAmount: 0.01 }, { annualInterestRate: 1000, loanTermYears: 1 }, { annualInterestRate: 1e-12 },
    { loanAmount: 0.01, annualInterestRate: 0, extraPayment: 0.001 },
  ])('handles small loans and extreme valid rates: %j', overrides => {
    const result = scenario(overrides);
    expect(Number.isFinite(result.totalPaid)).toBe(true);
    expect(result.totalPrincipal).toBeCloseTo(overrides.loanAmount ?? 626000, 6);
    expect(result.schedule.at(-1)?.endingBalance).toBe(0);
  });

  it.each([
    { loanAmount: 0 }, { loanAmount: -10 }, { loanAmount: NaN }, { loanAmount: Infinity },
    { annualInterestRate: -1 }, { annualInterestRate: Infinity }, { loanTermYears: 0 },
    { loanTermYears: -1 }, { loanTermYears: 0.01 }, { loanTermYears: 101 },
    { extraPayment: -1 }, { otherAmount: -1 }, { extraPayment: NaN }, { otherAmount: Infinity },
    { startDate: '2026-02-30' }, { startDate: '' }, { startDate: '9999-12-31' },
    { paymentFrequency: 'daily' as LoanPaymentFrequency }, { paymentFrequency: 'toString' as LoanPaymentFrequency },
  ])('rejects invalid input: %j', overrides => expect(() => scenario(overrides)).toThrow(RangeError));

  it('rejects invalid pure PMT/rate arguments', () => {
    for (const periods of [0, -1, NaN, Infinity]) expect(() => calculatePeriodicRate(0.1, periods)).toThrow();
    expect(() => calculateScheduledPayment(100, 0.1, 0)).toThrow();
    expect(() => calculateScheduledPayment(100, 0.1, 1.5)).toThrow();
    expect(() => calculateScheduledPayment(100, -0.1, 12)).toThrow();
  });

  it('rejects rate/term combinations that cannot amortize within numeric precision', () => {
    expect(() => scenario({ annualInterestRate: 1000, loanTermYears: 100 })).toThrow(/precision/);
  });

  it('does not mutate inputs or scenarios and shows accelerated zero balance earlier', () => {
    const input = Object.freeze({ ...DEFAULT_LOAN_INPUT, extraPayment: 5000 });
    const baseline = scenario();
    const accelerated = calculateLoanScenario(input);
    const before = JSON.stringify(accelerated);
    const chart = buildLoanBalanceData(input, baseline, accelerated);
    expect(chart[0].currentPlan).toBe(input.loanAmount);
    expect(chart[accelerated.actualNumberOfPayments].withExtra).toBe(0);
    expect(chart[accelerated.actualNumberOfPayments].currentPlan).toBeGreaterThan(0);
    expect(chart.at(-1)?.currentPlan).toBe(0);
    expect(JSON.stringify(accelerated)).toBe(before);
  });
});

describe('payment dates and formatting', () => {
  it.each([
    ['2026-01-31', 1, '2026-02-28'], ['2026-01-31', 2, '2026-03-31'],
    ['2024-01-31', 1, '2024-02-29'], ['2024-01-31', 2, '2024-03-31'],
    ['2024-02-29', 12, '2025-02-28'], ['2026-02-28', 1, '2026-03-28'],
    ['2026-12-21', 1, '2027-01-21'],
  ])('anchors monthly dates: %s + %s months', (start, index, expected) => {
    expect(calculatePaymentDate(start, index, 'monthly')).toBe(expected);
  });
  it('uses exact calendar days for weekly and biweekly frequencies', () => {
    expect(calculatePaymentDate('2026-01-31', 1, 'weekly')).toBe('2026-02-07');
    expect(calculatePaymentDate('2026-01-31', 2, 'biweekly')).toBe('2026-02-28');
  });
  it('rejects invalid and ambiguous dates', () => {
    for (const value of ['2025-02-29', '05/21/2026', 'not a date', '2026-13-01']) expect(isValidLoanDate(value)).toBe(false);
    expect(() => calculatePaymentDate('2026-01-01', -1, 'monthly')).toThrow();
  });
  it('centralizes DOP formatting and rounds only for display', () => {
    expect(roundMoney(13908.618742377907)).toBe(13908.62);
    expect(formatLoanMoney(626000)).toBe('RD$ 626,000.00');
  });
});
