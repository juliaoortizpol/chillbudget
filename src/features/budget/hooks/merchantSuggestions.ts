import type { Transaction } from '@/features/transactions/hooks/useTransactions';
import { normalizeKeyword } from './matchingRules';

// Prefer persisted merchant text, then the original description, then the name.
// Notes and relation codes are not merchant text in the history contract.
export function merchantSuggestions(transactions: Transaction[]): string[] {
  return [...new Set(transactions.filter(transaction => transaction.type === 'expense')
    .map(transaction => [transaction.normalizedMerchant, transaction.rawDescription, transaction.name]
      .map(value => typeof value === 'string' ? normalizeKeyword(value) : '')
      .find(value => value.length <= 256 && /\p{L}/u.test(value)))
    .filter((value): value is string => value !== undefined))];
}
