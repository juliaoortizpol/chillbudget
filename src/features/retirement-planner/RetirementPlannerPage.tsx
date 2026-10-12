import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalculatorSection } from '@/components/planning/CalculatorSection';
import { useRetirementPlanner } from './hooks/useRetirementPlanner';
import { RetirementForm } from './components/RetirementForm';
import { RetirementSummary } from './components/RetirementSummary';
import { RetirementInsight } from './components/RetirementInsight';
import { RetirementScenarios } from './components/RetirementScenarios';
import { RetirementGrowthChart } from './components/RetirementGrowthChart';
import { RetirementMilestones } from './components/RetirementMilestones';

export function RetirementPlannerPage() {
  const planner = useRetirementPlanner();
  const { input, projection, scenario, validation } = planner;
  return <div className="flex flex-col gap-6">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link to="/planning" className="inline-flex items-center gap-2 hover:text-primary"><ArrowLeft className="size-4" />Planning tools</Link><span aria-hidden="true">/</span><span aria-current="page">Retirement Planner</span></nav>
    <PageHeader title="Retirement Planner" subtitle="See how your savings could grow and whether you're on track for retirement." />
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <RetirementForm inputs={planner.inputs} validation={validation} yearsToRetirement={projection?.yearsToRetirement} setField={planner.setField} reset={planner.reset} />
      <div className="min-w-0 space-y-5">{projection ? <><RetirementSummary input={input} projection={projection} /><RetirementInsight input={input} projection={projection} onTryContribution={planner.applyRecommendation} /></> : <CalculatorSection title="Your retirement projection"><p role="status" className="text-sm text-muted-foreground">{validation.calculation || 'Check the highlighted fields to see your projection.'}</p></CalculatorSection>}</div>
    </div>
    {projection && scenario && <>
      <RetirementScenarios input={input} projection={projection} scenario={scenario} extra={planner.extraContribution} newContribution={planner.newContribution} difference={planner.difference} onSelect={planner.setExtraContribution} />
      <RetirementGrowthChart input={input} projection={projection} />
      <RetirementMilestones projection={projection} />
    </>}
    <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground">This projection is an estimate for planning purposes. Actual investment returns, inflation and retirement outcomes may vary. Contributions are made at month end, with any annual increase applied after each full year. Goal progress uses future pesos; purchasing power uses your inflation assumption. Taxes, fees, pensions and retirement withdrawals are not included.</p>
  </div>;
}
