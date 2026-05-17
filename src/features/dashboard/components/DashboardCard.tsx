import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  actionIcon?: boolean
}

export function DashboardCard({ title, children, className, contentClassName, actionIcon }: DashboardCardProps) {
  return (
    <Card className={cn("rounded-2xl border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-card", className)}>
      {(title || actionIcon) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 space-y-0">
          {title && <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</CardTitle>}
          {actionIcon && <MoreHorizontal className="h-5 w-5 text-muted-foreground/40 cursor-pointer hover:text-foreground transition-colors" />}
        </CardHeader>
      )}
      <CardContent className={cn("px-4 pb-4 pt-1", contentClassName, !(title || actionIcon) && "pt-4")}>
        {children}
      </CardContent>
    </Card>
  )
}
