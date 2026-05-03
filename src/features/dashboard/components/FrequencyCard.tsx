import { DashboardCard } from "./DashboardCard"
import { ArrowUp, ArrowDown } from "lucide-react"

export function FrequencyCard() {
  return (
    <DashboardCard title="FREQUENCY ANALYSIS">
      <div className="flex gap-12 mt-6 mb-2">
        <div>
          <h3 className="text-[40px] font-bold tracking-tight leading-none mb-3">6.6</h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Daily</span>
            <div className="flex items-center text-[11px] font-bold text-green-600 gap-0.5">
              <ArrowUp className="w-3 h-3" strokeWidth={3} />
              <span>0.4</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-[40px] font-bold tracking-tight leading-none mb-3">36.0</h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Weekly</span>
            <div className="flex items-center text-[11px] font-bold text-red-500 gap-0.5">
              <ArrowDown className="w-3 h-3" strokeWidth={3} />
              <span>1.8</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
