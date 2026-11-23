import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NextBudget } from './NextBudget';
import type { Budget } from '../hooks/useBudget';

const state = vi.hoisted(() => ({
  budgets: [] as Budget[], activeBudget: undefined as Budget | undefined,
  fetchBudgets: vi.fn(), createBudget: vi.fn(), fetchApi: vi.fn(),
}));
vi.mock('../hooks/useGlobalBudget', () => ({ useGlobalBudget: () => state }));
vi.mock('@/hooks/useFetch', async importOriginal => ({
  ...await importOriginal<typeof import('@/hooks/useFetch')>(),
  useFetch: () => ({ fetchApi: state.fetchApi }),
}));

const base: Budget = {
  _id: 'prior', name: 'Previous', status: 'closed', periodType: 'monthly',
  startDate: '2025-01-01T00:00:00Z', actualCutoffDate: '2025-02-02T04:00:00Z',
  timezone: 'America/Santo_Domingo', items: [], createdAt: '', updatedAt: '',
};
const draft: Budget = { ...base, _id: 'draft', name: 'Next', status: 'draft', startDate: '2025-02-01T00:00:00Z' };
afterEach(() => { cleanup(); vi.resetAllMocks(); state.activeBudget = undefined; });

it('reconciles a lost copy response against the owned list before allowing another creation', async () => {
  state.activeBudget = { ...base, status: 'active' };
  state.budgets = [state.activeBudget];
  state.fetchBudgets.mockResolvedValueOnce(state.budgets).mockResolvedValueOnce([...state.budgets, draft]);
  state.fetchApi.mockRejectedValueOnce(new Error('Connection interrupted'));
  render(<NextBudget />);
  fireEvent.click(screen.getByRole('button', { name: 'Create from previous' }));
  fireEvent.change(screen.getByLabelText('Budget name'), { target: { value: 'Next' } });
  fireEvent.change(screen.getByLabelText(/provisional start/i), { target: { value: '2025-02-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(await screen.findByText('Found the saved draft.')).toBeTruthy();
  expect(state.fetchApi).toHaveBeenCalledTimes(1);
  expect(state.fetchApi).toHaveBeenCalledWith('/budgets/prior/drafts', expect.objectContaining({
    method: 'POST', body: JSON.stringify({
      name: 'Next', periodType: 'monthly', startDate: '2025-02-01',
      timezone: 'America/Santo_Domingo', currency: 'DOP',
    }),
  }));
  expect(state.createBudget).not.toHaveBeenCalled();
});

it('shows the prior cutoff separately and activates with the server default', async () => {
  state.budgets = [base, draft];
  state.fetchApi.mockResolvedValue({ ...draft, status: 'active', startDate: base.actualCutoffDate });
  state.fetchBudgets.mockResolvedValue([]);
  render(<NextBudget />);
  fireEvent.click(screen.getByRole('button', { name: 'Review draft Next' }));
  expect(screen.getByText(/default from the previous confirmed cutoff/i)).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/optional activation start/i), { target: { value: '2025-02-01T01:00:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Activate reviewed draft' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(state.fetchApi).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/optional activation start/i), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Activate reviewed draft' }));
  await waitFor(() => expect(state.fetchApi).toHaveBeenCalledWith('/budgets/draft/activate', { method: 'POST', body: '{}' }));
  expect((await screen.findByRole('link', { name: 'Review expenses in the active budget' })).getAttribute('href')).toBe('/transactions?budgetId=draft');
});
