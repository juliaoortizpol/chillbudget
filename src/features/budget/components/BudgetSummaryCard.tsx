import { DashboardCard } from "@/features/dashboard/components/DashboardCard"
import { Building2, WalletCards, ArrowUpRight } from "lucide-react"

export function BudgetSummaryCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard className="col-span-1 border border-border shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Total Budget</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-muted-foreground">$</span>
              <h2 className="text-[32px] font-extrabold tracking-tight">12,500.00</h2>
            </div>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <ArrowUpRight className="w-3 h-3" strokeWidth={3} />
              <span className="text-xs font-bold">4.2% increase from July</span>
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="col-span-2 border border-border shadow-sm">
        <div className="flex flex-col h-full justify-between gap-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <WalletCards className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Total Spent</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-muted-foreground">$</span>
                <h2 className="text-[32px] font-extrabold tracking-tight">8,432.50</h2>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mt-1 mb-2">Amount Left</span>
              <div className="flex items-baseline gap-1 mt-1 text-emerald-600">
                <span className="text-sm font-bold">$</span>
                <h2 className="text-[32px] font-extrabold tracking-tight">4,067.50</h2>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            {/* Custom Progress Bar */}
            <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#05603A]" style={{ width: "67%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              <span>67% Utilized</span>
              <span>33% Remaining</span>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}
