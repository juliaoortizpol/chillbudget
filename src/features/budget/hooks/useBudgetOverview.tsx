import { useMemo } from "react"

import { useGlobalBudget } from "./useGlobalBudget"
import type { BudgetCategory } from "../components/CategoryTable"
import type { BudgetItemMatchingRule, UpdateBudgetItemDto } from "./useBudget"
import { getIcon } from "../utils/icons"

export function useBudgetOverview() {
  const {
    budgets,
    fetchBudgets,
    updateBudgetItem,
    deleteBudgetItem,
    addBudgetItem,
    isFetchingBudgets,
    fetchBudgetsError,
    activeBudget,
  } = useGlobalBudget();

  // Active budget is now provided by useGlobalBudget
  const tableData: BudgetCategory[] = useMemo(() => {
    if (!activeBudget || !activeBudget.items) return [];

    const mapped = activeBudget.items.map(item => {
      const allocated = item.plannedAmount || 0;

      const spent = item.spent || 0;

      // Extract base color if it's a hex, otherwise fallback to gray
      const baseColor = item.color || "#6b7280";

      return {
        id: item._id || '',
        name: item.name,
        matchingRules: item.matchingRules,
        allocated,
        spent,
        icon: getIcon(item.icon),
        iconBgClass: `${baseColor}1A`, // 10% opacity for background
        iconColor: baseColor,
      };
    });

    // Sort: items with allocated > 0 first, then by name
    return [...mapped].sort((a, b) => {
      if (a.allocated > 0 && b.allocated === 0) return -1;
      if (a.allocated === 0 && b.allocated > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [activeBudget]);

  const totalAllocated = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.allocated, 0);
  }, [tableData]);

  const totalSpent = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.spent, 0);
  }, [tableData]);

  const handleUpdateItem = async (itemId: string, updates: UpdateBudgetItemDto) => {
    if (!activeBudget) return;

    await updateBudgetItem(activeBudget._id, itemId, updates);
    await fetchBudgets(); // Refresh to get updated data
  };

  const comparison = useMemo(() => {
    if (!budgets || budgets.length < 2 || !activeBudget) return null;
    
    // Sort budgets by start date descending to find the one immediately before active
    const sortedBudgets = budgets.filter(b => b.status !== 'draft').sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    const activeIdx = sortedBudgets.findIndex(b => b._id === activeBudget._id);
    const prevBudget = sortedBudgets[activeIdx + 1];
    
    if (!prevBudget) return null;
    
    const prevAllocated = prevBudget.items?.reduce((sum, item) => sum + (item.plannedAmount || 0), 0) || 0;
    if (prevAllocated === 0) return null;
    
    const percentChange = ((totalAllocated - prevAllocated) / prevAllocated) * 100;
    const monthName = prevBudget.timezone
      ? new Date(prevBudget.startDate).toLocaleString('default', { month: 'long', timeZone: prevBudget.timezone })
      : prevBudget.name;
    
    return {
      percent: Math.abs(percentChange).toFixed(1),
      isIncrease: percentChange >= 0,
      prevMonth: monthName
    };
  }, [budgets, activeBudget, totalAllocated]);

  const handleAddBudgetItem = async (name: string, allocated: number, iconName?: string, matchingRules: BudgetItemMatchingRule[] = []) => {
    const budgetId = activeBudget?._id;
    if (!budgetId) throw new Error('Create or activate a budget before adding categories.');

    await addBudgetItem(budgetId, {
      name,
      type: "expense",
      icon: iconName || "default",
      color: "#10b981",
      plannedAmount: allocated || 0,
      matchingRules,
    });

    await fetchBudgets();
  };

  const handleRemoveFromBudget = async (itemId: string) => {
    if (!activeBudget) return;
    await deleteBudgetItem(activeBudget._id, itemId);
    await fetchBudgets();
  };

  return {
    activeBudget,
    tableData,
    totalAllocated,
    totalSpent,
    comparison,
    isLoading: isFetchingBudgets,
    error: fetchBudgetsError,
    retry: fetchBudgets,
    handleUpdateItem,
    handleAddBudgetItem,
    handleRemoveFromBudget,
  };
}
