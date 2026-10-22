import type { LoanTermUnit } from '../types/loanCalculator.types';

export function convertLoanTerm(value: string, from: LoanTermUnit, to: LoanTermUnit): string {
  if (from === to || value.trim() === '' || !Number.isFinite(Number(value))) return value;
  // Only the displayed term is rounded, preserving whole-payment validation on round trips.
  return String(Number((Number(value) * (from === 'years' ? 12 : 1 / 12)).toPrecision(15)));
}
