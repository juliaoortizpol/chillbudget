import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useBudget } from '../hooks/useBudget';

type BudgetContextType = ReturnType<typeof useBudget>;

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const budget = useBudget();
  const hasFetched = useRef(false);

  useEffect(() => {
    // We can rely on the JWT token existence or let useFetch handle the error
    // We only want to fetch once when the provider mounts
    if (!hasFetched.current) {
      budget.fetchBudgets().catch(() => {
        // Ignored, might not be logged in yet
      });
      hasFetched.current = true;
    }
  }, [budget.fetchBudgets]);

  return (
    <BudgetContext.Provider value={budget}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useGlobalBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useGlobalBudget must be used within BudgetProvider');
  return ctx;
}
