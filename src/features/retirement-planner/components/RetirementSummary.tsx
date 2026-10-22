import { Badge } from '@/components/ui/badge';
import { CalculatorMetric, CalculatorSection } from '@/components/planning/CalculatorSection';
import { formatMoney, formatPercentage } from '@/lib/financeFormatting';
import type { RetirementInput, RetirementProjection } from '../types';

export function RetirementSummary({ input, projection }: { input: RetirementInput; projection: RetirementProjection }) {
  return <div id="retirement-projection" tabIndex={-1} className="rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
    <CalculatorSection title="Your retirement projection" action={<Badge variant="secondary" className={projection.status === 'On track' ? 'bg-accent text-primary' : 'bg-amber-100 text-amber-900'}>{projection.status}</Badge>}>
      <div>
        <p className="text-xs text-muted-foreground">Projected at age {input.retirementAge}</p>
        <p className="mt-2 break-words font-heading text-3xl font-bold tracking-tight">{formatMoney(projection.projectedBalance)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Goal: <span className="font-medium text-foreground">{formatMoney(input.retirementGoal)}</span> in retirement-year pesos</p>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between gap-2 text-xs"><span className="font-semibold text-primary">{formatPercentage(projection.goalProgress)} of your goal</span><span className="text-muted-foreground">Age {input.retirementAge}</span></div>
        <div role="progressbar" aria-label="Retirement goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={projection.progressBarValue} aria-valuetext={`${formatPercentage(projection.goalProgress)} of your goal`} className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${projection.progressBarValue}%` }} /></div>
        <p className="text-xs text-muted-foreground">{projection.shortfall > 0 ? `${formatMoney(projection.shortfall)} remaining to reach your goal.` : `${formatMoney(projection.surplus)} above your goal in this projection.`}</p>
      </div>
      <dl className="grid grid-cols-2 gap-5 rounded-xl bg-muted/50 p-4">
        <CalculatorMetric label="Current savings" value={formatMoney(input.currentSavings)} />
        <CalculatorMetric label="Future contributions" value={formatMoney(projection.futureContributions)} />
        <CalculatorMetric label="Estimated investment growth" value={formatMoney(projection.investmentGrowth)} emphasis />
        <CalculatorMetric label="Projected retirement balance" value={formatMoney(projection.projectedBalance)} />
        <CalculatorMetric label="Years to retirement" value={`${projection.yearsToRetirement} years`} />
        <CalculatorMetric label="Today's purchasing power" value={formatMoney(projection.purchasingPower)} />
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">Your current savings alone could grow to <strong className="text-foreground">{formatMoney(projection.currentSavingsAtRetirement)}</strong>. Purchasing power accounts for {formatPercentage(input.inflation)} annual inflation.</p>
    </CalculatorSection>
  </div>;
}
