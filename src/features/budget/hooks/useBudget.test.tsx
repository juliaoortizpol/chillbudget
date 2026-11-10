import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useBudget, type BudgetItem } from './useBudget';
import { serializeBudgetItem } from './matchingRules';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn().mockResolvedValue({}) }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const item: BudgetItem = { name: 'Travel', description: 'Commute', type: 'expense', icon: 'car', color: '#10b981', plannedAmount: 250, alertEnabled: true,
  matchingRules: [{ id: 'existing', keyword: 'Uber', source: 'learned' }, { id: 'new', keyword: 'DiDi', source: 'user' }] };
it('retains computed actuals across a confirmed PATCH and pending/failed GET, then accepts refreshed actuals', async () => {
  const saved = { ...item, _id: 'travel', spent: 12.34 };
  const rules = [{ id: 'new-rule', keyword: 'CAFE', source: 'user' as const }];
  let rejectRefresh!: (error: Error) => void;
  fetchApi.mockResolvedValueOnce([{ _id: 'budget', items: [serializeBudgetItem(saved)] }])
    .mockResolvedValueOnce(serializeBudgetItem({ ...item, _id: 'travel', matchingRules: rules }))
    .mockReturnValueOnce(new Promise((_, reject) => { rejectRefresh = reject; }));
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.fetchBudgets(); });
  await act(async () => {
    const response = await result.current.updateBudgetItem('budget', 'travel', { matchingRules: rules });
    result.current.retainSavedBudgetItem('budget', response);
  });
  let refresh!: Promise<unknown>;
  act(() => { refresh = result.current.fetchBudgets().catch(() => undefined); });
  expect(result.current.budgets[0].items[0]).toMatchObject({ spent: 12.34, matchingRules: rules });
  await act(async () => { rejectRefresh(new Error('Synthetic outage')); await refresh; });
  expect(result.current.budgets[0].items[0]).toMatchObject({ spent: 12.34, matchingRules: rules });
  fetchApi.mockResolvedValueOnce([{ _id: 'budget', items: [serializeBudgetItem({ ...saved, spent: 18.5, matchingRules: rules })] }]);
  await act(async () => { await result.current.fetchBudgets(); });
  expect(result.current.budgets[0].items[0].spent).toBe(18.5);
  act(() => { result.current.retainSavedBudgetItem('budget', { ...saved, spent: 0, matchingRules: [] }); });
  expect(result.current.budgets[0].items[0]).toMatchObject({ spent: 0, matchingRules: [] });
});
it('includes keywords and unrelated fields in create and budget copy payloads', async () => {
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.addBudgetItem('budget', item); });
  expect(JSON.parse(fetchApi.mock.calls[0][1].body)).toEqual(serializeBudgetItem(item));
  await act(async () => { await result.current.createBudget({ timezone: 'America/La_Paz', name: 'Next month', periodType: 'monthly', startDate: '2026-11-01', endDate: '2026-11-30', status: 'draft', items: [item] }); });
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

it('retains coverage metadata and saved timezone through reads and ordinary updates', async () => {
  const response = { _id: 'synthetic', name: 'Extended', coverageVersion: 1, timezone: 'America/New_York', startDate: '2024-11-01T04:00:00Z', plannedEndDate: '2024-12-01T05:00:00Z', actualCutoffDate: '2024-12-02T05:00:00Z', closedAt: '2024-12-05T16:00:00Z', items: [serializeBudgetItem(item)] };
  fetchApi.mockResolvedValueOnce([response]).mockResolvedValueOnce(response);
  const { result } = renderHook(useBudget);
  await act(async () => { await result.current.fetchBudgets(); });
  expect(result.current.budgets[0]).toMatchObject({ ...response, items: [item] });
  await act(async () => { await result.current.updateBudget('synthetic', { name: 'Renamed' }); });
  expect(JSON.parse(fetchApi.mock.calls[1][1].body)).toEqual({ name: 'Renamed' });
  expect(result.current.budgets[0].timezone).toBe('America/New_York');
});

it('ignores stale GET success/failure and retains loaded categories on a current refresh failure', async () => {
  let resolveOld!: (value: unknown) => void;
  let rejectCurrent!: (error: Error) => void;
  fetchApi.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; }))
    .mockResolvedValueOnce([{ _id: 'latest', items: [{ ...item, _id: 'travel' }] }]);
  const { result } = renderHook(useBudget);
  let old!: Promise<unknown>;
  act(() => { old = result.current.fetchBudgets(); });
  await act(async () => { await result.current.fetchBudgets(); });
  await act(async () => { resolveOld([{ _id: 'stale', items: [] }]); await old; });
  expect(result.current.budgets[0]._id).toBe('latest');
  expect(result.current.hasLoadedBudgets).toBe(true);
  fetchApi.mockReturnValueOnce(new Promise((_, reject) => { rejectCurrent = reject; }));
  let refresh!: Promise<unknown>;
  act(() => { refresh = result.current.fetchBudgets().catch(() => undefined); });
  expect(result.current.budgets[0].items[0].name).toBe('Travel');
  await act(async () => { rejectCurrent(new Error('Synthetic unavailable')); await refresh; });
  expect(result.current.fetchBudgetsError).toBe('Synthetic unavailable');
  expect(result.current.budgets[0].items[0].name).toBe('Travel');
  expect(result.current.isFetchingBudgets).toBe(false);
});
