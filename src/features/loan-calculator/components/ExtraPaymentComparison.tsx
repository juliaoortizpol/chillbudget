import type { LoanCalculatorInput, LoanComparisonResult, LoanScenarioResult } from '../types/loanCalculator.types';
import { formatLoanDate, formatLoanMoney } from '../utils/loanFormatting';
import { LoanMetric, LoanSection } from './LoanSection';

export function ExtraPaymentComparison({ input, baseline, accelerated, comparison }: { input: LoanCalculatorInput; baseline: LoanScenarioResult; accelerated: LoanScenarioResult; comparison: LoanComparisonResult }) {
  return <section className="space-y-5" aria-label="Extra payment comparison">
    <div><h2 className="text-xl font-bold">What if I pay extra?</h2><p className="mt-1 text-sm text-muted-foreground">See how a little more each installment could change your plan.</p></div>
    <dl className="grid grid-cols-1 gap-4 rounded-xl bg-accent/60 p-5 sm:grid-cols-3">
      <LoanMetric label="Interest saved" value={formatLoanMoney(comparison.interestSaved)} emphasis />
      <LoanMetric label="Payments saved" value={comparison.paymentsSaved} emphasis />
      <LoanMetric label="Full calendar months saved" value={comparison.monthsSaved} emphasis />
    </dl>
    <div className="grid gap-5 md:grid-cols-2">{[
      { title: 'Current plan', result: baseline, extra: false },
      { title: `With ${formatLoanMoney(input.extraPayment)} extra`, result: accelerated, extra: true },
    ].map(({ title, result, extra }) => <LoanSection key={extra ? 'extra' : 'current'} title={title} className={extra ? 'border border-primary/25 bg-accent/20' : ''}>
      <dl className="grid grid-cols-2 gap-5">
        <LoanMetric label="First installment, all included" value={formatLoanMoney(result.schedule[0].totalPayment)} />
        <LoanMetric label="Actual payments" value={result.actualNumberOfPayments} />
        <LoanMetric label="Payoff date" value={formatLoanDate(result.payoffDate)} />
        <LoanMetric label="Total interest" value={formatLoanMoney(result.totalInterest)} emphasis={extra} />
        <LoanMetric label="Total principal" value={formatLoanMoney(result.totalPrincipal)} />
        <LoanMetric label="Extra principal paid" value={formatLoanMoney(result.totalExtraPayments)} />
        <LoanMetric label="Total recurring charges" value={formatLoanMoney(result.totalOtherCharges)} />
        <LoanMetric label="Total repayment" value={formatLoanMoney(result.totalPaid)} emphasis={extra} />
      </dl>
    </LoanSection>)}</div>
  </section>;
}
