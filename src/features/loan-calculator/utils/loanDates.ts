import { addDays, addMonths, format, isValid, parseISO } from 'date-fns';
import { PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { LoanPaymentFrequency } from '../types/loanCalculator.types';

export function isValidLoanDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && date.getFullYear() >= 1900 && format(date, 'yyyy-MM-dd') === value;
}

export function calculatePaymentDate(startDate: string, paymentNumber: number, frequency: LoanPaymentFrequency): string {
  if (!isValidLoanDate(startDate) || !Number.isInteger(paymentNumber) || paymentNumber < 0 || !Object.hasOwn(PAYMENT_FREQUENCIES, frequency)) {
    throw new RangeError('Invalid payment date parameters.');
  }
  const start = parseISO(startDate);
  // Always anchor to the original day: Jan 31 -> Feb 28 -> Mar 31.
  const date = frequency === 'monthly'
    ? addMonths(start, paymentNumber)
    : addDays(start, paymentNumber * PAYMENT_FREQUENCIES[frequency].days);
  if (!isValid(date) || date.getFullYear() > 9999) throw new RangeError('Payment date is out of range.');
  return format(date, 'yyyy-MM-dd');
}
