import React, { useEffect, useRef, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import { BudgetContext } from './budget-context';

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const budget = useBudget();
  const { fetchBudgets } = budget;
  const hasFetched = useRef(false);

  useEffect(() => {
    // We can rely on the JWT token existence or let useFetch handle the error
    // We only want to fetch once when the provider mounts
    if (!hasFetched.current) {
      void fetchBudgets().catch(() => undefined);
      hasFetched.current = true;
    }
  }, [fetchBudgets]);

  const activeBudget = useMemo(() => {
    return budget.budgets?.find(b => b.status === 'active') || budget.budgets?.[0];
  }, [budget.budgets]);

  return (
    <BudgetContext.Provider value={{ ...budget, activeBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}
