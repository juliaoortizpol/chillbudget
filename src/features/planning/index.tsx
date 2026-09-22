import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { PlanningCategoryFilter } from './components/PlanningCategoryFilter';
import { PlanningToolCard } from './components/PlanningToolCard';
import { PlanningInsight } from './components/PlanningInsight';
import { planningTools, type PlanningCategory, type PlanningTool } from './data/planning-tools';

const formatPreviewAmount = (amount: number) => `RD$${amount.toLocaleString('en-US')}`;

interface PlanningPageProps {
  onLaunchTool?: (tool: PlanningTool) => void;
}

export function PlanningPage({ onLaunchTool }: PlanningPageProps) {
  const [category, setCategory] = useState<PlanningCategory>('all');
  const visibleTools = planningTools.filter(tool => category === 'all' || tool.category === category);
  const emergencyTool = planningTools.find(tool => tool.id === 'emergency-fund');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <PageHeader title="Plan your finances" subtitle="Explore scenarios, calculate possibilities, and prepare for what’s next with tailored projection engines.">
        <Badge variant="secondary" className="text-primary">{planningTools.length} planning tools</Badge>
      </PageHeader>
      <PlanningCategoryFilter tools={planningTools} value={category} onChange={setCategory} />
      <section id="planning-tools" aria-label="Planning calculators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleTools.map(tool => <PlanningToolCard key={tool.id} tool={tool} onLaunch={onLaunchTool} />)}
      </section>
      <PlanningInsight monthlyExpenses={42500} formatAmount={formatPreviewAmount} isPreview
        onCalculate={onLaunchTool && emergencyTool ? () => onLaunchTool(emergencyTool) : undefined} />
    </div>
  );
}
