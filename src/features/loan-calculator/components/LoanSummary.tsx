import { Badge } from '@/components/ui/badge';
import { PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { LoanCalculatorInput, LoanScenarioResult } from '../types/loanCalculator.types';
import { formatLoanDate, formatLoanMoney } from '../utils/loanFormatting';
import { LoanCostBreakdown } from './LoanCostBreakdown';
import { LoanMetric, LoanSection } from './LoanSection';

export function LoanSummary({ input, result, termLabel }: { input: LoanCalculatorInput; result: LoanScenarioResult; termLabel: string }) {
  return <div id="loan-summary" tabIndex={-1} className="rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
    <LoanSection title="Estimated loan summary" action={<Badge variant="secondary">Current plan</Badge>}>
      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{PAYMENT_FREQUENCIES[input.paymentFrequency].label} payment</p><p className="mt-2 break-words font-heading text-3xl font-bold tracking-tight sm:text-4xl">{formatLoanMoney(result.scheduledPayment)}</p><p className="mt-2 text-xs text-muted-foreground">Principal + interest, before extra payments and charges</p></div>
      <dl className="grid grid-cols-2 gap-5 rounded-xl bg-muted/60 p-4">
        <LoanMetric label="Loan amount" value={formatLoanMoney(input.loanAmount)} />
        <LoanMetric label="Annual interest rate" value={`${input.annualInterestRate}%`} />
        <LoanMetric label="Loan term" value={termLabel} />
        <LoanMetric label="Scheduled payments" value={result.scheduledNumberOfPayments} />
        <LoanMetric label="Total interest" value={formatLoanMoney(result.totalInterest)} />
        <LoanMetric label="Total repayment" value={formatLoanMoney(result.totalPaid)} emphasis />
        <LoanMetric label="Payoff date" value={formatLoanDate(result.payoffDate)} />
        <LoanMetric label="Payment with charges" value={formatLoanMoney(result.schedule[0].totalPayment)} />
      </dl>
      <LoanCostBreakdown result={result} />
    </LoanSection>
  </div>;
}
