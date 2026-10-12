import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalculatorInputField } from '@/components/planning/CalculatorInputField';
import { CalculatorSection } from '@/components/planning/CalculatorSection';
import type { RetirementFormValues, RetirementInput, RetirementValidation } from '../types';

interface RetirementFormProps {
  inputs: RetirementFormValues;
  validation: RetirementValidation;
  yearsToRetirement?: number;
  setField: (key: keyof RetirementInput, value: string) => void;
  reset: () => void;
}

export function RetirementForm({ inputs, validation, yearsToRetirement, setField, reset }: RetirementFormProps) {
  const field = (key: keyof RetirementInput) => ({
    id: key, value: inputs[key], error: validation[key], type: 'number', step: 'any',
    onChange: (value: string) => setField(key, value),
  });
  return <CalculatorSection title="Your retirement plan" description="A few simple assumptions to help you look ahead."
    action={<Button type="button" variant="ghost" size="sm" onClick={reset}><RotateCcw aria-hidden="true" />Reset</Button>}>
    <form noValidate className="space-y-5" onSubmit={event => { event.preventDefault(); document.getElementById('retirement-projection')?.focus(); }}>
      <div className="grid grid-cols-2 gap-3">
        <CalculatorInputField {...field('currentAge')} label="Current age" min="0" max="119" step="1" />
        <CalculatorInputField {...field('retirementAge')} label="Retirement age" min="1" max="120" step="1" />
      </div>
      {yearsToRetirement !== undefined && <p className="text-xs font-medium text-primary">{yearsToRetirement} years to retirement</p>}
      <CalculatorInputField {...field('currentSavings')} label="Current retirement savings" min="0" suffix="RD$" />
      <CalculatorInputField {...field('monthlyContribution')} label="Monthly contribution" min="0" suffix="RD$" hint="How much you plan to invest toward retirement each month." />
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorInputField {...field('annualReturn')} label="Expected annual return" min="-50" max="50" suffix="%" hint="Your estimated average annual investment return." />
        <CalculatorInputField {...field('retirementGoal')} label="Retirement goal" min="0.01" suffix="RD$" hint="How much would you like to have saved when you retire?" />
      </div>
      <details className="group rounded-xl bg-muted/60 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold">Advanced assumptions<ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180" /></summary>
        <div className="mt-4 space-y-4">
          <CalculatorInputField {...field('contributionIncrease')} label="Annual contribution increase" min="0" max="20" suffix="%" hint="Increase your monthly contribution once a year, starting after the first year." />
          <CalculatorInputField {...field('inflation')} label="Inflation" min="0" max="20" suffix="%" hint="Used to show the purchasing power of your projected balance in today's pesos." />
        </div>
      </details>
      <div className="space-y-2"><Button type="submit" className="h-11 w-full" disabled={Object.keys(validation).length > 0}><Calculator aria-hidden="true" />Update projection</Button><p className="text-center text-[11px] text-muted-foreground">Results update as you change your assumptions.</p></div>
    </form>
  </CalculatorSection>;
}
