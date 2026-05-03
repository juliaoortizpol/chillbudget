import * as React from "react"
import { DashboardCard } from "./DashboardCard"
import { ChevronRight } from "lucide-react"

export interface ListItem {
  id: string
  icon: React.ReactNode
  iconBgClass: string
  title: string
  subtitle?: string
  amount: string
  showChevron?: boolean
}

interface ListWidgetProps {
  title: string
  items: ListItem[]
}

export function ListWidget({ title, items }: ListWidgetProps) {
  return (
    <DashboardCard title={title} actionIcon contentClassName="pt-2">
      <div className="flex flex-col gap-6 mt-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.iconBgClass}`}>
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-foreground">{item.title}</span>
                {item.subtitle && <span className="text-xs font-medium text-muted-foreground mt-0.5">{item.subtitle}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-bold text-foreground">{item.amount}</span>
              {item.showChevron && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
