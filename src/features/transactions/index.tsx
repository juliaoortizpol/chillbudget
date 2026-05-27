import React, { useEffect, useMemo } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TransactionsFilterBar } from "./components/TransactionsFilterBar"
import { TransactionsTable } from "./components/TransactionsTable"
import { Pagination } from "./components/Pagination"
import { useGlobalBudget } from "../budget/context/BudgetContext"
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
  const { activeBudget, isFetchingBudgets, fetchBudgets } = useGlobalBudget();
  const { 
    transactionsData, fetchTransactions, isFetchingTransactions, 
    updateTransaction, createTransaction, deleteTransaction 
  } = useTransactions();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateRange, setDateRange] = React.useState("Last 30 Days");
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [type, setType] = React.useState<string | null>(null);

  useEffect(() => {
    const { startDate, endDate } = getDateRangeFilter(dateRange);

    fetchTransactions({ 
      page: currentPage, 
      limit: 10,
      budgetItemId: categoryId || undefined,
      type: type as any || undefined,
      startDate,
      endDate
    }).then((res) => {
      if (res && res.meta && res.meta.totalPages > 0 && currentPage > res.meta.totalPages) {
        setCurrentPage(res.meta.totalPages);
      }
    });
  }, [fetchTransactions, currentPage, dateRange, categoryId, type]);

  const isLoading = isFetchingBudgets || isFetchingTransactions;
  
  const dynamicCategories = React.useMemo(() => {
    if (!activeBudget || !activeBudget.items) return {};

    return activeBudget.items.reduce((acc, item) => {
      if (!item._id) return acc;
      
      const allocated = item.plannedAmount || 0;
      const spent = item.spent || 0;
      const baseColor = item.color || "#6b7280";

      acc[item._id] = {
        id: item._id,
        name: item.name,
        icon: getIcon(item.icon),
        iconBgClass: `${baseColor}1A`,
        iconColor: baseColor,
        budgetUsedPercentage: allocated > 0 ? (spent / allocated) * 100 : 0
      };
      return acc;
    }, {} as Record<string, any>);
  }, [activeBudget]);

  const hasCategories = Object.keys(dynamicCategories).length > 0;

  const uiTransactions = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.map(t => {
      let cat = dynamicCategories[t.budgetItemId || ''];
      if (!cat) {
        cat = {
          id: t.budgetItemId || '',
          name: 'Uncategorized',
          icon: <span />,
          iconBgClass: 'bg-gray-500/10',
          iconColor: 'text-gray-500'
        } as unknown as TransactionCategory;
      }

      return {
        id: t._id,
        date: format(new Date(t.date), "MMM d, yyyy"),
        description: t.name,
        category: cat,
        amount: t.type === 'expense' ? -t.amount : t.amount
      }
    });
  }, [transactionsData, dynamicCategories]);

  const filteredUiTransactions = useMemo(() => {
    if (!searchQuery.trim()) return uiTransactions;
    const lower = searchQuery.toLowerCase();
    return uiTransactions.filter(t => t.description.toLowerCase().includes(lower));
  }, [uiTransactions, searchQuery]);

  const filterCategories = useMemo(() => Object.values(dynamicCategories).map((c: any) => ({ id: c.id, name: c.name })), [dynamicCategories]);

  const handleUpdateItem = async (id: string, updates: any) => {
    const dto: any = {};
    if (updates.description !== undefined) dto.name = updates.description;
    if (updates.amount !== undefined) {
      dto.amount = Math.abs(updates.amount);
      dto.type = updates.amount < 0 ? 'expense' : 'income';
    }
    if (updates.date !== undefined) dto.date = new Date(updates.date).toISOString();
    if (updates.category !== undefined) dto.budgetItemId = updates.category.id;
    
    await updateTransaction(id, dto);
    await fetchTransactions({ page: currentPage, limit: 10 });
    await fetchBudgets();
  }

  const handleDeleteItem = async (id: string) => {
    await deleteTransaction(id);
    await fetchTransactions({ page: currentPage, limit: 10 }).then((res) => {
      if (res && res.meta && res.meta.totalPages > 0 && currentPage > res.meta.totalPages) {
        setCurrentPage(res.meta.totalPages);
      }
    });
    await fetchBudgets();
  }

  const handleAppendItem = async (data: any) => {
    const cleanAmount = (data.amount || "").replace(/,/g, "");
    const parsedAmount = parseFloat(cleanAmount) || 0;
    
    const dto = {
      name: data.description,
      amount: Math.abs(parsedAmount),
      type: parsedAmount < 0 ? 'expense' : 'income' as 'expense' | 'income',
      date: new Date(data.date).toISOString(),
      budgetItemId: data.categoryKey
    };
    await createTransaction(dto);
    
    if (currentPage === 1) {
      await fetchTransactions({ page: 1, limit: 10 });
    } else {
      setCurrentPage(1);
    }
    await fetchBudgets();
  }
  return (
    <div className="min-h-screen flex w-full bg-ds-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="flex flex-col max-w-7xl mx-auto gap-8">
            
            {/* Header */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-extrabold tracking-tight text-foreground">Transactions</h1>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-6">
              {!hasCategories && !isLoading && (
                <Disclaimer 
                  type="warning"
                  title="No Categories Found"
                  text="You need to create budget categories before adding or categorizing transactions."
                />
              )}
              
              <TransactionsFilterBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                type={type}
                onTypeChange={setType}
                categories={filterCategories}
                onClearFilters={() => {
                  setSearchQuery("");
                  setDateRange("All Time");
                  setCategoryId(null);
                  setType(null);
                }}
              />
              
              <div className="flex flex-col gap-2">
                {isLoading && !uiTransactions.length ? (
                  <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
                ) : (
                  <>
                    <TransactionsTable 
                      data={filteredUiTransactions as any} 
                      onUpdateItem={handleUpdateItem} 
                      onDeleteItem={handleDeleteItem}
                      onAppendItem={handleAppendItem}
                      categories={dynamicCategories} 
                    />
                    {transactionsData?.meta && (
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={transactionsData.meta.totalPages}
                        totalItems={transactionsData.meta.total}
                        limit={transactionsData.meta.limit}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
