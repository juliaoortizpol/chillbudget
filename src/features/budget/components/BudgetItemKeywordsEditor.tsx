import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { BudgetItemMatchingKeywords, type KeywordProps } from './BudgetItemMatchingKeywords';
import type { BudgetItemMatchingRule } from '../hooks/useBudget';

export function BudgetItemKeywordsEditor({ value, onSave, suggestions, otherItems }: Omit<KeywordProps, 'onChange'> & { onSave: (rules: BudgetItemMatchingRule[]) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  return <Popover open={open} onOpenChange={next => { if (!saving) { setOpen(next); if (next) { setDraft(value); setError(''); } } }}>
    <PopoverTrigger className="text-left text-[11px] text-primary hover:underline px-1" aria-label="Edit matching keywords">
      {value.length ? `${value.length} matching keyword${value.length === 1 ? '' : 's'}` : 'Add matching keywords'}
    </PopoverTrigger>
    <PopoverContent align="start" className="w-80 p-4">
      <BudgetItemMatchingKeywords value={draft} onChange={setDraft} suggestions={suggestions} otherItems={otherItems} />
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      <Button disabled={saving} onClick={async () => {
        setSaving(true); setError('');
        try { await onSave(draft); setOpen(false); }
        catch (err) { setError(err instanceof Error ? err.message : 'Failed to save keywords'); }
        finally { setSaving(false); }
      }}>{saving ? 'Saving…' : 'Save keywords'}</Button>
    </PopoverContent>
  </Popover>;
}
