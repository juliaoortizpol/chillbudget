import type { AmortizationPayment } from '../types/loanCalculator.types';
import { formatLoanDate, formatLoanMoney } from '../utils/loanFormatting';
import { LoanMetric } from './LoanSection';

export function AmortizationRow({ row, mobile = false }: { row: AmortizationPayment; mobile?: boolean }) {
  if (mobile) return <details className="border-b py-3">
    <summary className="cursor-pointer text-sm"><span className="font-medium">#{row.paymentNumber} · {formatLoanDate(row.paymentDate)}</span><span className="mt-1 block text-xs text-muted-foreground">Total payment: {formatLoanMoney(row.totalPayment)}</span></summary>
    <dl className="mt-4 grid grid-cols-2 gap-4">
      <LoanMetric label="Beginning balance" value={formatLoanMoney(row.beginningBalance)} />
      <LoanMetric label="Scheduled payment" value={formatLoanMoney(row.scheduledPayment)} />
      <LoanMetric label="Principal (including extra)" value={formatLoanMoney(row.principal)} />
      <LoanMetric label="Interest" value={formatLoanMoney(row.interest)} />
      <LoanMetric label="Extra principal" value={formatLoanMoney(row.extraPayment)} />
      <LoanMetric label="Recurring charges" value={formatLoanMoney(row.otherAmount)} />
      <LoanMetric label="Ending balance" value={formatLoanMoney(row.endingBalance)} emphasis />
      <LoanMetric label="Cumulative interest" value={formatLoanMoney(row.cumulativeInterest)} />
    </dl>
  </details>;
  return <tr className="border-b hover:bg-muted/40">
    <td className="px-3 py-3 text-muted-foreground">{row.paymentNumber}</td><td className="px-3 py-3 whitespace-nowrap">{formatLoanDate(row.paymentDate)}</td>
    {[row.beginningBalance, row.scheduledPayment, row.principal, row.interest, row.extraPayment, row.otherAmount, row.totalPayment, row.endingBalance, row.cumulativeInterest].map((value, index) => <td key={index} className="px-3 py-3 text-right whitespace-nowrap tabular-nums">{formatLoanMoney(value)}</td>)}
  </tr>;
}
