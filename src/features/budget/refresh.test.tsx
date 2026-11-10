import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BudgetProvider } from './context/BudgetContext';
import { BudgetOverview } from './index';
import { TransactionsPage } from '../transactions';
import { MemoryRouter } from 'react-router-dom';
import { EditableCategoryCell } from '../transactions/components/TransactionsTable';
import { eligibleCategories } from '../transactions/components/TransactionsTable/useTransactionsTable';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn() }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
const item = { _id: 'food', name: 'Synthetic food', type: 'expense', plannedAmount: 100, matchingRules: [] };
const budgets = [{ _id: 'budget', name: 'Extended synthetic', status: 'active', coverageVersion: 1, timezone: 'UTC', startDate: '2026-01-01T00:00:00Z', plannedEndDate: '2026-02-01T00:00:00Z', items: [item] }];
const transactions = { data: [{ _id: 'purchase', name: 'Synthetic purchase', date: '2026-11-01T12:00:00Z', amount: 5, type: 'expense' }], meta: { page: 1, totalPages: 1, limit: 10, total: 1 } };
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it.each([
  ['update', 'PATCH', 'saved', 'save'],
  ['create', 'POST', 'created', 'create it'],
])('recovers %s feedback only after a successful deferred GET retry without another write', async (action, method, confirmation, repeat) => {
  let reads = 0;
  let resolveRetry!: (value: typeof budgets) => void;
  let rejectRetry!: (reason: Error) => void;
  fetchApi.mockImplementation((path, options) => {
    if (path === '/budgets') {
      if (++reads === 1) return Promise.resolve(budgets);
      if (reads === 2) return Promise.reject(new Error('Synthetic refresh failure'));
      return new Promise((resolve, reject) => { resolveRetry = resolve; rejectRetry = reject; });
    }
    if (options.method === method) return Promise.resolve({ ...item, ...(action === 'create' ? { _id: 'new', name: 'New synthetic' } : {}) });
    return Promise.resolve(transactions);
  });
  render(<BudgetProvider><BudgetOverview /></BudgetProvider>);
  const input = await screen.findByPlaceholderText('New Item Name');
  if (action === 'create') {
    fireEvent.change(input, { target: { value: 'New synthetic' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Edit matching keywords' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save keywords' }));
  }
  const advice = `Category ${confirmation}. Refresh failed; retry loading to update budget actuals. Do not ${repeat} again.`;
  await screen.findByText(advice);
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
  await screen.findByText('Refreshing budgets…');
  expect(screen.getByText(advice)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Retry loading' })).toBeNull();
  await act(async () => rejectRetry(new Error('Synthetic retry failed')));
  await screen.findByText(/Could not load budgets: Synthetic retry failed/);
  expect(screen.getByText(advice)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
  await screen.findByText('Refreshing budgets…');
  await act(async () => resolveRetry(budgets));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(screen.getByText(`Category ${confirmation}.`)).toBeTruthy();
  expect(screen.queryByText(/Refresh failed; retry loading/)).toBeNull();
  expect(screen.getByPlaceholderText('New Item Name')).toBe(input);
  expect(fetchApi.mock.calls.filter(([, options]) => ['PATCH', 'POST'].includes(options.method))).toHaveLength(1);
  expect(reads).toBe(4);
});

it('keeps loaded DOM and unsaved input during keyword refresh, retains successful save on failure and retries GET only', async () => {
  let rejectRefresh!: (reason: Error) => void;
  let reads = 0;
  fetchApi.mockImplementation((path, options) => {
    if (path === '/budgets') return ++reads === 1 ? Promise.resolve(budgets) : new Promise((_, reject) => { rejectRefresh = reject; });
    if (options.method === 'PATCH') return Promise.resolve({ ...item, matchingRules: [{ id: 'rule', field: 'merchant', operator: 'contains', value: 'CAFE', source: 'user' }] });
    return Promise.resolve(transactions);
  });
  render(<BudgetProvider><BudgetOverview /></BudgetProvider>);
  const name = await screen.findByPlaceholderText('New Item Name');
  fireEvent.change(name, { target: { value: 'Unsaved category' } });
  fireEvent.click(screen.getByRole('button', { name: 'Edit matching keywords' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Save keywords' }));
  await screen.findByText('Refreshing budgets…');
  expect(screen.getByPlaceholderText('New Item Name')).toBe(name);
  expect((name as HTMLInputElement).value).toBe('Unsaved category');
  expect((screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => rejectRefresh(new Error('Synthetic refresh failed')));
  await screen.findByText('Category saved. Refresh failed; retry loading to update budget actuals. Do not save again.');
  expect(screen.getByPlaceholderText('New Item Name')).toBe(name);
  expect(screen.getByText('CAFE')).toBeTruthy();
  fetchApi.mockImplementation(path => Promise.resolve(path === '/budgets' ? budgets : transactions));
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(fetchApi.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
});

it('shows category request failure rather than empty success and retry loads extended-period assignment choices', async () => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
  let failed = true;
  fetchApi.mockImplementation(path => path === '/budgets' && failed ? Promise.reject(new Error('Synthetic category outage')) : Promise.resolve(path === '/budgets' ? budgets : transactions));
  const { container } = render(<MemoryRouter><BudgetProvider><TransactionsPage /></BudgetProvider></MemoryRouter>);
  await screen.findByText(/Could not load categories/);
  expect(screen.queryByText('No Categories Found')).toBeNull();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry categories' }));
  await waitFor(() => expect(screen.queryByText(/Could not load categories/)).toBeNull());
  const button = container.querySelector('tbody button') as HTMLElement;
  fireEvent.click(button);
  expect(screen.getAllByRole('option', { name: 'Synthetic food' }).length).toBeGreaterThan(0);
});

it('retains a created category when revalidation fails without inviting a duplicate POST', async () => {
  let reads = 0;
  fetchApi.mockImplementation((path, options) => {
    if (path === '/budgets') return ++reads === 1 ? Promise.resolve(budgets) : Promise.reject(new Error('Synthetic refresh outage'));
    if (options.method === 'POST') return Promise.resolve({ ...item, _id: 'new-food', name: 'Created synthetic' });
    return Promise.resolve(transactions);
  });
  render(<BudgetProvider><BudgetOverview /></BudgetProvider>);
  const input = await screen.findByPlaceholderText('New Item Name');
  fireEvent.change(input, { target: { value: 'Created synthetic' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await screen.findByText('Category created. Refresh failed; retry loading to update budget actuals. Do not create it again.');
  expect(screen.getByRole('button', { name: 'Created synthetic' })).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe('');
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(fetchApi.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
});

it.each([
  ['before inclusive start', '2025-12-31T23:59:59Z'],
  ['after legacy inclusive end', '2026-02-01T00:00:00.001Z'],
])('explains unavailable assignment %s and retains the saved category label', (_, purchase) => {
  const saved = { id: 'food', name: 'Saved synthetic food', type: 'expense', status: 'active', startDate: '2026-01-01T00:00:00Z', endDate: '2026-02-01T00:00:00Z', icon: null, iconBgClass: '', iconColor: '' };
  const onSave = vi.fn();
  render(<EditableCategoryCell initialValue={saved} categories={eligibleCategories({ food: saved }, purchase, 'expense')} expenseMerchant="Synthetic merchant" onSave={onSave} />);
  fireEvent.click(screen.getByRole('button', { name: saved.name }));
  expect(screen.getByText(/No categories eligible for this purchase date and type/)).toBeTruthy();
  expect(screen.getByText(/Older budgets stop at their saved end date \(inclusive\); extending them requires an explicit coverage upgrade/)).toBeTruthy();
  expect((screen.getByRole('option', { name: `${saved.name} (unavailable)` }) as HTMLOptionElement).disabled).toBe(true);
  expect((screen.getByRole('button', { name: 'Save assignment' }) as HTMLButtonElement).disabled).toBe(true);
  expect(onSave).not.toHaveBeenCalled();
});
