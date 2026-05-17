import React, { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TransactionsFilterBar } from "./components/TransactionsFilterBar"
import { TransactionsTable } from "./components/TransactionsTable"
import { Pagination } from "./components/Pagination"
import { mockTransactions } from "./data/mock-transactions"
import { useGlobalBudget } from "../budget/context/BudgetContext"
import { getIcon } from "../budget/utils/icons"
import { Disclaimer } from "@/components/ui/disclaimer"

export function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)

  const { activeBudget, isFetchingBudgets } = useGlobalBudget();
  const isLoading = isFetchingBudgets;
  
  const dynamicCategories = React.useMemo(() => {
    if (!activeBudget || !activeBudget.items) return {};

    return activeBudget.items.reduce((acc, item) => {
      if (!item._id) return acc;
      
      const allocated = item.plannedAmount || 0;
      const seed = item._id.charCodeAt(0) || 1;
      const spent = allocated > 0 ? (allocated * 0.8 * (seed % 10) / 10) : 0;
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

  const handleUpdateItem = (id: string, updates: any) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
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
                <div className="flex items-center text-[13px] font-medium text-muted-foreground gap-2">
                  <span>WealthConsole</span>
                  <span className="text-muted-foreground/50">{'>'}</span>
                  <span className="text-[#05603A] font-semibold">Transactions</span>
                </div>
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
              
              <TransactionsFilterBar />
              
              <div className="flex flex-col gap-2">
                <TransactionsTable data={transactions} onUpdateItem={handleUpdateItem} categories={dynamicCategories} />
                <Pagination />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
