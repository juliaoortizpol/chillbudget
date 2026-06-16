import { PageHeader } from "@/components/layout/PageHeader"
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
    <div className="flex flex-col max-w-7xl mx-auto gap-6">

      <PageHeader 
        title="Budget Overview" 
        subtitle={activeBudget ? `Status for ${activeBudget.name}` : "Status for current billing cycle"} 
      />

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
  )
}
