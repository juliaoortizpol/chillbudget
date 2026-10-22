import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalculatorMetric, CalculatorSection } from '@/components/planning/CalculatorSection';
import { formatCompactMoney, formatMoney } from '@/lib/financeFormatting';
import type { RetirementInput, RetirementProjection } from '../types';

export function RetirementGrowthChart({ input, projection }: { input: RetirementInput; projection: RetirementProjection }) {
  const gradientId = useId();
  return <CalculatorSection title="Your money over time" description="See how your contributions and investment returns could add up.">
    <div className="h-64 min-w-0 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%"><AreaChart accessibilityLayer data={projection.yearly} margin={{ left: 0, right: 12, top: 24, bottom: 0 }}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="age" type="number" domain={[input.currentAge, input.retirementAge]} tick={{ fontSize: 11 }} minTickGap={30} tickLine={false} axisLine={false} />
        <YAxis width={72} tickFormatter={formatCompactMoney} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip labelFormatter={age => `Age ${age}`} formatter={value => formatMoney(Number(value))} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 12 }} />
        <ReferenceLine y={input.retirementGoal} ifOverflow="extendDomain" stroke="var(--chart-3)" strokeDasharray="5 4" />
        <Area name="Projected balance" type="monotone" dataKey="balance" stroke="var(--primary)" strokeWidth={2.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
      </AreaChart></ResponsiveContainer>
    </div>
    <div className="flex flex-wrap justify-between gap-3 text-xs text-muted-foreground"><span>Today · Age {input.currentAge}</span><span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-chart-3" />Retirement goal: {formatCompactMoney(input.retirementGoal)}</span><span>Retirement · Age {input.retirementAge}</span></div>
    <div className="space-y-3 border-t pt-5">
      <h3 className="text-sm font-semibold">Contributions vs. investment growth</h3>
      <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-muted"><div className="bg-primary" style={{ width: `${projection.contributionShare}%` }} /><div className="bg-chart-3" style={{ width: `${projection.growthShare}%` }} /></div>
      <dl className="grid grid-cols-2 gap-4"><CalculatorMetric label="Your contributions (including current savings)" value={formatMoney(projection.totalContributions)} /><CalculatorMetric label={projection.investmentGrowth < 0 ? 'Estimated investment loss' : 'Estimated investment growth'} value={formatMoney(projection.investmentGrowth)} /></dl>
      {projection.investmentGrowth < 0 && <p className="text-xs text-muted-foreground">With a negative return, your projected balance is less than your total contributions. The bar shows contributions only.</p>}
    </div>
  </CalculatorSection>;
}
