import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TransactionsFilterBar } from "./components/TransactionsFilterBar"
import { TransactionsTable } from "./components/TransactionsTable"
import { Pagination } from "./components/Pagination"
import { mockTransactions } from "./data/mock-transactions"

export function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)

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
              <TransactionsFilterBar />
              
              <div className="flex flex-col gap-2">
                <TransactionsTable data={transactions} onUpdateItem={handleUpdateItem} />
                <Pagination />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
