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
      <div className="mt-4 flex min-h-[240px] flex-col gap-3 sm:mt-5 sm:min-h-[304px] sm:gap-4">
        {isLoading && Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-4" aria-hidden="true">
            <div className="h-11 w-11 shrink-0 rounded-full bg-muted sm:h-12 sm:w-12" />
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
            className={`group flex min-w-0 items-center justify-between gap-3 ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div 
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${item.iconBgClass || ''}`}
                style={item.iconBgColor ? { backgroundColor: item.iconBgColor } : undefined}
              >
                {item.icon}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold text-foreground sm:text-[15px]" title={item.title}>{item.title}</span>
                {item.subtitle && <span className="mt-0.5 truncate text-xs font-medium text-muted-foreground" title={item.subtitle}>{item.subtitle}</span>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <span className="whitespace-nowrap text-sm font-bold tabular-nums text-foreground sm:text-[15px]">{item.amount}</span>
              {item.showChevron && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
