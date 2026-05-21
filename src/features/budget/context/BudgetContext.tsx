import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useBudget, type Budget } from '../hooks/useBudget';

type BudgetContextType = Omit<ReturnType<typeof useBudget>, 'activeBudget'> & {
  activeBudget: Budget | undefined;
};

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const budget = useBudget();
  const hasFetched = useRef(false);

  useEffect(() => {
    // We can rely on the JWT token existence or let useFetch handle the error
    // We only want to fetch once when the provider mounts
    if (!hasFetched.current) {
      budget.fetchBudgets().then((list) => {
        if (!list || list.length === 0) {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          budget.createBudget({
            name: `Budget ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            periodType: 'monthly',
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            status: 'active'
          }).then(() => {
            budget.fetchBudgets();
          }).catch((err) => {
            console.error("Failed to auto-create budget on mount:", err);
          });
        }
      }).catch(() => {
        // Ignored, might not be logged in yet
      });
      hasFetched.current = true;
    }
  }, [budget.fetchBudgets, budget.createBudget]);

  const activeBudget = useMemo(() => {
    return budget.budgets?.find(b => b.status === 'active') || budget.budgets?.[0];
  }, [budget.budgets]);

  return (
    <BudgetContext.Provider value={{ ...budget, activeBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useGlobalBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useGlobalBudget must be used within BudgetProvider');
  return ctx;
}
