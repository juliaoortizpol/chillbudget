import { describe, expect, it } from 'vitest';
import { appendKeywords, deserializeBudgetItem, hasMatchingTie, normalizeKeyword, serializeBudgetItem, validateMatchingRules } from './matchingRules';
import type { BudgetItemMatchingRule } from './useBudget';

const rule: BudgetItemMatchingRule = { id: 'saved', keyword: 'Uber', source: 'learned' };
describe('BE7 keyword contract', () => {
  it.each(['ＵＢＥＲ', 'Uber TRIP pending', 'uber.com', 'UBER 800-555-1234', 'uber support.example.com', 'uber!!!'])('normalizes %s and rejects its duplicate independently of source', value => {
    expect(normalizeKeyword(value)).toBe('uber');
    expect(() => appendKeywords([rule], value, 'suggested')).toThrow(/duplicates/);
  });
  it('allows the same normalized value in distinct predicates', () => {
    expect(() => validateMatchingRules([rule, { ...rule, id: 'description', field: 'description' }, { ...rule, id: 'equals', operator: 'equals' }])).not.toThrow();
  });
  it('enforces empty normalization, raw length, count and ID limits', () => {
    expect(() => appendKeywords([], '!!!')).toThrow(/letters or numbers/);
    expect(() => appendKeywords([], 'a'.repeat(257))).toThrow(/256/);
    expect(() => appendKeywords([], 'a'.repeat(256))).not.toThrow();
    const rules = Array.from({ length: 100 }, (_, i) => ({ ...rule, id: String(i), keyword: `shop ${i}` }));
    expect(() => appendKeywords(rules, 'extra')).toThrow(/100/);
    for (const id of ['', ' ', 'a'.repeat(129)]) expect(() => validateMatchingRules([{ ...rule, id }])).toThrow(/ID/);
    expect(() => validateMatchingRules([rule, { ...rule, keyword: 'other' }])).toThrow(/ID/);
  });
  it('round-trips advanced rules without changing raw values or metadata, and distinguishes omission from clear', () => {
    const matchingRules = [{ id: 'advanced', field: 'description' as const, operator: 'equals' as const, value: '  Café / ＳＨＯＰ  ', source: 'suggested' as const }];
    const stored = { name: 'Synthetic', type: 'expense', plannedAmount: 12, matchingRules };
    expect(serializeBudgetItem(deserializeBudgetItem(stored))).toEqual(stored);
    expect(serializeBudgetItem<{ name: string; matchingRules?: BudgetItemMatchingRule[] }>({ name: 'Synthetic' })).not.toHaveProperty('matchingRules');
    expect(serializeBudgetItem({ matchingRules: [] })).toEqual({ matchingRules: [] });
  });
  it('only flags equal predicate ties after specificity and source preference', () => {
    expect(hasMatchingTie(rule, { ...rule, source: 'user' })).toBe(true);
    expect(hasMatchingTie(rule, { ...rule, source: 'suggested' })).toBe(false);
    expect(hasMatchingTie(rule, { ...rule, keyword: 'Uber Eats' })).toBe(false);
    expect(hasMatchingTie(rule, { ...rule, operator: 'equals' })).toBe(true);
    expect(hasMatchingTie(rule, { ...rule, field: 'description' })).toBe(false);
  });
});
