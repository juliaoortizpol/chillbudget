import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useBudget, type BudgetItem } from './useBudget';
import { serializeBudgetItem } from './matchingRules';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn().mockResolvedValue({}) }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const item: BudgetItem = { name: 'Travel', description: 'Commute', type: 'expense', icon: 'car', color: '#10b981', plannedAmount: 250, alertEnabled: true,
  matchingRules: [{ id: 'existing', keyword: 'Uber', source: 'learned' }, { id: 'new', keyword: 'DiDi', source: 'user' }] };
it('includes keywords and unrelated fields in create and budget copy payloads', async () => {
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.addBudgetItem('budget', item); });
  expect(JSON.parse(fetchApi.mock.calls[0][1].body)).toEqual(serializeBudgetItem(item));
  await act(async () => { await result.current.createBudget({ name: 'Next month', periodType: 'monthly', startDate: '2026-11-01', endDate: '2026-11-30', status: 'draft', items: [item] }); });
  expect(JSON.parse(fetchApi.mock.calls[1][1].body).items[0]).toEqual(serializeBudgetItem(item));
});
it('patches only keywords and supports clearing them', async () => {
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.updateBudgetItem('budget', 'item', { matchingRules: item.matchingRules }); });
  expect(fetchApi.mock.calls[0][0]).toBe('/budgets/budget/items/item');
  expect(JSON.parse(fetchApi.mock.calls[0][1].body)).toEqual(serializeBudgetItem({ matchingRules: item.matchingRules }));
  await act(async () => { await result.current.updateBudgetItem('budget', 'item', { matchingRules: [] }); });
  expect(JSON.parse(fetchApi.mock.calls[1][1].body)).toEqual({ matchingRules: [] });
});

it('saves, fetches, and reopens the API rule format without losing keywords or rule semantics', async () => {
  const stored = serializeBudgetItem({ ...item, matchingRules: [
    { id: 'existing', keyword: 'Uber', source: 'learned' as const, field: 'description' as const, operator: 'equals' as const },
    { id: 'new', keyword: 'DiDi', source: 'user' as const },
  ] });
  const budget = { _id: 'budget', name: 'October', items: [stored] };
  fetchApi.mockResolvedValueOnce(stored).mockResolvedValueOnce([budget]).mockResolvedValueOnce(budget);
  const { result } = renderHook(useBudget);
  const uiRules = [{ id: 'existing', keyword: 'Uber', source: 'learned' as const, field: 'description' as const, operator: 'equals' as const }, { id: 'new', keyword: 'DiDi', source: 'user' as const }];
  await act(async () => { await result.current.updateBudgetItem('budget', 'item', { matchingRules: uiRules }); });
  await act(async () => { await result.current.fetchBudgets(); });
  expect(result.current.budgets[0].items[0].matchingRules?.map(r => r.keyword)).toEqual(['Uber', 'DiDi']);
  expect(result.current.budgets[0].items[0].matchingRules?.[0]).toEqual(uiRules[0]);
  await act(async () => { await result.current.fetchActiveBudget('budget'); });
  expect(result.current.activeBudget?.items[0].matchingRules?.map(r => r.keyword)).toEqual(['Uber', 'DiDi']);
  expect(serializeBudgetItem(result.current.activeBudget!.items[0])).toEqual(stored);
});
