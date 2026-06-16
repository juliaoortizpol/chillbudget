import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
// Sidebar removed as it is now in MainLayout

import { ListWidget, type ListItem } from "./components/ListWidget"
import { ExpensesChart } from "./components/ExpensesChart"
import { ShoppingBag } from "lucide-react"
import { useBudgetOverview } from "../budget/hooks/useBudgetOverview"
import { useTransactions } from "../transactions/hooks/useTransactions"

export function DashboardLayout() {
  const navigate = useNavigate();
  const { tableData } = useBudgetOverview();
  const { transactionsData, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions({ limit: 15 });
  }, [fetchTransactions]);

  const dynamicPopularCategories = useMemo<ListItem[]>(() => {
    // Sort by highest allocated amount to simulate "popular"
    const sorted = [...tableData].sort((a, b) => b.allocated - a.allocated);
    
    // Take top 5
    return sorted.slice(0, 5).map(cat => {
      // Assuming cat.iconColor is something like "#10b981", 
      // we can add an alpha for the background. 
      // The hook already generates an iconBgClass that is actually a color hex like #10b9811A.
      return {
        id: cat.id,
        icon: <div style={{ color: cat.iconColor }}>{cat.icon}</div>,
        iconBgColor: cat.iconBgClass, // Actually a hex color string with opacity like "#10b9811A"
        title: cat.name,
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cat.allocated),
        showChevron: true,
      };
    });
  }, [tableData]);

  const dynamicHistoryTransactions = useMemo<ListItem[]>(() => {
    if (!transactionsData?.data) return [];

    return transactionsData.data.map(t => {
      const category = tableData.find(cat => cat.id === t.budgetItemId);
      const icon = category ? category.icon : <ShoppingBag className="w-5 h-5 text-slate-600" />;
      const iconBgColor = category ? category.iconBgClass : undefined; 
      const iconBgClass = category ? "" : "bg-slate-100";

      return {
        id: t._id,
        icon: <div style={{ color: category?.iconColor || 'inherit' }}>{icon}</div>,
        iconBgColor,
        iconBgClass,
        title: t.name,
        subtitle: new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(t.amount)),
      };
    });
  }, [transactionsData, tableData]);

  const handleCategoryClick = () => {
    navigate("/budget");
  };

  const handleTransactionClick = () => {
    navigate("/transactions");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      
      {/* Column 1 */}
      <div className="flex flex-col gap-6">

        <ListWidget 
          title="POPULAR CATEGORY" 
          items={dynamicPopularCategories} 
          onItemClick={handleCategoryClick} 
        />
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-6">
        <ExpensesChart />
      </div>

      {/* Column 3 */}
      <div className="flex flex-col gap-6">
        <ListWidget 
          title="HISTORY TRANSACTION" 
          items={dynamicHistoryTransactions} 
          onItemClick={handleTransactionClick}
        />
      </div>

    </div>
  )
}
