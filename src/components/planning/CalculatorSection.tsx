import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CalculatorSection({ title, description, children, className, action }: { title: string; description?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return <Card className={cn('min-w-0 gap-6 p-5 shadow-card ring-0 sm:p-7', className)}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}</div>
      {action}
    </div>
    {children}
  </Card>;
}

export function CalculatorMetric({ label, value, emphasis = false }: { label: string; value: ReactNode; emphasis?: boolean }) {
  return <div className="min-w-0 space-y-1"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={cn('break-words text-sm font-semibold tabular-nums', emphasis && 'text-primary')}>{value}</dd></div>;
}

