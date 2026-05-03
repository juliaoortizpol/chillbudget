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
    <Card className={cn("rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card", className)}>
      {(title || actionIcon) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-7 space-y-0">
          {title && <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</CardTitle>}
          {actionIcon && <MoreHorizontal className="h-5 w-5 text-muted-foreground/40 cursor-pointer hover:text-foreground transition-colors" />}
        </CardHeader>
      )}
      <CardContent className={cn("px-7 pb-7 pt-2", contentClassName, !(title || actionIcon) && "pt-7")}>
        {children}
      </CardContent>
    </Card>
  )
}
