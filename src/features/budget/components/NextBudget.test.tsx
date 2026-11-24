import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NextBudget } from './NextBudget';
import type { Budget } from '../hooks/useBudget';
import { BudgetProvider } from '../context/BudgetContext';

const state = vi.hoisted(() => ({
  budgets: [] as Budget[], activeBudget: undefined as Budget | undefined,
  fetchBudgets: vi.fn(), createBudget: vi.fn(), fetchApi: vi.fn(),
  useProvider: false,
}));
vi.mock('../hooks/useGlobalBudget', async importOriginal => {
  const actual = await importOriginal<typeof import('../hooks/useGlobalBudget')>();
  return { useGlobalBudget: () => state.useProvider ? actual.useGlobalBudget() : state };
});
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
afterEach(() => { cleanup(); vi.resetAllMocks(); state.activeBudget = undefined; state.useProvider = false; });

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

it('keeps a confirmed empty draft visible when reloading fails and retries only loading', async () => {
  state.budgets = [base];
  state.createBudget.mockResolvedValue(draft);
  state.fetchBudgets.mockResolvedValueOnce([base])
    .mockRejectedValueOnce(new Error('Read failed'))
    .mockImplementationOnce(async () => { state.budgets = [base, draft]; return state.budgets; });
  render(<NextBudget />);
  fireEvent.click(screen.getByRole('button', { name: 'Start empty' }));
  fireEvent.change(screen.getByLabelText('Budget name'), { target: { value: 'Next' } });
  fireEvent.change(screen.getByLabelText(/provisional start/i), { target: { value: '2025-02-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(await screen.findByText('This draft has no budget items.')).toBeTruthy();
  fireEvent.click(await screen.findByRole('button', { name: 'Retry loading budgets' }));
  expect(await screen.findByRole('button', { name: 'Review draft Next' })).toBeTruthy();
  expect(state.createBudget).toHaveBeenCalledTimes(1);
  expect(state.fetchBudgets).toHaveBeenCalledTimes(3);
});

it('compares a date-only start at midnight UTC and sends a valid date unchanged', async () => {
  state.budgets = [base, draft];
  state.fetchApi.mockResolvedValue({ ...draft, status: 'active', startDate: '2025-02-03T00:00:00Z' });
  state.fetchBudgets.mockResolvedValue([]);
  render(<NextBudget />);
  fireEvent.click(screen.getByRole('button', { name: 'Review draft Next' }));
  expect(screen.getByText(/midnight UTC/)).toBeTruthy();
  const start = screen.getByLabelText(/optional activation start/i);
  const activate = screen.getByRole('button', { name: 'Activate reviewed draft' });
  fireEvent.change(start, { target: { value: '2025-02-02' } });
  fireEvent.click(activate);
  expect(await screen.findByText(/at or after the previous confirmed cutoff/)).toBeTruthy();
  expect(state.fetchApi).not.toHaveBeenCalled();
  fireEvent.change(start, { target: { value: '2025-02-03' } });
  fireEvent.click(activate);
  expect(await screen.findByText(/Activated coverage starts/)).toBeTruthy();
  expect(state.fetchApi).toHaveBeenCalledWith('/budgets/draft/activate', {
    method: 'POST', body: JSON.stringify({ startDate: '2025-02-03' }),
  });
});

it('edits copied rules by draft item ID and retries a failed refresh without another PATCH', async () => {
  state.useProvider = true;
  const original = [
    { id: 'user', field: 'description', operator: 'equals', value: '  Café, #42  ', source: 'user' },
    { id: 'learned', field: 'merchant', operator: 'equals', value: '  MARKET  ', source: 'learned' },
    { id: 'suggested', field: 'description', operator: 'contains', value: 'Groceries!', source: 'suggested' },
  ];
  const item = { _id: 'draft-item', name: 'Groceries', type: 'expense', plannedAmount: 120, matchingRules: original };
  const owned = [{ ...base, status: 'active', items: [{ ...item, _id: 'source-item' }] }, { ...draft, items: [item] }];
  const updated = { ...item, matchingRules: [
    { ...original[0], value: 'Café #43', operator: 'contains' }, original[1], original[2],
  ] };
  state.fetchApi.mockResolvedValueOnce(owned)
    .mockRejectedValueOnce(new Error('Could not save rules'))
    .mockResolvedValueOnce(updated)
    .mockRejectedValueOnce(new Error('Could not refresh'))
    .mockResolvedValueOnce([owned[0], { ...draft, items: [updated] }]);
  render(<BudgetProvider><NextBudget /></BudgetProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Review draft Next' }));
  fireEvent.click(screen.getByText('Advanced matching rules'));
  const rule = within(screen.getByRole('group', { name: 'Rule 1 (user)' }));
  fireEvent.change(rule.getByLabelText('Keyword'), { target: { value: 'Café #43' } });
  fireEvent.change(rule.getByLabelText('Match when it'), { target: { value: 'contains' } });
  const save = screen.getByRole('button', { name: 'Save matching rules' });
  fireEvent.click(save);
  expect(await screen.findByText('Could not save rules')).toBeTruthy();
  expect((rule.getByLabelText('Keyword') as HTMLInputElement).value).toBe('Café #43');
  fireEvent.click(save);
  expect(await screen.findByText('Draft matching rules saved.')).toBeTruthy();
  expect(await screen.findByText(/Saved. Retry loading budgets/)).toBeTruthy();
  const patch = ['/budgets/draft/items/draft-item', {
    method: 'PATCH', body: JSON.stringify({ matchingRules: updated.matchingRules.map(({ id, field, operator, value, source }) => ({
      id, field, operator, value, source,
    })) }),
  }];
  expect(state.fetchApi.mock.calls.slice(1, 4)).toEqual([patch, patch, ['/budgets', { method: 'GET' }]]);
  expect((rule.getByLabelText('Keyword') as HTMLInputElement).value).toBe('Café #43');
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading budgets' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry loading budgets' })).toBeNull());
  expect(state.fetchApi.mock.calls.slice(4)).toEqual([['/budgets', { method: 'GET' }]]);
  expect(owned[0].items[0].matchingRules).toEqual(original);
});
