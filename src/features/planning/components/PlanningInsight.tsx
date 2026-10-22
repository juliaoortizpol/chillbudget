import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PlanningInsightProps {
  monthlyExpenses: number;
  formatAmount: (amount: number) => string;
  isPreview?: boolean;
  onCalculate?: () => void;
}

export function PlanningInsight({ monthlyExpenses, formatAmount, isPreview = false, onCalculate }: PlanningInsightProps) {
  return (
    <Card className="relative gap-4 overflow-hidden bg-gradient-to-br from-card via-card to-accent/50 p-5 shadow-card ring-0 sm:p-6">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-primary"><Sparkles aria-hidden="true" />{isPreview ? 'Sample insight' : 'Financial insight'}</Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">chillBudget Intelligence</span>
          </div>
          <h2 className="text-lg font-bold">Based on your finances</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isPreview ? 'With average spending of ' : 'You currently spend an average of '}
            <strong className="font-mono text-foreground">{formatAmount(monthlyExpenses)}</strong> per month,
            a 3–6 month emergency fund would be approximately{' '}
            <strong className="font-mono text-primary">{formatAmount(monthlyExpenses * 3)} – {formatAmount(monthlyExpenses * 6)}</strong>.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {[{ months: 3, label: '3-Month Baseline' }, { months: 6, label: '6-Month Fortified' }].map(({ months, label }) => (
              <div key={months} className="flex flex-wrap gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{label}:</span>
                <strong className="font-mono">{formatAmount(monthlyExpenses * months)}</strong>
              </div>
            ))}
          </div>
        </div>
        <Button type="button" className="h-auto w-full whitespace-normal px-4 py-2.5 sm:w-fit" disabled={!onCalculate} onClick={onCalculate}>
          Calculate my emergency fund <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      <p className="flex items-start gap-2 pt-3 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        {isPreview ? 'Illustrative amounts for this preview. Your connected account data is not used here.' : 'An estimate based on the monthly spending provided.'}
      </p>
    </Card>
  );
}
