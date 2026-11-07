import type { BudgetItem, BudgetItemMatchingRule } from './useBudget';

// Mirrors BE7 MerchantNormalizationService; keep display values untouched.
export function normalizeKeyword(value: string): string {
  const normalized = value.normalize('NFKC').toLowerCase()
    .replace(/\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, ' ')
    .replace(/\b(?:https?:\/\/)?(?:help|support)\.[a-z0-9.-]+\.[a-z]{2,}\b/g, ' ')
    .replace(/\b(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+)\.(?:com|net|org|io|co)\b/g, '$1')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  return /^uber trip(?:\s|$)/.test(normalized) ? 'uber' : normalized;
}

export function validateMatchingRules(rules: BudgetItemMatchingRule[]) {
  if (rules.length > 100) throw new Error('Use at most 100 matching keywords per item.');
  const ids = new Set<string>();
  const keys = new Set<string>();
  for (const rule of rules) {
    const label = JSON.stringify(rule.keyword);
    if (!rule.id.trim() || rule.id.length > 128 || ids.has(rule.id)) throw new Error(`Invalid or duplicate rule ID for ${label}.`);
    ids.add(rule.id);
    const normalized = normalizeKeyword(rule.keyword);
    if (rule.keyword.length > 256 || !normalized) throw new Error(`Keyword ${label} must contain letters or numbers and be at most 256 characters.`);
    const key = JSON.stringify([rule.field ?? 'merchant', rule.operator ?? 'contains', normalized]);
    if (keys.has(key)) throw new Error(`Keyword ${label} duplicates an existing rule for the same field and operator.`);
    keys.add(key);
  }
}

export function appendKeywords(rules: BudgetItemMatchingRule[], text: string, source: BudgetItemMatchingRule['source'] = 'user') {
  for (const word of text.split(',')) {
    if (word.length > 256) throw new Error(`Keyword ${JSON.stringify(word)} must be at most 256 characters.`);
  }
  const next = [...rules, ...text.split(',').filter(word => word.trim()).map(keyword => ({
    id: crypto.randomUUID(), keyword: keyword.trim(), source,
  }))];
  validateMatchingRules(next);
  return next;
}

export function hasMatchingTie(a: BudgetItemMatchingRule, b: BudgetItemMatchingRule) {
  // Same-field identical normalized values can tie on exact equality even when
  // their operators differ. Other overlaps need transaction-specific ranking.
  return (a.field ?? 'merchant') === (b.field ?? 'merchant') &&
    normalizeKeyword(a.keyword) === normalizeKeyword(b.keyword) &&
    (a.source === 'suggested') === (b.source === 'suggested');
}

export interface StoredMatchingRule {
  id: string;
  field: 'merchant' | 'description';
  operator: 'contains' | 'equals';
  value: string;
  source: BudgetItemMatchingRule['source'];
}

export function serializeBudgetItem<T extends { matchingRules?: BudgetItemMatchingRule[] }>(item: T) {
  const { matchingRules, ...fields } = item;
  if (matchingRules !== undefined) validateMatchingRules(matchingRules);
  return {
    ...fields,
    ...(matchingRules === undefined ? {} : { matchingRules: matchingRules.map(rule => ({
      id: rule.id,
      field: rule.field ?? 'merchant',
      operator: rule.operator ?? 'contains',
      value: rule.keyword,
      source: rule.source,
    })) }),
  };
}

export function deserializeBudgetItem(item: Omit<BudgetItem, 'matchingRules'> & { matchingRules?: StoredMatchingRule[] }): BudgetItem {
  return { ...item, matchingRules: item.matchingRules?.map(({ value, ...rule }) => ({ ...rule, keyword: value })) };
}
