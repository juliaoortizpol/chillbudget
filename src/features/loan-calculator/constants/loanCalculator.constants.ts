import type { LoanCalculatorInput } from '../types/loanCalculator.types';

export const PAYMENT_FREQUENCIES = {
  monthly: { label: 'Monthly', interval: 'month', paymentsPerYear: 12, days: 0 },
  biweekly: { label: 'Biweekly', interval: 'two weeks', paymentsPerYear: 26, days: 14 },
  weekly: { label: 'Weekly', interval: 'week', paymentsPerYear: 52, days: 7 },
} as const;

export const DEFAULT_LOAN_INPUT: LoanCalculatorInput = {
  loanAmount: 626000,
  annualInterestRate: 16.95,
  loanTermYears: 6,
  paymentFrequency: 'monthly',
  startDate: '2026-05-21',
  extraPayment: 0,
  otherAmount: 0,
};

export const AMOUNT_PRESETS = [250000, 500000, 626000, 1000000];
export const TERM_PRESETS = [3, 4, 5, 6];
export const MAX_LOAN_AMOUNT = 1e12;
export const MAX_TERM_YEARS = 100;
export const MAX_ANNUAL_RATE = 1000;
export const BALANCE_TOLERANCE = 1e-8;
