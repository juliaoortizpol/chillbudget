import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LoanScenarioResult } from '../types/loanCalculator.types';
import { formatLoanMoney } from '../utils/loanFormatting';

export function LoanCostBreakdown({ result }: { result: LoanScenarioResult }) {
  const data = [
    { name: 'Principal', value: result.totalPrincipal, color: 'var(--primary)' },
    { name: 'Interest', value: result.totalInterest, color: 'var(--chart-3)' },
    { name: 'Other charges', value: result.totalOtherCharges, color: 'var(--muted-foreground)' },
  ];
  const chartData = [Object.fromEntries(data.map(item => [item.name, item.value]))];
  return <section aria-label="Where your money goes" className="space-y-3 border-t pt-5">
    <h3 className="text-sm font-semibold">Where your money goes</h3>
    <div className="h-5 overflow-hidden rounded-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" stackOffset="expand" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}><XAxis type="number" hide /><YAxis type="category" hide />{data.map(item => <Bar key={item.name} dataKey={item.name} stackId="cost" fill={item.color} isAnimationActive={false} />)}<Tooltip formatter={value => formatLoanMoney(Number(value))} /></BarChart></ResponsiveContainer></div>
    <dl className="space-y-3">{data.map(item => <div key={item.name} className="flex flex-wrap items-center justify-between gap-2 text-xs"><dt className="flex items-center gap-2 text-muted-foreground"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</dt><dd className="font-medium">{formatLoanMoney(item.value)}</dd></div>)}</dl>
  </section>;
}
