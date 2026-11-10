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
    hasLoaded,
    saveFeedback,
    error,
    retry,
    handleUpdateItem,
    handleAddBudgetItem,
    handleRemoveFromBudget,
  } = useBudgetOverview();

  return (
    <div className="flex flex-col gap-6">

      {!activeBudget && <PageHeader
        title="Budget Overview" 
        subtitle="Budget coverage and history"
      />}

      {/* Content */}
            {saveFeedback && <p role="status">{saveFeedback}</p>}
            {error && <div role="alert"><p>Could not load budgets: {error}</p><button disabled={isLoading} onClick={() => { void retry().catch(() => undefined); }}>Retry loading</button></div>}
            {isLoading && !hasLoaded ? <p role="status">Loading budgets…</p> : !hasLoaded && error ? null : <div className="flex flex-col gap-6">
              {isLoading && <p role="status">Refreshing budgets…</p>}
              {activeBudget && <>
              <BudgetCoverage budget={activeBudget} heading />
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
                isLoading={false}
              />
              </>}
              <BudgetLifecycle />
            </div>}

    </div>
  )
}
