import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useBudget, type BudgetItem } from './useBudget';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn().mockResolvedValue({}) }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const item: BudgetItem = { name: 'Travel', description: 'Commute', type: 'expense', icon: 'car', color: '#10b981', plannedAmount: 250, alertEnabled: true,
  matchingRules: [{ id: 'existing', keyword: 'Uber', source: 'learned' }, { id: 'new', keyword: 'DiDi', source: 'user' }] };
it('includes keywords and unrelated fields in create and budget copy payloads', async () => {
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.addBudgetItem('budget', item); });
  expect(JSON.parse(fetchApi.mock.calls[0][1].body)).toEqual(item);
  await act(async () => { await result.current.createBudget({ name: 'Next month', periodType: 'monthly', startDate: '2026-11-01', endDate: '2026-11-30', status: 'draft', items: [item] }); });
  expect(JSON.parse(fetchApi.mock.calls[1][1].body).items[0]).toEqual(item);
});
it('patches only keywords and supports clearing them', async () => {
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.updateBudgetItem('budget', 'item', { matchingRules: item.matchingRules }); });
  expect(fetchApi.mock.calls[0][0]).toBe('/budgets/budget/items/item');
  expect(JSON.parse(fetchApi.mock.calls[0][1].body)).toEqual({ matchingRules: item.matchingRules });
  await act(async () => { await result.current.updateBudgetItem('budget', 'item', { matchingRules: [] }); });
  expect(JSON.parse(fetchApi.mock.calls[1][1].body)).toEqual({ matchingRules: [] });
});
