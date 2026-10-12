import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/financeFormatting';
import { MAX_RETIREMENT_AMOUNT } from '../constants';
import type { RetirementInput, RetirementProjection } from '../types';

export function RetirementInsight({ input, projection, onTryContribution }: { input: RetirementInput; projection: RetirementProjection; onTryContribution: () => void }) {
  return <aside className="flex items-start gap-3 rounded-xl bg-accent/60 p-5">
    <Lightbulb aria-hidden="true" className="size-5 shrink-0 text-primary" />
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">ChillBudget Insight</h2>
      <p className="text-xs leading-relaxed text-muted-foreground">{projection.shortfall > 0
        ? <>With these assumptions, starting at approximately <strong className="text-foreground">{formatMoney(projection.recommendedContribution)} per month</strong> could help you reach {formatMoney(input.retirementGoal)} by age {input.retirementAge}. {input.contributionIncrease > 0 && 'This includes your planned annual contribution increases.'}</>
        : <>You're projected to reach your retirement goal, with approximately <strong className="text-primary">{formatMoney(projection.surplus)}</strong> to spare.</>}
      </p>
      {projection.shortfall > 0 && <Button type="button" variant="outline" size="sm" disabled={projection.recommendedContribution > MAX_RETIREMENT_AMOUNT} onClick={onTryContribution}>Try this contribution</Button>}
    </div>
  </aside>;
}
