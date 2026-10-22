import { createContext } from 'react';
import type { useBudget, Budget } from '../hooks/useBudget';

type BudgetContextType = Omit<ReturnType<typeof useBudget>, 'activeBudget'> & {
  activeBudget: Budget | undefined;
};

export const BudgetContext = createContext<BudgetContextType | null>(null);

