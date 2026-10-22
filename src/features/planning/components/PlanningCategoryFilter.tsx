import { Button } from '@/components/ui/button';
import { planningCategories, type PlanningCategory, type PlanningTool } from '../data/planning-tools';

interface PlanningCategoryFilterProps {
  tools: readonly PlanningTool[];
  value: PlanningCategory;
  onChange: (category: PlanningCategory) => void;
}

export function PlanningCategoryFilter({ tools, value, onChange }: PlanningCategoryFilterProps) {
  return (
    <div role="group" aria-label="Tool categories" className="flex gap-2 overflow-x-auto pb-1">
      {planningCategories.map(({ id, label }) => (
        <Button key={id} type="button" size="sm" variant={value === id ? 'default' : 'secondary'}
          className="rounded-full px-3.5" aria-pressed={value === id} aria-controls="planning-tools" onClick={() => onChange(id)}>
          {label}
          <span className="ml-1 rounded-full bg-background/20 px-1.5 font-mono text-[10px]">
            {id === 'all' ? tools.length : tools.filter(tool => tool.category === id).length}
          </span>
        </Button>
      ))}
    </div>
  );
}
