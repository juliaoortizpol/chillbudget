import type { Transaction } from '@/features/transactions/hooks/useTransactions';
import { normalizeKeyword } from './matchingRules';

// The history contract stores merchant text in name, not relationCode or notes.
export function merchantSuggestions(transactions: Transaction[]): string[] {
  return [...new Set(transactions.filter(transaction => transaction.type === 'expense')
    .map(transaction => normalizeKeyword(transaction.name))
    .filter(name => name.length <= 256 && /\p{L}/u.test(name)))];
}
