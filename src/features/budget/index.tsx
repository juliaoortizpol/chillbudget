import { Sidebar } from "@/features/dashboard/components/Sidebar"
import { BudgetSummaryCard } from "./components/BudgetSummaryCard"
import { CategoryTable } from "./components/CategoryTable"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function BudgetOverview() {
  return (
    <div className="min-h-screen flex w-full bg-ds-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* AppBar Placeholder */}
        <div className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="flex flex-col max-w-6xl mx-auto gap-8">
            
            {/* Header */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-extrabold tracking-tight text-foreground">Budget Overview</h1>
                <p className="text-[15px] font-medium text-muted-foreground">Status for August 2024 billing cycle</p>
              </div>
              <Button className="bg-[#05603A] hover:bg-[#05603A]/90 text-white rounded-xl gap-2 h-11 px-5 font-bold tracking-wide shadow-md">
                <PlusCircle className="w-5 h-5" strokeWidth={2.5} /> New Budget
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8">
              <BudgetSummaryCard />
              <CategoryTable />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
