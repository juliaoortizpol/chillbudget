import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransactions } from './useTransactions';

const { fetchApi } = vi.hoisted(() => ({ fetchApi: vi.fn() }));
vi.mock('@/hooks/useFetch', () => ({ useFetch: () => ({ fetchApi }) }));

describe('transaction writes', () => {
  beforeEach(() => fetchApi.mockReset());

  it('creates an ordinary transaction without matching metadata', async () => {
    const dto = { name: 'Synthetic groceries', amount: 12, type: 'expense' as const, date: '2026-11-01T12:00:00Z' };
    fetchApi.mockResolvedValue({ ...dto, _id: 'synthetic', matchingStatus: 'needs_review' });
    const { result } = renderHook(() => useTransactions());
    await act(async () => { await result.current.createTransaction(dto); });
    expect(fetchApi).toHaveBeenCalledWith('/transactions', { method: 'POST', body: JSON.stringify(dto) });
  });

  it('keeps omission distinct from clearing and applies the returned saved state', async () => {
    const original = { _id: 'synthetic', budgetItemId: 'old', name: 'Synthetic expense' };
    fetchApi.mockResolvedValueOnce({ data: [original], meta: { total: 1 } });
    const { result } = renderHook(() => useTransactions());
    await act(async () => { await result.current.fetchTransactions(); });
    const saved = { ...original, budgetItemId: null, matchingStatus: 'needs_review' };
    fetchApi.mockResolvedValueOnce(saved);
    await act(async () => { await result.current.updateTransaction('synthetic', { budgetItemId: null }); });
    expect(fetchApi).toHaveBeenLastCalledWith('/transactions/synthetic', { method: 'PATCH', body: '{"budgetItemId":null}' });
    expect(result.current.transactionsData?.data[0]).toEqual(saved);
    fetchApi.mockResolvedValueOnce(saved);
    await act(async () => { await result.current.updateTransaction('synthetic', { name: 'Correction' }); });
    expect(fetchApi).toHaveBeenLastCalledWith('/transactions/synthetic', { method: 'PATCH', body: '{"name":"Correction"}' });
  });

  it('retains saved data and exposes a rejected assignment error', async () => {
    const original = { _id: 'synthetic', budgetItemId: 'old' };
    fetchApi.mockResolvedValueOnce({ data: [original], meta: { total: 1 } });
    const { result } = renderHook(() => useTransactions());
    await act(async () => { await result.current.fetchTransactions(); });
    fetchApi.mockRejectedValueOnce(new Error('Item does not cover transaction date'));
    await act(async () => {
      await expect(result.current.updateTransaction('synthetic', { budgetItemId: 'incompatible' })).rejects.toThrow('Item does not cover transaction date');
    });
    expect(result.current.transactionsData?.data[0]).toEqual(original);
    expect(result.current.updateTransactionError).toBe('Item does not cover transaction date');
  });
});
