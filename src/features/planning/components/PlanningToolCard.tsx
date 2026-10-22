import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { planningCategories, type PlanningTool } from '../data/planning-tools';

interface PlanningToolCardProps {
  tool: PlanningTool;
  onLaunch?: (tool: PlanningTool) => void;
}

export function PlanningToolCard({ tool, onLaunch }: PlanningToolCardProps) {
  const Icon = tool.icon;
  return (
    <Card className="h-full justify-between gap-4 p-4 shadow-card ring-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="size-5" aria-hidden="true" /></div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {planningCategories.find(category => category.id === tool.category)?.shortLabel}
          </Badge>
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">{tool.title}</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <span className="font-mono text-[10px] text-muted-foreground">{tool.caption}</span>
        <Button type="button" variant="link" size="xs" className="px-0 text-[11px]" disabled={!onLaunch}
          aria-label={`Launch ${tool.title}`} onClick={() => onLaunch?.(tool)}>
          Launch tool <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
