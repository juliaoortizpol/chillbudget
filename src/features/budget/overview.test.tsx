import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BudgetOverview } from './index';

const state = vi.hoisted(() => ({ isLoading: true, error: null as string | null, retry: vi.fn().mockResolvedValue([]), activeBudget: undefined, tableData: [], totalAllocated: 0, totalSpent: 0, comparison: null }));
vi.mock('./hooks/useBudgetOverview', () => ({ useBudgetOverview: () => state }));
vi.mock('./components/BudgetCoverage', () => ({ BudgetCoverage: () => null, BudgetLifecycle: () => <p>Create or activate explicitly</p> }));
afterEach(cleanup);
it('distinguishes loading, failed requests/retry and the no-active state', () => {
  const { rerender } = render(<BudgetOverview />);
  expect(screen.getByRole('status').textContent).toContain('Loading budgets');
  expect(screen.queryByText('Create or activate explicitly')).toBeNull();
  state.isLoading = false; state.error = 'Synthetic unavailable';
  rerender(<BudgetOverview />);
  expect(screen.getByRole('alert').textContent).toContain('Synthetic unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
  expect(state.retry).toHaveBeenCalledTimes(1);
  state.error = null;
  rerender(<BudgetOverview />);
  expect(screen.getByText('Create or activate explicitly')).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
});
