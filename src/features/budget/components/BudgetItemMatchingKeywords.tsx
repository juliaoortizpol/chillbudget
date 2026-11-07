import { useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { BudgetItemMatchingRule } from '../hooks/useBudget';

import { appendKeywords, hasMatchingTie, normalizeKeyword } from '../hooks/matchingRules';

export interface KeywordProps {
  value: BudgetItemMatchingRule[];
  onChange: (rules: BudgetItemMatchingRule[]) => void;
  suggestions?: string[];
  otherItems?: { name: string; matchingRules?: BudgetItemMatchingRule[] }[];
  pendingText?: string;
  onPendingTextChange?: (text: string) => void;
  disabled?: boolean;
}

export function BudgetItemMatchingKeywords({ value, onChange, suggestions = [], otherItems = [], pendingText, onPendingTextChange, disabled }: KeywordProps) {
  const id = useId();
  const [localDraft, setLocalDraft] = useState('');
  const [error, setError] = useState('');
  const composing = useRef(false);
  const draft = pendingText ?? localDraft;
  const setDraft = onPendingTextChange ?? setLocalDraft;
  const selected = new Set(value.filter(rule => (rule.field ?? 'merchant') === 'merchant' && (rule.operator ?? 'contains') === 'contains').map(rule => normalizeKeyword(rule.keyword)));
  const available = [...new Set(suggestions.map(s => s.trim()).filter(Boolean))]
    .filter((s, index, all) => normalizeKeyword(s) && !selected.has(normalizeKeyword(s)) && all.findIndex(v => normalizeKeyword(v) === normalizeKeyword(s)) === index)
    .filter(s => !draft.trim() || s.toLowerCase().includes(draft.trim().toLowerCase())).slice(0, 6);
  const conflicts = otherItems.filter(item => item.matchingRules?.some(rule => value.some(current => {
    return hasMatchingTie(current, rule);
  })));
  function commit(text: string, source: BudgetItemMatchingRule['source'] = 'user') {
    try {
      onChange(appendKeywords(value, text, source));
      if (source !== 'suggested') setDraft('');
      setError('');
    } catch (err) { setError((err as Error).message); }
  }
  return <section className="space-y-2 text-left" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`} className="text-sm font-semibold">Automatic expense matching</h3>
    <p className="text-xs text-muted-foreground">Add words or merchant names that ChillBudget can use to recognize expenses for this item.</p>
    <div className="flex flex-wrap gap-1">
      {value.map(rule => <span key={rule.id} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
        {rule.keyword}<button disabled={disabled} type="button" aria-label={`Remove ${rule.keyword}`} onClick={() => onChange(value.filter(r => r.id !== rule.id))}>×</button>
      </span>)}
    </div>
    <Input disabled={disabled} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} aria-label="Matching keywords" placeholder="Add a keyword…" value={draft}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={() => { composing.current = false; }}
      onChange={e => { setDraft(e.target.value); setError(''); if (!composing.current && e.target.value.includes(',')) commit(e.target.value); }}
      onBlur={() => { if (!onPendingTextChange && draft.trim() && !composing.current) commit(draft); }}
      onKeyDown={e => { if (!composing.current && !e.nativeEvent.isComposing && e.keyCode !== 229 && (e.key === 'Enter' || e.key === ',')) { e.preventDefault(); e.stopPropagation(); commit(draft); } }} />
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
    {available.length > 0 && <div className="space-y-1"><p className="text-xs text-muted-foreground">Suggested keywords</p><div className="flex flex-wrap gap-1">
      {available.map(s => <button disabled={disabled} type="button" key={s} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted" onClick={() => commit(s, 'suggested')}>{s}</button>)}
    </div></div>}
    {conflicts.map((item, i) => <p key={i} role="status" className="text-xs text-amber-700">An equally ranked keyword is saved for {item.name}. Expenses may need review; exact matches and longer keywords take priority before user/learned preference.</p>)}
  </section>;
}
