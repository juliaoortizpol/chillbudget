import React, { useEffect, useMemo } from "react"

import { useBudget } from "./useBudget"
import type { BudgetCategory } from "../components/CategoryTable"
import { Car, Utensils, Tv, HeartPulse, Wallet, Box } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  car: <Car className="w-5 h-5" />,
  utensils: <Utensils className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  heart: <HeartPulse className="w-5 h-5" />,
  wallet: <Wallet className="w-5 h-5" />,
  default: <Box className="w-5 h-5" />,
}

function getIcon(iconName: string | undefined) {
  if (!iconName) return iconMap.default;
  return iconMap[iconName.toLowerCase()] || iconMap.default;
}

export function useBudgetOverview() {


  const {
    budgets,
    fetchBudgets,
    updateBudgetItem,
    createBudget,
    deleteBudgetItem,
    addBudgetItem,
    isFetchingBudgets,
  } = useBudget();

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleCreateBudget = async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await createBudget({
      name: `Budget ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      periodType: 'monthly',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'active'
    });
    await fetchBudgets();
  };

  // Use the first active budget or fallback to the first budget
  const activeBudget = budgets?.find(b => b.status === 'active') || budgets?.[0];

  const tableData: BudgetCategory[] = useMemo(() => {
    if (!activeBudget || !activeBudget.items) return [];

    return activeBudget.items.map(item => {
      const allocated = item.plannedAmount || 0;

      // Mock spent value for demo purposes (Option B)
      const seed = item._id?.charCodeAt(0) || 1;
      const spent = allocated > 0 ? (allocated * 0.8 * (seed % 10) / 10) : 0;

      // Extract base color if it's a hex, otherwise fallback to gray
      const baseColor = item.color || "#6b7280";

      return {
        id: item._id || '',
        name: item.name,
        description: item.description || item.type, // Using description or fallback to type
        allocated,
        spent,
        icon: getIcon(item.icon),
        iconBgClass: `${baseColor}1A`, // 10% opacity for background
        iconColor: baseColor,
      };
    });
  }, [activeBudget]);

  const totalAllocated = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.allocated, 0);
  }, [tableData]);

  const totalSpent = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.spent, 0);
  }, [tableData]);

  const handleUpdateAllocated = async (itemId: string, amount: number) => {
    if (!activeBudget) return;

    await updateBudgetItem(activeBudget._id, itemId, { plannedAmount: amount });
    await fetchBudgets(); // Refresh to get updated data
  };

  const handleAddBudgetItem = async (name: string, description: string, allocated: number) => {
    if (!activeBudget) return;

    await addBudgetItem(activeBudget._id, {
      name,
      description,
      type: "expense",
      icon: "default",
      color: "#10b981",
      plannedAmount: allocated || 0,
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
    isLoading: isFetchingBudgets,
    handleUpdateAllocated,
    handleAddBudgetItem,
    handleCreateBudget,
    handleRemoveFromBudget,
  };
}
