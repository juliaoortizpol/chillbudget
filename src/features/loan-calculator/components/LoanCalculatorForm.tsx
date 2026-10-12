import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AMOUNT_PRESETS, PAYMENT_FREQUENCIES } from '../constants/loanCalculator.constants';
import type { LoanFormValues, LoanTermUnit, LoanValidation } from '../types/loanCalculator.types';
import { Label } from '@/components/ui/label';
import { formatCompactMoney } from '../utils/loanFormatting';
import { LoanInputField } from './LoanInputField';
import { LoanSection } from './LoanSection';

interface LoanCalculatorFormProps {
  inputs: LoanFormValues;
  validation: LoanValidation;
  setField: (field: Exclude<keyof LoanFormValues, 'loanTermUnit'>, value: string) => void;
  setTermUnit: (unit: LoanTermUnit) => void;
  termPresets: { value: string; label: string }[];
  reset: () => void;
}

export function LoanCalculatorForm({ inputs, validation, setField, setTermUnit, termPresets, reset }: LoanCalculatorFormProps) {
  const field = (key: Exclude<keyof LoanFormValues, 'loanTerm' | 'loanTermUnit'>) => ({ id: key, value: inputs[key], error: validation[key], onChange: (value: string) => setField(key, value) });
  return <LoanSection title="Loan details" description="Configure your loan terms to forecast payments and your payoff date."
    action={<Button type="button" variant="ghost" size="sm" onClick={reset}><RotateCcw aria-hidden="true" />Reset</Button>}>
    <form noValidate className="flex flex-col gap-6" onSubmit={event => { event.preventDefault(); document.getElementById('loan-summary')?.focus(); }}>
      <div className="space-y-3">
        <LoanInputField {...field('loanAmount')} label="Loan amount" type="number" min="0.01" step="any" suffix="RD$" />
        <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] text-muted-foreground">Presets:</span>
          {AMOUNT_PRESETS.map(amount => <Button key={amount} type="button" size="xs" variant={inputs.loanAmount === String(amount) ? 'default' : 'secondary'} className="rounded-full" onClick={() => setField('loanAmount', String(amount))}>{formatCompactMoney(amount)}</Button>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <LoanInputField {...field('annualInterestRate')} label="Annual interest rate" type="number" min="0" step="any" suffix="%" hint="Nominal annual rate, divided by payments per year." />
        <LoanInputField {...field('startDate')} label="Loan start date" type="date" hint="First installment is due one payment period after this date." />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-3">
          <LoanInputField id="loanTerm" value={inputs.loanTerm} error={validation.loanTermYears} onChange={value => setField('loanTerm', value)} label="Loan term" type="number" min="0" step="any" />
          <div className="space-y-2">
            <Label htmlFor="loanTermUnit" className="text-xs">Unit</Label>
            <select id="loanTermUnit" aria-label="Loan term unit" value={inputs.loanTermUnit} onChange={event => setTermUnit(event.target.value as LoanTermUnit)} className="h-11 w-full rounded-sm border border-input bg-muted/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20">
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">{termPresets.map(preset => <Button key={preset.value} type="button" variant={inputs.loanTerm === preset.value ? 'default' : 'secondary'} size="sm" className="flex-1" onClick={() => setField('loanTerm', preset.value)}>{preset.label}</Button>)}</div>
      </div>
      <fieldset className="min-w-0 space-y-2"><legend className="mb-2 text-xs font-medium">Payment frequency</legend>
        <div className="flex flex-wrap gap-2">{Object.entries(PAYMENT_FREQUENCIES).map(([frequency, { label }]) => <Button key={frequency} type="button" size="sm" className="flex-1" variant={inputs.paymentFrequency === frequency ? 'default' : 'secondary'} aria-pressed={inputs.paymentFrequency === frequency} onClick={() => setField('paymentFrequency', frequency)}>{label}</Button>)}</div>
        {validation.paymentFrequency && <p className="text-xs text-destructive">{validation.paymentFrequency}</p>}
      </fieldset>
      <details open className="group rounded-xl bg-muted/60 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold">Extra payments & recurring charges<ChevronDown className="size-4 group-open:rotate-180" /></summary>
        <div className="mt-5 space-y-4">
          <LoanInputField {...field('extraPayment')} label="Extra payment per installment" type="number" min="0" step="any" suffix="RD$" hint="Applied directly to principal to help pay off the loan sooner." />
          <LoanInputField {...field('otherAmount')} label="Additional recurring charges" type="number" min="0" step="any" suffix="RD$" hint="Insurance or servicing fees per installment. These do not reduce your balance." />
        </div>
      </details>
      <div className="space-y-2"><Button type="submit" disabled={Object.keys(validation).length > 0} className="h-11 w-full"><Calculator aria-hidden="true" />Review calculation</Button><p className="text-center text-[11px] text-muted-foreground">Results update automatically as you edit.</p></div>
    </form>
  </LoanSection>;
}
