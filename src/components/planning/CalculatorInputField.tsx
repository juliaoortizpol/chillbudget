import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalculatorInputFieldProps extends Omit<ComponentProps<typeof Input>, 'onChange'> {
  id: string;
  label: string;
  suffix?: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
}

export function CalculatorInputField({ id, label, suffix, hint, error, onChange, ...props }: CalculatorInputFieldProps) {
  return <div className="min-w-0 space-y-2">
    <Label htmlFor={id} className="text-xs">{label}</Label>
    <div className="relative">
      <Input {...props} id={id} className="h-11 bg-muted/60 pr-14 font-heading" aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-help` : undefined} onChange={event => onChange(event.target.value)} />
      {suffix && <span className="pointer-events-none absolute right-3 top-3 text-xs text-muted-foreground">{suffix}</span>}
    </div>
    {(error || hint) && <p id={`${id}-help`} className={error ? 'text-xs text-destructive' : 'text-[11px] leading-relaxed text-muted-foreground'}>{error || hint}</p>}
  </div>;
}

