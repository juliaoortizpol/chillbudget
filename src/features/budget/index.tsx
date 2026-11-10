import { PageHeader } from "@/components/layout/PageHeader"
import { BudgetSummaryCard } from "./components/BudgetSummaryCard"
import { CategoryTable } from "./components/CategoryTable"
import { useBudgetOverview } from "./hooks/useBudgetOverview"
import { BudgetCoverage, BudgetLifecycle } from './components/BudgetCoverage'

export function BudgetOverview() {
  const {
    activeBudget,
    tableData,
    totalAllocated,
    totalSpent,
    comparison,
    isLoading,
    error,
    retry,
    handleUpdateItem,
    handleAddBudgetItem,
    handleRemoveFromBudget,
  } = useBudgetOverview();

  return (
    <div className="flex flex-col gap-6">

      <PageHeader 
        title="Budget Overview" 
        subtitle={activeBudget ? `Status for ${activeBudget.name}` : "Budget coverage and history"}
      />

      {/* Content */}
            {isLoading ? <p role="status">Loading budgets…</p> : error ? <div role="alert"><p>Could not load budgets: {error}</p><button onClick={() => { void retry().catch(() => undefined); }}>Retry loading</button></div> : <div className="flex flex-col gap-6">
              {activeBudget && <>
              <BudgetCoverage budget={activeBudget} />
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
              </>}
              <BudgetLifecycle />
            </div>}

    </div>
  )
}
