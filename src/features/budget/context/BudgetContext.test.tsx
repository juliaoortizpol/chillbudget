import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BudgetProvider } from './BudgetContext';
import { useGlobalBudget } from '../hooks/useGlobalBudget';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn() }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
function Probe() {
  const { activeBudget, isFetchingBudgets } = useGlobalBudget();
  return <p>{isFetchingBudgets ? 'Loading' : activeBudget ? `${activeBudget._id}: ${activeBudget.items[0].spent}` : 'No active budget'}</p>;
}
it('never promotes a draft or closed record through fallback', async () => {
  fetchApi.mockResolvedValue([{ _id: 'draft', status: 'draft', items: [] }, { _id: 'closed', status: 'closed', items: [] }]);
  render(<BudgetProvider><Probe /></BudgetProvider>);
  await screen.findByText('No active budget');
  expect(fetchApi).toHaveBeenCalledTimes(1);
});
it('keeps the active budget and server spending past its planned year', async () => {
  fetchApi.mockResolvedValue([{ _id: 'draft', status: 'draft', items: [] }, { _id: 'extended', status: 'active', coverageVersion: 1, startDate: '2023-11-01', plannedEndDate: '2023-11-30', items: [{ name: 'Synthetic', type: 'expense', plannedAmount: 5, spent: 127 }] }]);
  render(<BudgetProvider><Probe /></BudgetProvider>);
  await waitFor(() => expect(screen.getByText('extended: 127')).toBeTruthy());
  expect(fetchApi).toHaveBeenCalledTimes(1);
});
