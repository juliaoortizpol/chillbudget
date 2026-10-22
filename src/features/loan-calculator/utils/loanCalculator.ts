import { differenceInMonths, parseISO } from 'date-fns';
import { BALANCE_TOLERANCE, PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { AmortizationPayment, LoanBalancePoint, LoanCalculatorInput, LoanComparisonResult, LoanScenarioResult } from '../types/loanCalculator.types';
import { calculatePaymentDate } from './loanDates';
import { validateLoanInput } from './loanValidation';

/** annualRate is a decimal (0.1695 for 16.95%). */
export function calculatePeriodicRate(annualRate: number, paymentsPerYear: number): number {
  if (!Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(paymentsPerYear) || paymentsPerYear <= 0) {
    throw new RangeError('Invalid rate or payments per year.');
  }
  return annualRate / paymentsPerYear;
}

export function calculateScheduledPayment(principal: number, periodicRate: number, numberOfPayments: number): number {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(periodicRate) || periodicRate < 0 || !Number.isInteger(numberOfPayments) || numberOfPayments <= 0) {
    throw new RangeError('Invalid payment parameters.');
  }
  if (periodicRate === 0) return principal / numberOfPayments;
  // Equivalent to PMT, using log1p/expm1 to avoid cancellation at tiny rates and overflow at high rates.
  const payment = principal * periodicRate / -Math.expm1(-numberOfPayments * Math.log1p(periodicRate));
  if (!Number.isFinite(payment)) throw new RangeError('Payment exceeds supported numeric precision.');
  return payment;
}

export function generateAmortizationSchedule(input: LoanCalculatorInput): readonly AmortizationPayment[] {
  const errors = validateLoanInput(input);
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors).join(' '));
  const paymentsPerYear = PAYMENT_FREQUENCIES[input.paymentFrequency].paymentsPerYear;
  const count = Math.round(input.loanTermYears * paymentsPerYear);
  const rate = calculatePeriodicRate(input.annualInterestRate / 100, paymentsPerYear);
  const payment = calculateScheduledPayment(input.loanAmount, rate, count);
  if (payment <= input.loanAmount * rate) {
    throw new RangeError('This rate and term exceed supported calculation precision. Try a shorter term.');
  }
  const schedule: AmortizationPayment[] = [];
  let balance = input.loanAmount;
  let cumulativeInterest = 0;

  for (let paymentNumber = 1; paymentNumber <= count && balance > 0; paymentNumber++) {
    const beginningBalance = balance;
    const interest = beginningBalance * rate;
    // Reconcile the last installment at full precision; never leave a floating-point residual payment.
    const scheduledPayment = paymentNumber === count ? beginningBalance + interest : Math.min(payment, beginningBalance + interest);
    const scheduledPrincipal = Math.min(beginningBalance, Math.max(0, scheduledPayment - interest));
    const extraPayment = Math.min(input.extraPayment, beginningBalance - scheduledPrincipal);
    const principal = scheduledPrincipal + extraPayment;
    balance = Math.max(0, beginningBalance - principal);
    // A tiny residual belongs to the final scheduled principal, not an additional installment.
    const residual = balance <= BALANCE_TOLERANCE ? balance : 0;
    balance -= residual;
    cumulativeInterest += interest;
    schedule.push({
      paymentNumber, paymentDate: calculatePaymentDate(input.startDate, paymentNumber, input.paymentFrequency),
      beginningBalance, scheduledPayment: scheduledPayment + residual, extraPayment, otherAmount: input.otherAmount,
      totalPayment: scheduledPayment + residual + extraPayment + input.otherAmount,
      principal: principal + residual, interest, endingBalance: balance, cumulativeInterest,
    });
  }
  return schedule;
}

export function calculateLoanScenario(input: LoanCalculatorInput): LoanScenarioResult {
  const schedule = generateAmortizationSchedule(input);
  const paymentsPerYear = PAYMENT_FREQUENCIES[input.paymentFrequency].paymentsPerYear;
  const periodicRate = calculatePeriodicRate(input.annualInterestRate / 100, paymentsPerYear);
  const scheduledNumberOfPayments = Math.round(input.loanTermYears * paymentsPerYear);
  const totals = schedule.reduce((sum, row) => ({
    totalPrincipal: sum.totalPrincipal + row.principal,
    totalInterest: sum.totalInterest + row.interest,
    totalExtraPayments: sum.totalExtraPayments + row.extraPayment,
    totalOtherCharges: sum.totalOtherCharges + row.otherAmount,
    totalPaid: sum.totalPaid + row.totalPayment,
  }), { totalPrincipal: 0, totalInterest: 0, totalExtraPayments: 0, totalOtherCharges: 0, totalPaid: 0 });
  return {
    ...totals, periodicRate, scheduledNumberOfPayments, schedule,
    scheduledPayment: calculateScheduledPayment(input.loanAmount, periodicRate, scheduledNumberOfPayments),
    actualNumberOfPayments: schedule.length, payoffDate: schedule[schedule.length - 1].paymentDate,
  };
}

export function compareLoanScenarios(baseline: LoanScenarioResult, accelerated: LoanScenarioResult): LoanComparisonResult {
  return {
    interestSaved: Math.max(0, baseline.totalInterest - accelerated.totalInterest),
    paymentsSaved: baseline.actualNumberOfPayments - accelerated.actualNumberOfPayments,
    monthsSaved: Math.max(0, differenceInMonths(parseISO(baseline.payoffDate), parseISO(accelerated.payoffDate))),
    payoffDateBaseline: baseline.payoffDate, payoffDateAccelerated: accelerated.payoffDate,
  };
}

export function buildLoanBalanceData(input: LoanCalculatorInput, baseline: LoanScenarioResult, accelerated: LoanScenarioResult): LoanBalancePoint[] {
  return [
    { date: input.startDate, currentPlan: input.loanAmount, withExtra: input.loanAmount },
    ...baseline.schedule.map((row, index) => ({
      date: row.paymentDate, currentPlan: row.endingBalance,
      withExtra: accelerated.schedule[index]?.endingBalance ?? 0,
    })),
  ];
}
