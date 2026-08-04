import * as React from "react"
import { DashboardCard } from "./DashboardCard"
import { AlertCircle, ChevronRight, Inbox } from "lucide-react"

export interface ListItem {
  id: string
  icon: React.ReactNode
  iconBgClass?: string
  iconBgColor?: string
  title: string
  subtitle?: string
  amount: string
  showChevron?: boolean
}

interface ListWidgetProps {
  title: string
  items: ListItem[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  onRetry?: () => void
  onItemClick?: (item: ListItem) => void
}

export function ListWidget({
  title,
  items,
  isLoading = false,
  error,
  emptyMessage = "Nothing to show yet",
  onRetry,
  onItemClick,
}: ListWidgetProps) {
  const showItems = !isLoading && !error && items.length > 0

  return (
    <DashboardCard title={title} contentClassName="pt-2">
      <div className="mt-5 flex min-h-[304px] flex-col gap-4">
        {isLoading && Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-4" aria-hidden="true">
            <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-2/5 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        ))}

        {!isLoading && error && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center" role="alert">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Unable to load this information</p>
            <p className="mt-1 text-xs text-muted-foreground">Please try again.</p>
            {onRetry && (
              <button type="button" className="mt-4 text-sm font-semibold text-primary hover:text-ds-primary-hover" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
            <p className="mt-1 text-xs text-muted-foreground">New activity will appear here.</p>
          </div>
        )}

        {showItems && items.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between group ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div className="flex items-center gap-4">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.iconBgClass || ''}`}
                style={item.iconBgColor ? { backgroundColor: item.iconBgColor } : undefined}
              >
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
