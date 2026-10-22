import { useContext } from 'react';
import { BudgetContext } from '../context/budget-context';

export function useGlobalBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useGlobalBudget must be used within BudgetProvider');
  return ctx;
}
