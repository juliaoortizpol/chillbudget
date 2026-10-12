import { Button } from '@/components/ui/button';
import { CalculatorMetric, CalculatorSection } from '@/components/planning/CalculatorSection';
import { formatMoney, formatCompactMoney } from '@/lib/financeFormatting';
import { EXTRA_CONTRIBUTION_OPTIONS } from '../constants';
import type { RetirementInput, RetirementProjection } from '../types';

interface RetirementScenariosProps {
  input: RetirementInput;
  projection: RetirementProjection;
  scenario: RetirementProjection;
  extra: number;
  newContribution: number;
  difference: number;
  onSelect: (extra: number) => void;
}

export function RetirementScenarios({ input, projection, scenario, extra, newContribution, difference, onSelect }: RetirementScenariosProps) {
  return <CalculatorSection title="What if I save more?" description={`Your current contribution is ${formatMoney(input.monthlyContribution)} per month.`}>
    <div role="group" aria-label="Extra monthly contribution" className="flex flex-wrap gap-2">
      {EXTRA_CONTRIBUTION_OPTIONS.map(amount => <Button key={amount} type="button" size="sm" variant={extra === amount ? 'default' : 'secondary'} aria-pressed={extra === amount} onClick={() => onSelect(amount)}>{amount === 0 ? 'No extra' : `+ ${formatCompactMoney(amount)}`}</Button>)}
    </div>
    <div className="rounded-xl bg-accent/60 p-4"><p className="text-xs text-muted-foreground">Potential additional savings at retirement</p><p className="mt-1 break-words font-heading text-2xl font-bold text-primary">+ {formatMoney(difference)}</p><p className="mt-1 text-xs text-muted-foreground">Save {formatMoney(extra)} more each month{input.contributionIncrease > 0 ? ', growing with your annual contribution increase.' : '.'}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">{[
      { title: 'Current plan', contribution: input.monthlyContribution, result: projection },
      { title: 'With extra savings', contribution: newContribution, result: scenario },
    ].map(({ title, contribution, result }) => <div key={title} className="space-y-4 rounded-xl border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="grid grid-cols-2 gap-4">
        <CalculatorMetric label="Starting monthly contribution" value={formatMoney(contribution)} />
        <CalculatorMetric label="Projected retirement" value={formatMoney(result.projectedBalance)} emphasis />
        <CalculatorMetric label="Investment growth" value={formatMoney(result.investmentGrowth)} />
        <CalculatorMetric label="Goal reached" value={result.shortfall === 0 ? 'Yes' : 'Not yet'} />
      </dl>
    </div>)}</div>
  </CalculatorSection>;
}
