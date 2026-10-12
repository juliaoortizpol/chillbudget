export type LoanPaymentFrequency = 'monthly' | 'biweekly' | 'weekly';

export interface LoanCalculatorInput {
  loanAmount: number;
  /** Percentage points: 16.95 means 16.95%, not a decimal rate. */
  annualInterestRate: number;
  loanTermYears: number;
  paymentFrequency: LoanPaymentFrequency;
  startDate: string;
  extraPayment: number;
  otherAmount: number;
}

export type LoanTermUnit = 'months' | 'years';
export type LoanFormValues = Omit<{ [K in keyof LoanCalculatorInput]: string }, 'loanTermYears'> & {
  loanTerm: string;
  loanTermUnit: LoanTermUnit;
};
export type LoanValidation = Partial<Record<keyof LoanCalculatorInput | 'calculation', string>>;

export interface AmortizationPayment {
  paymentNumber: number;
  paymentDate: string;
  beginningBalance: number;
  scheduledPayment: number;
  extraPayment: number;
  otherAmount: number;
  totalPayment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  cumulativeInterest: number;
}

export interface LoanScenarioResult {
  scheduledPayment: number;
  periodicRate: number;
  scheduledNumberOfPayments: number;
  actualNumberOfPayments: number;
  totalPrincipal: number;
  totalInterest: number;
  totalExtraPayments: number;
  totalOtherCharges: number;
  totalPaid: number;
  payoffDate: string;
  schedule: readonly AmortizationPayment[];
}

export interface LoanComparisonResult {
  interestSaved: number;
  paymentsSaved: number;
  monthsSaved: number;
  payoffDateBaseline: string;
  payoffDateAccelerated: string;
}

export interface LoanBalancePoint {
  date: string;
  currentPlan: number;
  withExtra: number;
}
