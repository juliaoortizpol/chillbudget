import type { BudgetItem, BudgetItemMatchingRule } from './useBudget';

export interface StoredMatchingRule {
  id: string;
  field: 'merchant' | 'description';
  operator: 'contains' | 'equals';
  value: string;
  source: BudgetItemMatchingRule['source'];
}

export function serializeBudgetItem<T extends { matchingRules?: BudgetItemMatchingRule[] }>(item: T) {
  const { matchingRules, ...fields } = item;
  return {
    ...fields,
    ...(matchingRules === undefined ? {} : { matchingRules: matchingRules.map(rule => ({
      id: rule.id,
      field: rule.field ?? 'merchant',
      operator: rule.operator ?? 'contains',
      value: rule.keyword.trim(),
      source: rule.source,
    })) }),
  };
}

export function deserializeBudgetItem(item: Omit<BudgetItem, 'matchingRules'> & { matchingRules?: StoredMatchingRule[] }): BudgetItem {
  return { ...item, matchingRules: item.matchingRules?.map(({ value, ...rule }) => ({ ...rule, keyword: value })) };
}
