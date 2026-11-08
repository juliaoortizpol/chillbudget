import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/transactions/hooks/useTransactions';
import { merchantSuggestions } from './merchantSuggestions';

describe('expense history merchant suggestions', () => {
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
