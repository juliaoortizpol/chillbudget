import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorSection } from '@/components/planning/CalculatorSection';
import { formatMoney } from '@/lib/financeFormatting';
import type { RetirementProjection } from '../types';

export function RetirementMilestones({ projection }: { projection: RetirementProjection }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? projection.yearly : projection.milestones;
  return <CalculatorSection title="Projection milestones" description="A few checkpoints on the way to retirement."
    action={<Button type="button" variant="secondary" size="sm" aria-expanded={expanded} aria-controls="retirement-milestones" onClick={() => setExpanded(value => !value)}>{expanded ? 'Show milestones' : 'View yearly projection'}</Button>}>
    <ol id="retirement-milestones" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {rows.map(row => <li key={row.age} className="space-y-2 rounded-xl border bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Age {row.age}</p><p className="break-words text-sm font-semibold">{formatMoney(row.balance)}</p><p className="text-[11px] text-muted-foreground">Growth: {formatMoney(row.growth)}</p></li>)}
    </ol>
  </CalculatorSection>;
}
