import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeKeyword } from '@/features/budget/hooks/matchingRules';
import type { TransactionCategory } from '../../data/mock-transactions';

export type Learning = { rememberMerchant: true; merchantKeyword: string };

export function ExpenseAssignment({ initialValue, categories, merchant, onSave, onCancel }: {
  initialValue: TransactionCategory;
  categories: Record<string, TransactionCategory>;
  merchant: string;
  onSave: (category: TransactionCategory, learning?: Learning) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [item, setItem] = useState(initialValue.id || '');
  const [remember, setRemember] = useState(false);
  const [keyword, setKeyword] = useState(merchant);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const normalized = normalizeKeyword(keyword);
  const learning = remember && Boolean(item);
  const invalid = learning && (!normalized || keyword.length > 256);
  const selected = categories[item];
  const equivalent = selected?.matchingRules?.find(rule =>
    (rule.field ?? 'merchant') === 'merchant' && (rule.operator ?? 'contains') === 'contains' && normalizeKeyword(rule.keyword) === normalized);
  const overlaps = normalized ? Object.entries(categories).filter(([id, category]) => id !== item && category.matchingRules?.some(rule => {
    const other = normalizeKeyword(rule.keyword);
    return other && (other.includes(normalized) || normalized.includes(other));
  })).map(([, category]) => category.name) : [];

  return <form className="w-64 max-w-full whitespace-normal break-words space-y-2 rounded-md border bg-background p-2 text-sm" onSubmit={async event => {
    event.preventDefault();
    if (saving.current || invalid || (item && !selected)) return;
    saving.current = true;
    setPending(true);
    setError('');
    try {
      await onSave(selected || { id: '', name: 'Uncategorized', icon: null, iconBgClass: '', iconColor: '' }, learning ? { rememberMerchant: true, merchantKeyword: keyword } : undefined);
      onCancel();
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'Unable to save.'} Retry, or uncheck Remember and save without remembering.`);
    } finally {
      saving.current = false;
      setPending(false);
    }
  }}>
    <label>Assign category
      <select aria-label="Assign category" value={item} disabled={pending} className="w-full border rounded p-1 bg-background" onChange={event => setItem(event.target.value)}>
        {item && !selected && <option value={item} disabled>{initialValue.name} (unavailable)</option>}
        <option value="">Uncategorized</option>
        {Object.entries(categories).map(([id, category]) => <option key={id} value={id}>{category.name}</option>)}
      </select>
    </label>
    {Object.keys(categories).length === 0 && <p>No categories eligible for this purchase date and type. Check the active budget coverage and category type on the Budget page, or leave Uncategorized. Legacy coverage includes purchases from its saved start through its exact saved end (inclusive); purchases after that end cannot use its categories. A v1 planned target does not end coverage. Legacy migration requires a separate supported process; this screen cannot extend it.</p>}
    <p>Selected item: {selected?.name || (item ? initialValue.name : 'Uncategorized')}</p>
    {item && selected && <>
      <label className="flex gap-2"><input type="checkbox" checked={remember} disabled={pending} onChange={event => setRemember(event.target.checked)} />Remember this match for future expenses</label>
      <label>Merchant keyword<Input aria-label="Merchant keyword" value={keyword} disabled={pending} onChange={event => setKeyword(event.target.value)} /></label>
      {invalid && <p role="alert">Enter a usable merchant keyword of at most 256 characters.</p>}
      {learning && equivalent && <p>{equivalent.source === 'suggested' ? 'The equivalent suggested rule will be accepted, keeping its identity and value.' : 'An equivalent rule already exists and will be reused.'}</p>}
      {learning && overlaps.length > 0 && <p>Possible overlap with: {overlaps.join(', ')}. Existing rules stay unchanged. Matching depends on the expense and existing precedence; ambiguous matches may need review.</p>}
      {learning && <p>Remember adds a merchant contains rule. Available budget rules are advisory; future matches are not guaranteed.</p>}
    </>}
    {error && <p role="alert">{error}</p>}
    {pending && <p role="status">Saving assignment…</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending || invalid || Boolean(item && !selected)}>{error ? 'Retry save' : 'Save assignment'}</Button><Button type="button" variant="outline" disabled={pending} onClick={onCancel}>Cancel</Button></div>
  </form>;
}
