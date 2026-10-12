import { Lightbulb } from 'lucide-react';
import { PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { LoanCalculatorInput, LoanComparisonResult } from '../types/loanCalculator.types';
import { formatLoanMoney } from '../utils/loanFormatting';

export function LoanInsight({ input, comparison }: { input: LoanCalculatorInput; comparison: LoanComparisonResult }) {
  return <aside className="flex gap-3 rounded-xl bg-accent/70 p-5">
    <Lightbulb className="size-5 shrink-0 text-primary" aria-hidden="true" />
    <div className="space-y-2"><h2 className="text-sm font-semibold">ChillBudget Insight</h2><p className="text-xs leading-relaxed text-muted-foreground">
      {input.extraPayment > 0 ? <>Paying <strong className="text-foreground">{formatLoanMoney(input.extraPayment)}</strong> extra every {PAYMENT_FREQUENCIES[input.paymentFrequency].interval} could save <strong className="text-primary">{formatLoanMoney(comparison.interestSaved)}</strong> in interest and finish the loan {comparison.paymentsSaved} payments earlier ({comparison.monthsSaved} full calendar months).</> : 'Try an extra payment to see how paying down principal sooner changes your interest and payoff date.'}
    </p></div>
  </aside>;
}
