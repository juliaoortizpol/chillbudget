import { Sidebar } from "./components/Sidebar"
import { BalanceCard } from "./components/BalanceCard"
import { MetricCard } from "./components/MetricCard"
import { ListWidget, type ListItem } from "./components/ListWidget"
import { ExpensesChart } from "./components/ExpensesChart"
import { FrequencyCard } from "./components/FrequencyCard"
import { Home, Utensils, Gamepad2, Car, ShoppingBag, Music, Coffee } from "lucide-react"

const popularCategories: ListItem[] = [
  { id: "1", icon: <Home className="w-5 h-5 text-blue-500" />, iconBgClass: "bg-blue-500/10", title: "Housing", amount: "$1,200.00", showChevron: true },
  { id: "2", icon: <Utensils className="w-5 h-5 text-green-500" />, iconBgClass: "bg-green-500/10", title: "Food", amount: "$460.00", showChevron: true },
  { id: "3", icon: <Gamepad2 className="w-5 h-5 text-purple-500" />, iconBgClass: "bg-purple-500/10", title: "Entertainment", amount: "$320.50", showChevron: true },
  { id: "4", icon: <Car className="w-5 h-5 text-orange-500" />, iconBgClass: "bg-orange-500/10", title: "Transportation", amount: "$249.50", showChevron: true },
]

const historyTransactions: ListItem[] = [
  { id: "1", icon: <ShoppingBag className="w-5 h-5 text-slate-600" />, iconBgClass: "bg-slate-100", title: "Nike", subtitle: "January 23, 2024", amount: "$119.99" },
  { id: "2", icon: <Music className="w-5 h-5 text-slate-600" />, iconBgClass: "bg-slate-100", title: "Apple Music", subtitle: "January 19, 2024", amount: "$24.99" },
  { id: "3", icon: <Gamepad2 className="w-5 h-5 text-slate-600" />, iconBgClass: "bg-slate-100", title: "PlayStation Plus", subtitle: "January 14, 2024", amount: "$24.99" },
  { id: "4", icon: <Coffee className="w-5 h-5 text-slate-600" />, iconBgClass: "bg-slate-100", title: "Starbucks Coffee", subtitle: "January 10, 2024", amount: "$14.99" },
  { id: "5", icon: <Utensils className="w-5 h-5 text-slate-600" />, iconBgClass: "bg-slate-100", title: "Burger King", subtitle: "January 10, 2024", amount: "$9.99" },
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-ds-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* We will add AppBar here later as requested */}
        <div className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6">
              <div className="h-[240px]">
                <BalanceCard />
              </div>
              <ListWidget title="POPULAR CATEGORY" items={popularCategories} />
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6">
              <MetricCard 
                title="REVENUE" 
                subtitle="Last Week" 
                amount="$1,550.00" 
                percentUp="35% Usages" 
                percentDown="65% Remaining"
                icon={<div className="w-4 h-4 bg-green-700 rounded-sm" />}
                iconColorClass="border-green-600 text-green-700"
              />
              <ExpensesChart />
              <FrequencyCard />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-6">
              <MetricCard 
                title="SAVINGS" 
                subtitle="Last Week" 
                amount="$260.00" 
                percentUp="15% Usages" 
                percentDown="85% Remaining"
                icon={<div className="w-4 h-4 rounded-full bg-green-800" />}
                iconColorClass="border-green-800"
              />
              <ListWidget title="HISTORY TRANSACTION" items={historyTransactions} />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
