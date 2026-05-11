import { Sidebar } from "@/components/Sidebar"
import { BudgetSummaryCard } from "./components/BudgetSummaryCard"
import { CategoryTable } from "./components/CategoryTable"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useBudgetOverview } from "./hooks/useBudgetOverview"

export function BudgetOverview() {
  const {
    activeBudget,
    tableData,
    totalAllocated,
    totalSpent,
    isLoading,
    handleUpdateAllocated,
    handleAddBudgetItem,
    handleCreateBudget,
    handleRemoveFromBudget,
  } = useBudgetOverview();

  return (
    <div className="min-h-screen flex w-full bg-ds-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="flex flex-col max-w-6xl mx-auto gap-8">

            {/* Header */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-extrabold tracking-tight text-foreground">Budget Overview</h1>
                <p className="text-[15px] font-medium text-muted-foreground">
                  {activeBudget ? `Status for ${activeBudget.name}` : "Status for current billing cycle"}
                </p>
              </div>
              <Button 
                onClick={handleCreateBudget}
                className="bg-[#05603A] hover:bg-[#05603A]/90 text-white rounded-xl gap-2 h-11 px-5 font-bold tracking-wide shadow-md"
              >
                <PlusCircle className="w-5 h-5" strokeWidth={2.5} /> New Budget
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8">
              <BudgetSummaryCard totalAllocated={totalAllocated} totalSpent={totalSpent} />
              <CategoryTable
                categories={tableData}
                onUpdateAllocated={handleUpdateAllocated}
                onCreateItem={handleAddBudgetItem}
                onDeleteItem={handleRemoveFromBudget}
                isLoading={isLoading}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
