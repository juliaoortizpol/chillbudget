import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TransactionsPage } from './index';

const { fetchApi, fetchBudgets } = vi.hoisted(() => ({ fetchApi: vi.fn(), fetchBudgets: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
vi.mock('../budget/hooks/useGlobalBudget', () => ({ useGlobalBudget: () => ({ activeBudget: null, isFetchingBudgets: false, fetchBudgets }) }));
vi.mock('./components/TransactionsSummary', () => ({ TransactionsSummary: () => null }));
vi.mock('./components/TransactionsTable', () => ({
  AddTransactionDialog: () => null,
  TransactionsTable: ({ data, onUpdateItem, emptyTitle }: { data: { id: string; category: { name: string }; matchingStatus?: string }[]; onUpdateItem: (id: string, updates: object) => void; emptyTitle: string }) => (
    <div>{data.length ? data.map(row => <div key={row.id}>{row.category.name} {row.matchingStatus}<button onClick={() => onUpdateItem(row.id, { category: { id: 'new' } })}>Assign {row.id}</button></div>) : emptyTitle}</div>
  ),
}));
const row = { _id: 'synthetic', date: '2026-11-01T12:00:00Z', name: 'Synthetic expense', amount: 10, type: 'expense', matchingStatus: 'needs_review' };
const page = (data: object[], totalPages = 1, total = data.length) => ({ data, meta: { page: 1, limit: 10, totalPages, total } });
beforeEach(() => {
  fetchApi.mockReset();
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
});
afterEach(cleanup);
function mount() { render(<MemoryRouter><TransactionsPage /></MemoryRouter>); }

it('requests the backend review queue, retains rejected assignments and removes successful ones', async () => {
  fetchApi.mockResolvedValue(page([row]));
  mount();
  await screen.findByText('Assign synthetic');
  fireEvent.click(screen.getByRole('button', { name: 'Needs review' }));
  await waitFor(() => expect(fetchApi).toHaveBeenLastCalledWith(expect.stringContaining('matchingStatus=needs_review'), { method: 'GET' }));
  await screen.findByText('Assign synthetic');
  fetchApi.mockRejectedValueOnce(new Error('Category rejected'));
  fireEvent.click(screen.getByText('Assign synthetic'));
  await screen.findByText('Category rejected');
  expect(screen.getByText('Assign synthetic')).toBeTruthy();
  fetchApi.mockResolvedValueOnce({ ...row, budgetItemId: 'new', matchingStatus: 'manual' }).mockResolvedValueOnce(page([], 0));
  fireEvent.click(screen.getByText('Assign synthetic'));
  await screen.findByText('No expenses need review');
});

it('distinguishes loading and API failure from empty review results, and retries', async () => {
  let reject!: (reason: Error) => void;
  fetchApi.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }));
  mount();
  expect(screen.getByText('Loading transactions...')).toBeTruthy();
  await act(async () => { reject(new Error('Synthetic unavailable')); });
  expect(screen.getByRole('alert').textContent).toContain('Synthetic unavailable');
  expect(screen.queryByText('No expenses need review')).toBeNull();
  fetchApi.mockResolvedValue(page([], 0));
  fireEvent.click(screen.getByText('Try again'));
  await screen.findByText('No transactions in last 30 days');
});

it('shows historical assigned legacy rows as linked with a saved category fallback', async () => {
  fetchApi.mockResolvedValue(page([{ ...row, budgetItemId: 'historical', matchingStatus: 'needs_review' }]));
  mount();
  await screen.findByText('Saved category linked');
});

it('returns to page one when assigning the final row on page two', async () => {
  fetchApi.mockResolvedValue(page([row], 2, 11));
  mount();
  await screen.findByText('Assign synthetic');
  fireEvent.click(screen.getByRole('button', { name: 'Needs review' }));
  await screen.findByText('Assign synthetic');
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  await waitFor(() => expect(fetchApi).toHaveBeenLastCalledWith(expect.stringContaining('page=2'), { method: 'GET' }));
  await screen.findByText('Assign synthetic');
  fetchApi.mockResolvedValueOnce({ ...row, budgetItemId: 'new', matchingStatus: 'manual' })
    .mockResolvedValueOnce(page([], 1, 10)).mockResolvedValueOnce(page([{ ...row, _id: 'remaining' }], 1, 10));
  fireEvent.click(screen.getByText('Assign synthetic'));
  await screen.findByText('Assign remaining');
  expect(fetchApi).toHaveBeenLastCalledWith(expect.stringMatching(/page=1.*matchingStatus=needs_review/), { method: 'GET' });
});

it('shows a refresh error after a successful assignment rather than an empty queue', async () => {
  fetchApi.mockResolvedValue(page([row]));
  mount();
  await screen.findByText('Assign synthetic');
  fireEvent.click(screen.getByRole('button', { name: 'Needs review' }));
  await screen.findByText('Assign synthetic');
  fetchApi.mockResolvedValueOnce({ ...row, budgetItemId: 'new', matchingStatus: 'manual' })
    .mockRejectedValueOnce(new Error('Refresh unavailable'));
  fireEvent.click(screen.getByText('Assign synthetic'));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Refresh unavailable'));
  expect(screen.queryByText('No expenses need review')).toBeNull();
});

it('refreshes the current review filter when a save finishes after switching views', async () => {
  fetchApi.mockResolvedValue(page([row]));
  mount();
  await screen.findByText('Assign synthetic');
  let finish!: (saved: object) => void;
  fetchApi.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  fireEvent.click(screen.getByText('Assign synthetic'));
  fireEvent.click(screen.getByRole('button', { name: 'Needs review' }));
  await screen.findByText('Assign synthetic');
  fetchApi.mockResolvedValueOnce(page([], 0));
  await act(async () => { finish({ ...row, budgetItemId: 'new', matchingStatus: 'manual' }); });
  await screen.findByText('No expenses need review');
  expect(fetchApi).toHaveBeenLastCalledWith(expect.stringContaining('matchingStatus=needs_review'), { method: 'GET' });
});
