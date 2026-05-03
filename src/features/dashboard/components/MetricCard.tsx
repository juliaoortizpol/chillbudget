import { DashboardCard } from "./DashboardCard"
import { ArrowUp, ArrowDown } from "lucide-react"

interface MetricCardProps {
  title: string
  subtitle?: string
  amount: string
  percentUp?: string
  percentDown?: string
  icon?: React.ReactNode
  iconColorClass?: string
}

export function MetricCard({ title, subtitle, amount, percentUp, percentDown, icon, iconColorClass }: MetricCardProps) {
  return (
    <DashboardCard title={title}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 mt-1">
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          <h3 className="text-[32px] font-bold tracking-tight mt-1 mb-2">{amount}</h3>
          
          <div className="flex items-center gap-4">
            {percentUp && (
              <div className="flex items-center text-xs font-bold text-green-600 gap-1">
                <ArrowUp className="w-3 h-3" strokeWidth={3} />
                <span>{percentUp}</span>
              </div>
            )}
            {percentDown && (
              <div className="flex items-center text-xs font-bold text-red-500 gap-1">
                <ArrowDown className="w-3 h-3" strokeWidth={3} />
                <span>{percentDown}</span>
              </div>
            )}
          </div>
        </div>

        {icon && (
          <div className={`relative flex items-center justify-center w-14 h-14 rounded-full border-[3.5px] ${iconColorClass}`}>
            {icon}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
