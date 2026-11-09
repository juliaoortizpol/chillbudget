import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TransactionsPage } from './index';

const { fetchApi, fetchBudgets, budget } = vi.hoisted(() => ({
  fetchApi: vi.fn(), fetchBudgets: vi.fn().mockResolvedValue(undefined),
  budget: {
    status: 'active', startDate: '2026-01-01', endDate: '2026-12-31',
    items: [{ _id: 'keywords-b', name: 'QA Keywords B', type: 'expense', plannedAmount: 100, matchingRules: [] }],
  },
}));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
vi.mock('../budget/hooks/useGlobalBudget', () => ({ useGlobalBudget: () => ({ activeBudget: budget, isFetchingBudgets: false, fetchBudgets }) }));
const row = { _id: 'synthetic', date: '2026-11-01T12:00:00Z', name: 'CAFE ORBIT purchase', amount: 10, type: 'expense', matchingStatus: 'needs_review' };
const page = { data: [row], meta: { page: 1, limit: 10, totalPages: 1, total: 1 } };
beforeEach(() => {
  fetchApi.mockReset();
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
});
afterEach(cleanup);

it.each(['desktop', 'mobile'])('retains the %s editor through hook pending/error updates and retries only explicitly', async layout => {
  let rejectSave!: (error: Error) => void;
  fetchApi.mockResolvedValue(page);
  const { container } = render(<MemoryRouter><TransactionsPage /></MemoryRouter>);
  await screen.findAllByText('CAFE ORBIT purchase');
  // Both responsive layouts are in the DOM; target the actual table or mobile card.
  const region = within(container.querySelector(layout === 'desktop' ? 'tbody' : 'article') as HTMLElement);
  fireEvent.click(region.getByRole('button', { name: 'Uncategorized' }));
  const category = region.getByRole('combobox', { name: 'Assign category' });
  fireEvent.change(category, { target: { value: 'keywords-b' } });
  const consent = region.getByRole('checkbox');
  fireEvent.click(consent);
  const keyword = region.getByRole('textbox', { name: 'Merchant keyword' });
  fireEvent.change(keyword, { target: { value: 'CAFE ORBIT' } });
  fetchApi.mockReturnValueOnce(new Promise((_, reject) => { rejectSave = reject; }));
  fireEvent.click(region.getByRole('button', { name: 'Save assignment' }));
  expect(region.getByText('Saving assignment…')).toBeTruthy();
  expect(region.getByRole('textbox', { name: 'Merchant keyword' })).toBe(keyword);
  fireEvent.click(region.getByRole('button', { name: 'Save assignment' }));
  expect(fetchApi.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
  await act(async () => rejectSave(new Error('Synthetic 503: retry or assign without remember')));
  expect(region.getByRole('alert').textContent).toContain('Retry, or uncheck Remember');
  expect(region.getByRole('combobox', { name: 'Assign category' })).toBe(category);
  expect((category as HTMLSelectElement).value).toBe('keywords-b');
  expect((consent as HTMLInputElement).checked).toBe(true);
  expect((keyword as HTMLInputElement).value).toBe('CAFE ORBIT');
  expect(fetchApi.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
  fetchApi.mockResolvedValueOnce({ ...row, budgetItemId: 'keywords-b', matchingStatus: 'manual' }).mockResolvedValueOnce(page);
  fireEvent.click(region.getByRole('button', { name: 'Retry save' }));
  await screen.findByText('Saved and merchant remembered. Matching status: manual.');
  const patches = fetchApi.mock.calls.filter(([, options]) => options.method === 'PATCH');
  expect(patches).toHaveLength(2);
  expect(patches[1]).toEqual(patches[0]);
  expect(JSON.parse(patches[1][1].body)).toEqual({ budgetItemId: 'keywords-b', rememberMerchant: true, merchantKeyword: 'CAFE ORBIT' });
});
