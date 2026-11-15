import type { TransactionUpdates, AppendTransactionData } from "./types/table"
import type { GetTransactionsFilterDto, UpdateTransactionDto } from "./hooks/useTransactions"
import { useSearchParams } from "react-router-dom"
import React, { useEffect, useMemo } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { TransactionsFilterBar } from "./components/TransactionsFilterBar"
import { AddTransactionDialog, TransactionsTable } from "./components/TransactionsTable"
import { Pagination } from "./components/Pagination"
import { TransactionsSummary } from "./components/TransactionsSummary"
import { useGlobalBudget } from "../budget/hooks/useGlobalBudget"
import { getIcon } from "../budget/utils/icons"
import { Disclaimer } from "@/components/ui/disclaimer"
import { useTransactions } from "./hooks/useTransactions"
import { format } from "date-fns"
import { type TransactionCategory } from "./data/mock-transactions"

function getDateRangeFilter(dateRange: string): { startDate?: string, endDate?: string } {
  let startDate: string | undefined;
  let endDate: string | undefined;

  const now = new Date();
  if (dateRange === 'Last 7 Days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString();
    endDate = now.toISOString();
  } else if (dateRange === 'Last 30 Days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString();
    endDate = now.toISOString();
  } else if (dateRange === 'This Month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = d.toISOString();
    endDate = now.toISOString();
  }

  return { startDate, endDate };
}

export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const { activeBudget, budgets, isFetchingBudgets, fetchBudgets, fetchBudgetsError } = useGlobalBudget();
  const { 
    transactionsData, fetchTransactions, isFetchingTransactions, 
    updateTransaction, createTransaction, deleteTransaction, fetchTransactionsError
  } = useTransactions();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 5 : 10
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateRange, setDateRange] = React.useState("Last 30 Days");
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [type, setType] = React.useState<string | null>(null);
  const [needsReview, setNeedsReview] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPageSize(event.matches ? 5 : 10);
      setCurrentPage(1);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [feedback, setFeedback] = React.useState<string | null>(null);
  const selectedFilter = React.useMemo<GetTransactionsFilterDto>(() => ({
    page: currentPage, limit: pageSize, budgetItemId: categoryId || undefined,
    type: type === "expense" || type === "income" ? type : undefined,
    matchingStatus: needsReview ? 'needs_review' : undefined,
  }), [currentPage, pageSize, categoryId, type, needsReview]);
  const getSelectedFilter = React.useCallback(() => ({
    ...selectedFilter, ...getDateRangeFilter(dateRange),
  }), [selectedFilter, dateRange]);

  const latestFilter = React.useRef(getSelectedFilter);
  React.useLayoutEffect(() => {
    latestFilter.current = getSelectedFilter;
  }, [getSelectedFilter]);

  const refreshTransactions = React.useCallback(async () => {
    const getFilter = latestFilter.current;
    const filter = getFilter();
    const res = await fetchTransactions(filter);
    const lastPage = Math.max(1, res.meta.totalPages);
    if (getFilter === latestFilter.current && (filter.page ?? 1) > lastPage) {
      setCurrentPage(lastPage);
    }
    return res;
  }, [fetchTransactions]);

  useEffect(() => {
    refreshTransactions().catch(() => {});
  }, [getSelectedFilter, refreshTransactions]);

  const isLoading = isFetchingTransactions;
  
  const dynamicCategories = React.useMemo(() => {
    return (budgets ?? (activeBudget ? [activeBudget] : [])).reduce((all, budget) => {
    if (!budget.items) return all;

    return budget.items.reduce((acc, item) => {
      if (!item._id) return acc;
      
      const allocated = item.plannedAmount || 0;
      const spent = item.spent || 0;

      acc[item._id] = {
        id: item._id,
        type: item.type,
        status: budget.status,
        coverageVersion: budget.coverageVersion,
        actualCutoffDate: budget.actualCutoffDate,
        startDate: budget.startDate,
        endDate: budget.endDate,
        name: item.name,
        matchingRules: item.matchingRules,
        icon: getIcon(item.icon),
        color: item.color,
        iconBgClass: "bg-muted",
        iconColor: "text-foreground",
        budgetUsedPercentage: allocated > 0 ? (spent / allocated) * 100 : 0
      };
      return acc;
    }, all);
    }, {} as Record<string, TransactionCategory>);
  }, [budgets, activeBudget]);

  const hasCategories = Object.keys(dynamicCategories).length > 0;

  const uiTransactions = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.map(t => {
      let cat = dynamicCategories[t.budgetItemId || ''];
      if (!cat) {
        cat = {
          id: t.budgetItemId || '',
          name: t.budgetItemId ? 'Saved category' : 'Uncategorized',
          icon: null,
          iconBgClass: 'bg-blue-500/10',
          iconColor: 'text-foreground'
        };
      }

      return {
        id: t._id,
        timestamp: t.date,
        type: t.type,
        matchingStatus: t.budgetItemId && (!t.matchingStatus || t.matchingStatus === 'needs_review') ? 'linked' : t.matchingStatus,
        date: format(new Date(t.date), "MMM d, yyyy"),
        description: t.name,
        category: cat,
        // Email-imported expenses can already be stored as negative amounts.
        // Normalize the display sign instead of negating the raw value blindly.
        amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount)
      }
    });
  }, [transactionsData, dynamicCategories]);

  const filteredUiTransactions = useMemo(() => {
    if (!searchQuery.trim()) return uiTransactions;
    const lower = searchQuery.toLowerCase();
    return uiTransactions.filter(t => t.description.toLowerCase().includes(lower));
  }, [uiTransactions, searchQuery]);

  const transactionSummary = useMemo(() => {
    const totalSpent = filteredUiTransactions.reduce(
      (sum, transaction) => transaction.amount < 0 ? sum + Math.abs(transaction.amount) : sum,
      0
    );
    const monthlyBudget = activeBudget?.items
      ?.filter((item) => !categoryId || item._id === categoryId)
      .reduce((sum, item) => sum + (item.plannedAmount || 0), 0) || 0;
    const maxTransaction = filteredUiTransactions.reduce(
      (max, transaction) => Math.max(max, Math.abs(transaction.amount)),
      0
    );

    return {
      totalSpent,
      monthlyBudget,
      maxTransaction,
      totalTransactions: filteredUiTransactions.length,
      budgetUsed: monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0,
    };
  }, [activeBudget, categoryId, filteredUiTransactions]);

  const filterCategories = useMemo(() => Object.entries(dynamicCategories).map(([id, category]) => ({ id, name: category.name })), [dynamicCategories]);

  const emptyState = useMemo(() => {
    if (needsReview) return {
      title: "No expenses need review",
      description: "No expenses need review with the selected search, period and filters.",
    };
    const hasSpecificFilters = Boolean(searchQuery.trim() || categoryId || type);

    if (hasSpecificFilters) {
      return {
        title: "No matching transactions",
        description: "Try changing or clearing your search and filters.",
      };
    }

    if (dateRange === "All Time") {
      return {
        title: "No transactions yet",
        description: "Add your first transaction using the form below.",
      };
    }

    return {
      title: `No transactions in ${dateRange.toLowerCase()}`,
      description: "Choose a different period or add a new transaction.",
    };
  }, [categoryId, dateRange, searchQuery, type, needsReview]);

  const handleUpdateItem = React.useCallback(async (id: string, updates: TransactionUpdates) => {
    const dto: UpdateTransactionDto = {};
    if (updates.description !== undefined) dto.name = updates.description;
    if (updates.amount !== undefined) {
      dto.amount = Math.abs(updates.amount);
      dto.type = updates.amount < 0 ? 'expense' : 'income';
    }
    if (updates.date !== undefined) dto.date = new Date(updates.date).toISOString();
    if (updates.category !== undefined) dto.budgetItemId = updates.category.id || null;
    if (updates.rememberMerchant && updates.category?.id && transactionsData?.data.find(t => t._id === id)?.type === 'expense') {
      dto.rememberMerchant = true;
      dto.merchantKeyword = updates.merchantKeyword;
    }
    
    setFeedback(null);
    try {
      const saved = await updateTransaction(id, dto);
      setFeedback(`Saved${dto.rememberMerchant ? ' and merchant remembered' : ''}. Matching status: ${saved.matchingStatus || "updated"}.`);
      await Promise.all([refreshTransactions(), fetchBudgets()]).catch(() => {
        setFeedback("Transaction saved. Could not refresh transactions or budget actuals. Reload to try again.");
      });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save transaction. Try again.");
      if (updates.category !== undefined && transactionsData?.data.find(t => t._id === id)?.type === 'expense') throw error;
    }
  }, [transactionsData, updateTransaction, refreshTransactions, fetchBudgets]);

  const handleDeleteItem = React.useCallback(async (id: string) => {
    await deleteTransaction(id);
    await refreshTransactions();
    await fetchBudgets();
  }, [deleteTransaction, refreshTransactions, fetchBudgets]);

  const handleAppendItem = async (data: AppendTransactionData) => {
    const cleanAmount = (data.amount || "").replace(/,/g, "");
    const parsedAmount = parseFloat(cleanAmount) || 0;
    
    const dto = {
      name: data.description,
      amount: Math.abs(parsedAmount),
      type: parsedAmount < 0 ? 'expense' : 'income' as 'expense' | 'income',
      date: new Date(data.date ?? new Date()).toISOString(),
      ...(data.categoryKey ? { budgetItemId: data.categoryKey } : {})
    };
    const saved = await createTransaction(dto);
    setFeedback(`Created. Matching status: ${saved.matchingStatus || "updated"}.`);
    try {
      await Promise.all([refreshTransactions(), fetchBudgets()]);
    } catch {
      setFeedback("Transaction created. Could not refresh transactions or budget actuals. Reload to try again.");
    }
  }
  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      
      <PageHeader title="Transactions" />
      <AddTransactionDialog defaultOpen={searchParams.get("create") === "1"} categories={dynamicCategories} onAppend={handleAppendItem} />

      {feedback && <p role="status">{feedback}</p>}
      {/* Content Area */}
            <div className="flex flex-col gap-6">
              <TransactionsSummary {...transactionSummary} />

              {fetchBudgetsError && <div role="alert">
                <p>Could not load categories: {fetchBudgetsError}. Previously loaded categories remain available.</p>
                <button type="button" disabled={isFetchingBudgets} onClick={() => { void fetchBudgets().catch(() => undefined); }}>Retry categories</button>
              </div>}
              {isFetchingBudgets && <p role="status">Loading categories…</p>}
              {!activeBudget && !isFetchingBudgets && !fetchBudgetsError && <p>No active budget. Create or activate a budget on the Budget page to assign categories.</p>}
              {!hasCategories && !isFetchingBudgets && !fetchBudgetsError && (
                <Disclaimer 
                  type="warning"
                  title="No Categories Found"
                  text="Create budget categories to assign transactions. You can add transactions without a category."
                />
              )}
              
              <div className="sticky top-16 z-20 -mx-1 bg-ds-background/95 px-1 py-2 backdrop-blur md:static md:mx-0 md:bg-transparent md:p-0">
              <TransactionsFilterBar 
                searchQuery={searchQuery}
                onSearchChange={(query) => {
                  setSearchQuery(query);
                  setCurrentPage(1);
                }}
                dateRange={dateRange}
                onDateRangeChange={(value) => { setDateRange(value); setCurrentPage(1); }}
                categoryId={categoryId}
                onCategoryChange={(value) => { setCategoryId(value); setCurrentPage(1); }}
                type={type}
                onTypeChange={(value) => { setType(value); setCurrentPage(1); }}
                needsReview={needsReview}
                onNeedsReviewChange={(value) => { setNeedsReview(value); setCurrentPage(1); }}
                categories={filterCategories}
                onClearFilters={() => {
                  setSearchQuery("");
                  setDateRange("All Time");
                  setCategoryId(null);
                  setType(null);
                  setNeedsReview(false);
                  setCurrentPage(1);
                }}
              />
              </div>
              
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  <div role="status" className="p-8 text-center text-muted-foreground">Loading transactions...</div>
                ) : fetchTransactionsError ? (
                  <div role="alert" className="p-8 text-center">
                    <p>Could not load transactions: {fetchTransactionsError}</p>
                    <button type="button" onClick={() => { refreshTransactions().catch(() => {}); }}>Try again</button>
                  </div>
                ) : (
                  <>
                    <TransactionsTable 
                      data={filteredUiTransactions}
                      onUpdateItem={handleUpdateItem} 
                      onDeleteItem={handleDeleteItem}
                      onAppendItem={handleAppendItem}
                      categories={dynamicCategories} 
                      emptyTitle={emptyState.title}
                      emptyDescription={emptyState.description}
                    />
                    {transactionsData?.meta && (
                      <Pagination 
                        currentPage={searchQuery.trim() ? 1 : currentPage}
                        totalPages={searchQuery.trim() ? 1 : transactionsData.meta.totalPages}
                        totalItems={searchQuery.trim() ? filteredUiTransactions.length : transactionsData.meta.total}
                        limit={transactionsData.meta.limit}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

    </div>
  )
}
