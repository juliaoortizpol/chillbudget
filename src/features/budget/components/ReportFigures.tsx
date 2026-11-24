import { coverageDisplayDate } from '../coverage';
import type { ReportFigures as Figures } from '../hooks/useBudgetReports';

import { reportMoney } from '../utils/reportMoney';

export function ReportFigures({ report, currency, incomplete }: {
  report: Figures;
  currency: string;
  incomplete?: boolean;
}) {
  const date = (value?: string | null) => coverageDisplayDate(value ?? undefined, report.timezone, true);
  const money = (value: number) => reportMoney(value, currency);
  return <div className="space-y-3 break-words">
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      <div><dt>Coverage start (inclusive)</dt><dd>{date(report.startDate)}</dd></div>
      <div><dt>Actual cutoff (exclusive)</dt><dd>{date(report.actualCutoffDate)}</dd></div>
      <div><dt>Planned end</dt><dd>{date(report.plannedEndDate)}</dd></div>
      <div><dt>Saved timezone</dt><dd>{report.timezone ?? 'Unavailable'}</dd></div>
    </dl>
    {incomplete && <p role="status">Figures are incomplete until the issues below are resolved.</p>}
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      <div><dt>Planned total</dt><dd>{money(report.totals.totalPlanned)}</dd></div>
      <div><dt>Actual income</dt><dd>{money(report.totals.totalActualIncome)}</dd></div>
      <div><dt>Actual expenses</dt><dd>{money(report.totals.totalActualExpense)}</dd></div>
      <div><dt>Total variance</dt><dd>{money(report.totals.totalVariance)}</dd></div>
    </dl>
    <div className="overflow-x-auto" role="region" aria-label="Budget item figures" tabIndex={0}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Budget item figures</caption>
        <thead><tr>{['Item', 'Planned', 'Actual', 'Variance'].map(label =>
          <th key={label} scope="col" className="p-2">{label}</th>)}</tr></thead>
        <tbody>{report.items.map(item => <tr key={item.budgetItemId} className="border-t">
          <th scope="row" className="p-2 font-medium">{item.categoryName} {item.type && <small>({item.type})</small>}</th>
          <td className="p-2">{money(item.plannedAmount)}</td>
          <td className="p-2">{money(item.actualAmount)}</td>
          <td className="p-2">{money(item.variance)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-sm text-muted-foreground">Expense variance is remaining planned spending. Income variance is actual income above or below plan.</p>
  </div>;
}
