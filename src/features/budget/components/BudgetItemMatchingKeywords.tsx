import { useId, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { BudgetItemMatchingRule } from '../hooks/useBudget';

function addKeywords(rules: BudgetItemMatchingRule[], text: string, source: BudgetItemMatchingRule['source'] = 'user') {
  const result = [...rules];
  for (const word of text.split(',')) {
    const keyword = word.trim();
    if (keyword && !result.some(rule => rule.keyword.toLowerCase() === keyword.toLowerCase())) {
      result.push({ id: crypto.randomUUID(), keyword, source });
    }
  }
  return result;
}

export interface KeywordProps {
  value: BudgetItemMatchingRule[];
  onChange: (rules: BudgetItemMatchingRule[]) => void;
  suggestions?: string[];
  otherItems?: { name: string; matchingRules?: BudgetItemMatchingRule[] }[];
}

export function BudgetItemMatchingKeywords({ value, onChange, suggestions = [], otherItems = [] }: KeywordProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const selected = new Set(value.map(rule => rule.keyword.toLowerCase()));
  const available = [...new Set(suggestions.map(s => s.trim()).filter(Boolean))]
    .filter((s, index, all) => !selected.has(s.toLowerCase()) && all.findIndex(v => v.toLowerCase() === s.toLowerCase()) === index)
    .filter(s => !draft.trim() || s.toLowerCase().includes(draft.trim().toLowerCase())).slice(0, 6);
  const conflicts = otherItems.filter(item => item.matchingRules?.some(rule => value.some(current => {
    const a = current.keyword.toLowerCase();
    const b = rule.keyword.toLowerCase();
    return a.includes(b) || b.includes(a);
  })));
  function commit(text: string) {
    onChange(addKeywords(value, text));
    setDraft('');
  }
  return <section className="space-y-2 text-left" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`} className="text-sm font-semibold">Automatic expense matching</h3>
    <p className="text-xs text-muted-foreground">Add words or merchant names that ChillBudget can use to recognize expenses for this item.</p>
    <div className="flex flex-wrap gap-1">
      {value.map(rule => <span key={rule.id} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
        {rule.keyword}<button type="button" aria-label={`Remove ${rule.keyword}`} onClick={() => onChange(value.filter(r => r.id !== rule.id))}>×</button>
      </span>)}
    </div>
    <Input aria-label="Matching keywords" placeholder="Add a keyword…" value={draft}
      onChange={e => e.target.value.includes(',') ? commit(e.target.value) : setDraft(e.target.value)}
      onBlur={() => { if (draft.trim()) commit(draft); }}
      onKeyDown={e => { if (!e.nativeEvent.isComposing && (e.key === 'Enter' || e.key === ',')) { e.preventDefault(); e.stopPropagation(); commit(draft); } }} />
    {available.length > 0 && <div className="space-y-1"><p className="text-xs text-muted-foreground">Suggested keywords</p><div className="flex flex-wrap gap-1">
      {available.map(s => <button type="button" key={s} className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted" onClick={() => onChange(addKeywords(value, s, 'suggested'))}>{s}</button>)}
    </div></div>}
    {conflicts.map((item, i) => <p key={i} role="status" className="text-xs text-amber-700">This keyword may also match expenses assigned to {item.name}.</p>)}
  </section>;
}

