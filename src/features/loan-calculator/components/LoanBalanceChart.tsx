import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LoanBalancePoint } from '../types/loanCalculator.types';
import { formatChartDate, formatCompactMoney, formatLoanDate, formatLoanMoney } from '../utils/loanFormatting';

export function LoanBalanceChart({ data }: { data: LoanBalancePoint[] }) {
  return <section aria-label="Remaining Balance Over Time" className="min-w-0 rounded-xl bg-muted/40 p-3 sm:p-5">
    <h3 className="mb-4 text-sm font-semibold">Remaining Balance Over Time</h3>
    <div className="h-64 w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart accessibilityLayer data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={formatChartDate} minTickGap={50} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
      <YAxis width={75} tickFormatter={formatCompactMoney} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
      <Tooltip labelFormatter={label => formatLoanDate(String(label))} formatter={value => formatLoanMoney(Number(value))} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 12 }} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Line name="Current plan" type="linear" dataKey="currentPlan" stroke="var(--muted-foreground)" strokeDasharray="5 4" strokeWidth={2} dot={false} isAnimationActive={false} />
      <Line name="With extra payments" type="linear" dataKey="withExtra" stroke="var(--primary)" strokeWidth={3} dot={false} isAnimationActive={false} />
    </LineChart></ResponsiveContainer></div>
  </section>;
}
