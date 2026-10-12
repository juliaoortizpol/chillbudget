import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoanCalculator } from './hooks/useLoanCalculator';
import { LoanCalculatorForm } from './components/LoanCalculatorForm';
import { LoanSummary } from './components/LoanSummary';
import { LoanInsight } from './components/LoanInsight';
import { ExtraPaymentComparison } from './components/ExtraPaymentComparison';
import { LoanBalanceChart } from './components/LoanBalanceChart';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { LoanSection } from './components/LoanSection';

export function LoanCalculatorPage() {
  const calculator = useLoanCalculator();
  const { normalized, baseline, accelerated, comparison, chartData, validation } = calculator;
  return <div className="flex flex-col gap-7">
    <Link to="/planning" className="flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />Planning tools</Link>
    <PageHeader title="Loan Calculator" subtitle="Understand your loan and plan your path to being debt-free." />
    <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr]">
      <LoanCalculatorForm inputs={calculator.inputs} validation={validation} setField={calculator.setField} setTermUnit={calculator.setTermUnit} termPresets={calculator.termPresets} reset={calculator.reset} />
      <div className="min-w-0 space-y-5">{baseline && comparison ? <><LoanSummary input={normalized} result={baseline} termLabel={calculator.termLabel} /><LoanInsight input={normalized} comparison={comparison} /></> : <LoanSection title="Estimated loan summary"><p role="status" className="text-sm text-muted-foreground">{validation.calculation || 'Check the highlighted fields to calculate your loan.'}</p></LoanSection>}</div>
    </div>
    {baseline && accelerated && comparison && <>
      <ExtraPaymentComparison input={normalized} baseline={baseline} accelerated={accelerated} comparison={comparison} />
      <LoanSection title="Payment schedule" description="Follow your balance, principal and interest through every installment.">
        <LoanBalanceChart data={chartData} />
        <AmortizationSchedule baseline={baseline} accelerated={accelerated} />
      </LoanSection>
    </>}
    <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">Estimates use a fixed nominal annual rate with equal payment periods. Monthly dates preserve the start day where possible; biweekly and weekly payments occur every 14 and 7 days. Charges apply to every actual installment, including the final one. Figures are rounded for display; lender rounding, fees and day-count methods may differ.</p>
  </div>;
}
