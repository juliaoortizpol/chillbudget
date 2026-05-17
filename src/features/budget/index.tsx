import { Sidebar } from "@/components/Sidebar"
import { BudgetSummaryCard } from "./components/BudgetSummaryCard"
import { CategoryTable } from "./components/CategoryTable"
import { useBudgetOverview } from "./hooks/useBudgetOverview"

export function BudgetOverview() {
  const {
    activeBudget,
    tableData,
    totalAllocated,
    totalSpent,
    comparison,
    isLoading,
    handleUpdateItem,
    handleAddBudgetItem,
    handleRemoveFromBudget,
  } = useBudgetOverview();

  return (
    <div className="min-h-screen flex w-full bg-ds-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-2 lg:p-4 overflow-auto">
          <div className="flex flex-col max-w-7xl mx-auto gap-4">

            {/* Header */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-extrabold tracking-tight text-foreground">Budget Overview</h1>
                <p className="text-[15px] font-medium text-muted-foreground">
                  {activeBudget ? `Status for ${activeBudget.name}` : "Status for current billing cycle"}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6">
              <BudgetSummaryCard 
                totalAllocated={totalAllocated} 
                totalSpent={totalSpent} 
                comparison={comparison}
              />
              <CategoryTable
                categories={tableData}
                onUpdateItem={handleUpdateItem}
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
