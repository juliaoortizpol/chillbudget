import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/transactions/hooks/useTransactions';
import { merchantSuggestions } from './merchantSuggestions';

describe('expense history merchant suggestions', () => {
  it('prefers persisted merchant text over generic names and deduplicates across fields', () => {
    const history = [
      { name: 'Generic purchase 01', normalizedMerchant: 'ＡＣＭＥ', rawDescription: 'Other merchant' },
      { name: 'Generic purchase 02', rawDescription: 'Acme.com 800-555-1234' },
      { name: 'ACME' },
      { name: 'Generic purchase 03', rawDescription: 'Synthetic Cafe' },
      { name: 'Generic purchase 04', normalizedMerchant: 'Ignore income', type: 'income' },
    ].map((fields, index) => ({ _id: String(index), type: 'expense', ...fields }) as Transaction);
    expect(merchantSuggestions(history)).toEqual(['acme', 'synthetic cafe']);
  });

  it('falls back from unusable preferred fields without using notes or relation codes', () => {
    const unusable: unknown[] = [undefined, null, '', '   ', '!!!', 'support.example.com', '123456', 'a'.repeat(257), 42, {}];
    for (const value of unusable) {
      const transaction = { type: 'expense', name: 'Fallback Shop', notes: 'Private note', relationCode: 'Reference' } as Transaction;
      expect(merchantSuggestions([{ ...transaction, normalizedMerchant: value, rawDescription: 'Description Shop' } as Transaction]))
        .toEqual(['description shop']);
      expect(merchantSuggestions([{ ...transaction, normalizedMerchant: value, rawDescription: value } as Transaction]))
        .toEqual(['fallback shop']);
    }
    expect(merchantSuggestions([{ type: 'expense', name: '!!!', notes: 'Private note', relationCode: 'Reference' } as Transaction])).toEqual([]);
  });

  it('uses names, cleans descriptors, deduplicates and omits unusable or income history', () => {
    const history = [
      ['Uber Trip 123', 'expense'], ['ＵＢＥＲ', 'expense'],
      ['SyntheticCafe.com 800-555-1234', 'expense'], ['syntheticcafe', 'expense'],
      ['support.example.com', 'expense'], ['123456', 'expense'], ['!!!', 'expense'],
      ['Salary', 'income'], ['a'.repeat(257), 'expense'],
    ].map(([name, type], index) => ({ _id: String(index), name, type, notes: 'Never suggest notes', relationCode: 'Never suggest codes' }) as Transaction);
    expect(merchantSuggestions(history)).toEqual(['uber', 'syntheticcafe']);
    expect(merchantSuggestions([])).toEqual([]);
  });
});
