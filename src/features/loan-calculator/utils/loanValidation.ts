import { MAX_ANNUAL_RATE, MAX_LOAN_AMOUNT, MAX_TERM_YEARS, PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { LoanCalculatorInput, LoanFormValues, LoanValidation } from '../types/loanCalculator.types';
import { calculatePaymentDate, isValidLoanDate } from './loanDates';

export function validateLoanInput(input: LoanCalculatorInput): LoanValidation {
  const errors: LoanValidation = {};
  const ranges = [
    ['loanAmount', 0.01, MAX_LOAN_AMOUNT, 'Loan amount'],
    ['annualInterestRate', 0, MAX_ANNUAL_RATE, 'Annual interest rate'],
    ['loanTermYears', Number.MIN_VALUE, MAX_TERM_YEARS, 'Loan term'],
    ['extraPayment', 0, MAX_LOAN_AMOUNT, 'Extra payment'],
    ['otherAmount', 0, MAX_LOAN_AMOUNT, 'Recurring charges'],
  ] as const;
  for (const [key, min, max, label] of ranges) {
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) {
      errors[key] = `${label} must be ${min === Number.MIN_VALUE ? 'greater than 0' : `at least ${min}`} and no more than ${max.toLocaleString('en-US')}.`;
    }
  }
  if (!Object.hasOwn(PAYMENT_FREQUENCIES, input.paymentFrequency)) {
    errors.paymentFrequency = 'Choose a supported payment frequency.';
  } else if (!errors.loanTermYears) {
    const count = input.loanTermYears * PAYMENT_FREQUENCIES[input.paymentFrequency].paymentsPerYear;
    if (count < 1 || Math.abs(count - Math.round(count)) > 1e-8) errors.loanTermYears = 'Choose a term that results in a whole number of payments.';
  }
  if (!isValidLoanDate(input.startDate)) errors.startDate = 'Enter a valid date from 1900 onward.';
  if (!errors.startDate && !errors.paymentFrequency && !errors.loanTermYears) {
    try {
      calculatePaymentDate(input.startDate, Math.round(input.loanTermYears * PAYMENT_FREQUENCIES[input.paymentFrequency].paymentsPerYear), input.paymentFrequency);
    } catch {
      errors.startDate = 'The final payment must fall before the year 10000.';
    }
  }
  return errors;
}

export function toLoanFormValues(input: LoanCalculatorInput): LoanFormValues {
  return {
    loanAmount: String(input.loanAmount), annualInterestRate: String(input.annualInterestRate),
    loanTerm: String(input.loanTermYears), loanTermUnit: 'years', paymentFrequency: input.paymentFrequency,
    startDate: input.startDate, extraPayment: String(input.extraPayment), otherAmount: String(input.otherAmount),
  };
}

export function normalizeLoanInput(values: LoanFormValues): LoanCalculatorInput {
  const number = (value: string) => value.trim() === '' ? NaN : Number(value);
  return {
    loanAmount: number(values.loanAmount), annualInterestRate: number(values.annualInterestRate),
    loanTermYears: number(values.loanTerm) / (values.loanTermUnit === 'months' ? 12 : 1), extraPayment: number(values.extraPayment),
    otherAmount: number(values.otherAmount), startDate: values.startDate,
    paymentFrequency: values.paymentFrequency as LoanCalculatorInput['paymentFrequency'],
  };
}
