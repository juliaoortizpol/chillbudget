import { describe, expect, it } from 'vitest';
import { eligibleCategories } from './useTransactionsTable';

describe('assignment choices', () => {
  const categories = {
    expense: { id: 'expense', status: 'active', name: 'Synthetic', icon: null, iconBgClass: '', iconColor: '', type: 'expense', startDate: '2026-11-01T12:00:00Z', endDate: '2026-11-30T12:00:00Z' },
  };
  it('uses inclusive actual timestamps and matching types', () => {
    expect(Object.keys(eligibleCategories(categories, '2026-11-01T12:00:00Z', 'expense'))).toEqual(['expense']);
    expect(Object.keys(eligibleCategories(categories, '2026-11-30T12:00:00Z', 'expense'))).toEqual(['expense']);
    expect(eligibleCategories(categories, '2026-11-01T11:59:59Z', 'expense')).toEqual({});
    expect(eligibleCategories(categories, '2026-10-01T12:00:00Z', 'expense')).toEqual({});
    expect(eligibleCategories(categories, '2026-11-10T12:00:00Z', 'income')).toEqual({});
    expect(eligibleCategories(categories)).toEqual({});
  });
  it('uses open v1 coverage past plans and excludes drafts, closed and incompatible types', () => {
    const active = { ...categories.expense, status: 'active', coverageVersion: 1 };
    const choices = { active, draft: { ...active, status: 'draft' }, closed: { ...active, status: 'closed' }, income: { ...active, type: 'income' } };
    expect(Object.keys(eligibleCategories(choices, '2027-01-01T00:00:00Z', 'expense'))).toEqual(['active']);
    expect(eligibleCategories({ active: { ...active, actualCutoffDate: '2026-12-01T00:00:00Z' } }, '2026-12-01T00:00:00Z', 'expense')).toEqual({});
  });
});
