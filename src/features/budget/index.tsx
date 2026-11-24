import { PageHeader } from "@/components/layout/PageHeader"
import { BudgetSummaryCard } from "./components/BudgetSummaryCard"
import { CategoryTable } from "./components/CategoryTable"
import { useBudgetOverview } from "./hooks/useBudgetOverview"
import { BudgetCoverage, BudgetLifecycle } from './components/BudgetCoverage'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'
import { BudgetClose } from './components/BudgetClose'
import { BudgetHistory } from './components/BudgetHistory'
import type { Budget } from './hooks/useBudget'
import { NextBudget } from './components/NextBudget'
import { useBudgetReports } from './hooks/useBudgetReports'

export function BudgetOverview() {
  const historyId = useId();
  const historyRef = useRef<HTMLDetailsElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRevision, setHistoryRevision] = useState(0);
  const [selectedReport, setSelectedReport] = useState<string>();
  const [closingBudget, setClosingBudget] = useState<Budget>();
  const closeTrigger = useRef<HTMLButtonElement>(null);
  const reports = useBudgetReports();
  const showHistory = () => {
    const details = historyRef.current;
    if (!details) return;
    details.open = true;
    setHistoryOpen(true);
    details.querySelector('summary')?.focus({ preventScroll: true });
    details.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  };
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
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 basis-72"><BudgetCoverage budget={activeBudget} heading /></div>
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">
                  <Button variant="outline" aria-expanded={historyOpen} aria-controls={historyId} onClick={showHistory}>
                    <History aria-hidden="true" className="size-4" />History
                  </Button>
                  <Button ref={closeTrigger} variant="outline" onClick={() => setClosingBudget(activeBudget)}>Review and close</Button>
                </div>
              </div>
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
              {closingBudget && <BudgetClose budget={closingBudget} onDismiss={() => {
                setClosingBudget(undefined);
                if (closeTrigger.current) closeTrigger.current.focus();
                else historyRef.current?.querySelector('summary')?.focus();
              }} onClosed={async id => {
                let savedId = id;
                if (!savedId) {
                  for (let page = 1; ; page++) {
                    const result = await reports.history(page);
                    const entry = result.data.find(row => row._id === closingBudget._id);
                    if (entry) {
                      savedId = entry.reportId ?? undefined;
                      break;
                    }
                    if (page * result.limit >= result.total) break;
                  }
                  if (!savedId) throw new Error('Saved report is not available yet.');
                }
                setSelectedReport(savedId);
                setHistoryRevision(previous => previous + 1);
                showHistory();
                await retry();
              }} />}
              <BudgetLifecycle historyId={historyId} historyRef={historyRef} onHistoryToggle={setHistoryOpen}
                history={<BudgetHistory open={historyOpen} revision={historyRevision} selected={selectedReport} onSelect={setSelectedReport} />} />
              <NextBudget />
            </div>}

    </div>
  )
}
