import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { appendKeywords } from '../hooks/matchingRules';
import type { BudgetItem, BudgetItemMatchingRule } from '../hooks/useBudget';
import { BudgetItemMatchingKeywords } from './BudgetItemMatchingKeywords';

type Rule = BudgetItemMatchingRule;

export function DraftItemRules({ item, otherItems, disabled, onSave }: {
  item: BudgetItem;
  otherItems: BudgetItem[];
  disabled: boolean;
  onSave: (getRules: () => Rule[], onSaved: () => void) => void;
}) {
  const titleId = useId();
  const [edited, setEdited] = useState<Rule[]>();
  const [pendingText, setPendingText] = useState('');
  const rules = edited ?? item.matchingRules ?? [];
  const changeRule = (id: string, change: Partial<Rule>) =>
    setEdited(rules.map(rule => rule.id === id ? { ...rule, ...change } : rule));

  return <form className="space-y-3" aria-labelledby={titleId} onSubmit={event => {
    event.preventDefault();
    onSave(() => appendKeywords(rules, pendingText), () => {
      setEdited(undefined);
      setPendingText('');
    });
  }}>
    <h4 id={titleId} className="sr-only">Matching rules for {item.name}</h4>
    <BudgetItemMatchingKeywords value={rules} onChange={setEdited} otherItems={otherItems} visibleInputLabel
      pendingText={pendingText} onPendingTextChange={setPendingText} disabled={disabled} />
    {rules.length > 0 && <details>
      <summary className="cursor-pointer py-2">Advanced matching rules</summary>
      <div className="grid gap-2">
        {rules.map((rule, index) => <fieldset key={rule.id} disabled={disabled} className="grid min-w-0 gap-2 rounded-md border p-2">
          <legend className="px-1 text-sm">Rule {index + 1} ({rule.source})</legend>
          <label>Keyword<Input name={`keyword-${rule.id}`} required maxLength={256} value={rule.keyword}
            onChange={event => changeRule(rule.id, { keyword: event.target.value })} /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label>Match against<select name={`field-${rule.id}`} className="block min-h-12 w-full rounded-md border bg-background px-3"
              value={rule.field ?? 'merchant'} onChange={event => changeRule(rule.id, {
                field: event.target.value === 'description' ? 'description' : 'merchant',
              })}>
              <option value="merchant">Merchant</option><option value="description">Description</option>
            </select></label>
            <label>Match when it<select name={`operator-${rule.id}`} className="block min-h-12 w-full rounded-md border bg-background px-3"
              value={rule.operator ?? 'contains'} onChange={event => changeRule(rule.id, {
                operator: event.target.value === 'equals' ? 'equals' : 'contains',
              })}>
              <option value="contains">Contains keyword</option><option value="equals">Equals keyword</option>
            </select></label>
          </div>
        </fieldset>)}
      </div>
    </details>}
    <Button type="submit" variant="outline" disabled={disabled}>Save matching rules</Button>
  </form>;
}
