import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BudgetHistory } from './BudgetHistory';
import type { SavedReport } from '../hooks/useBudgetReports';

const fetchApi = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('reads closing-time detail and later exception evidence from separate endpoints', async () => {
  const row = { transactionId: 'purchase', budgetItemId: 'saved-item', name: 'Saved purchase', date: '2025-02-10T00:00:00Z',
    currency: 'DOP', amount: -25.75, type: 'expense', currencyOrigin: 'manual-default' };
  const report: SavedReport = {
    _id: 'report', budgetId: 'budget', budgetName: 'Extended budget', timezone: 'UTC',
    startDate: '2025-01-01T00:00:00Z', actualCutoffDate: '2025-03-15T00:00:00Z',
    closedAt: '2025-03-17T00:00:00Z', transactions: [row],
    items: [{ budgetItemId: 'saved-item', categoryName: 'Historical label', plannedAmount: 70, actualAmount: 25.75, variance: 44.25 }],
    totals: { totalPlanned: 70, totalActualExpense: 25.75, totalActualIncome: 0, totalVariance: 44.25 },
    currencyContext: { actualsCurrency: 'DOP', planning: { currency: 'DOP', origin: 'explicit' }, transactions: [] },
  };
  const page = { page: 1, limit: 20, total: 1 };
  fetchApi.mockImplementation(async (path: string) => {
    if (path === '/budget-reports/report') return report;
    if (path === '/budget-reports/report/transactions/purchase') return row;
    if (path === '/budget-reports/report/exceptions?page=1') return { ...page, data: [{
      _id: 'exception', transactionId: 'purchase', createdAt: '2025-03-18T00:00:00Z',
      kind: 'correction', includedInSnapshot: true, inCoverageAfter: true,
      before: row, after: { ...row, name: 'Corrected live purchase', amount: -29 },
    }] };
    return { ...page, total: 0, data: [] };
  });
  render(<BudgetHistory open revision={0} selected="report" onSelect={vi.fn()} />);
  expect(await screen.findByRole('heading', { name: 'Saved closing report for Extended budget' })).toBeTruthy();
  expect(screen.getByRole('rowheader', { name: 'Historical label' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Saved details for Saved purchase' }));
  expect((await screen.findAllByRole('link', { name: 'Open live transaction' }))[0].getAttribute('href')).toBe('/transactions?transactionId=purchase');
  expect(fetchApi).toHaveBeenCalledWith('/budget-reports/report/transactions/purchase');
  expect(await screen.findByText(/these changes are excluded/i)).toBeTruthy();
  const exception = await screen.findByText(/^Correction · Corrected live purchase/);
  fireEvent.click(exception);
  expect(screen.getByText('Original purchase included at closing.')).toBeTruthy();
  expect(screen.getByText(/Corrected live purchase · -29 DOP/)).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'RD$ 25.75 DOP' })).toBeTruthy();
});
