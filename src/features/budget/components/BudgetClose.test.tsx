import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BudgetClose } from './BudgetClose';
import type { Budget } from '../hooks/useBudget';
import { ApiError } from '@/hooks/useFetch';

const api = vi.hoisted(() => ({ preview: vi.fn(), close: vi.fn(), ownedBudget: vi.fn() }));
vi.mock('../hooks/useBudgetReports', () => ({ useBudgetReports: () => api }));

const budget: Budget = {
  _id: 'budget', name: 'Synthetic extended period', periodType: 'monthly', status: 'active',
  startDate: '2025-01-01T00:00:00Z', plannedEndDate: '2025-01-31T00:00:00Z',
  timezone: 'UTC', items: [], createdAt: '', updatedAt: '',
};
const preview = {
  budgetId: budget._id, budgetName: budget.name, startDate: budget.startDate,
  plannedEndDate: budget.plannedEndDate, actualCutoffDate: '2025-02-14T00:00:00Z',
  timezone: 'UTC', items: [], transactions: [], blockers: [], actualsCurrency: 'DOP',
  totals: { totalPlanned: 100, totalActualIncome: 0, totalActualExpense: 20, totalVariance: 80 },
  previewToken: 'first',
};
afterEach(() => { cleanup(); vi.resetAllMocks(); });

async function review() {
  fireEvent.click(await screen.findByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Close budget' }));
}

it('requires explicit review after a stale preview and only retries the post-close read', async () => {
  api.preview.mockResolvedValueOnce(preview).mockResolvedValueOnce({ ...preview, previewToken: 'new' });
  api.close.mockRejectedValueOnce(new ApiError('Changed', 409, 'stale_close_preview'))
    .mockResolvedValueOnce({ reportId: 'report' });
  const onClosed = vi.fn().mockRejectedValueOnce(new Error('Read unavailable')).mockResolvedValueOnce(undefined);
  render(<BudgetClose budget={budget} onDismiss={vi.fn()} onClosed={onClosed} />);
  fireEvent.change(screen.getByLabelText('Close through calendar day'), { target: { value: '2025-02-13' } });
  fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));
  await review();
  await screen.findByText(/closing evidence changed/i);
  expect(api.preview).toHaveBeenNthCalledWith(1, budget._id, { closeThroughDate: '2025-02-13' });
  expect(api.preview).toHaveBeenNthCalledWith(2, budget._id, { actualCutoffDate: preview.actualCutoffDate });
  expect(api.close).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Close budget' })).toHaveProperty('disabled', true);
  await review();
  fireEvent.click(await screen.findByRole('button', { name: 'Retry loading closure' }));
  await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(2));
  expect(api.close).toHaveBeenCalledTimes(2);
  expect(api.close.mock.lastCall?.[1].previewToken).toBe('new');
});

it('keeps blocked figures incomplete and dismisses without a close write', async () => {
  api.preview.mockResolvedValue({ ...preview, blockers: [{ code: 'unassigned', transactionId: 'owned' }] });
  const dismiss = vi.fn();
  render(<BudgetClose budget={budget} onDismiss={dismiss} onClosed={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));
  expect(await screen.findByText(/figures are incomplete/i)).toBeTruthy();
  expect(screen.getByRole('link', { name: /review live transaction/i }).getAttribute('href')).toBe('/transactions?transactionId=owned');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(api.close).not.toHaveBeenCalled();
});

it.each([
  [{ currency: 'DOP', origin: 'dop-v1-planning' }, 'DOP (set when the budget was created)'],
  [{ currency: 'DOP', origin: 'explicit-resolution' }, 'DOP (confirmed for a legacy budget)'],
  [{ currency: 'USD', origin: 'unknown' }, 'USD (unsupported for planning)'],
  [undefined, 'Unresolved'],
])('shows planning currency evidence in product language', async (planningCurrencyContext, label) => {
  api.preview.mockResolvedValue({ ...preview, planningCurrencyContext });
  render(<BudgetClose budget={budget} onDismiss={vi.fn()} onClosed={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));
  expect(await screen.findByText(`Planning currency: ${label}`)).toBeTruthy();
});
