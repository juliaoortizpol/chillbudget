import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, useFetch } from '@/hooks/useFetch';
import { browserTimezone, coverageDisplayDate } from '../coverage';
import { deserializeBudget, type ApiBudget, type Budget } from '../hooks/useBudget';
import { useGlobalBudget } from '../hooks/useGlobalBudget';
import { BudgetCoverage } from './BudgetCoverage';
import { DraftItemRules } from './DraftItemRules';

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

interface DraftAttempt {
  endpoint: string;
  body: string;
  sourceName?: string;
}

function newOperationKey() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
    byte.toString(16).padStart(2, '0')).join('');
}

function startInput(value: string) {
  if (!dateOnly.test(value) && !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    throw new Error('Enter YYYY-MM-DD or an ISO timestamp with Z or a numeric offset.');
  }
  if (!Number.isFinite(Date.parse(value)) || (dateOnly.test(value) && new Date(value).toISOString().slice(0, 10) !== value)) {
    throw new Error('Enter a valid coverage date.');
  }
  return value;
}

export function NextBudget() {
  const { activeBudget, budgets, fetchBudgets, updateBudget, updateBudgetItem, addBudgetItem, retainSavedBudgetItem } = useGlobalBudget();
  const dateHint = useId();
  const recoveryHint = useId();
  const { fetchApi } = useFetch();
  const [mode, setMode] = useState<'copy' | 'empty'>();
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [period, setPeriod] = useState<Budget['periodType']>('monthly');
  const [draftId, setDraftId] = useState('');
  const [explicitStart, setExplicitStart] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activated, setActivated] = useState<Budget>();
  const [createdDraft, setCreatedDraft] = useState<Budget>();
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [createAttempt, setCreateAttempt] = useState<DraftAttempt>();
  const lock = useRef(false);
  const uncertain = createAttempt !== undefined;
  const source = activeBudget ?? [...budgets].filter(b => b.status === 'closed')
    .sort((a, b) => Date.parse(b.actualCutoffDate ?? b.endDate ?? '') - Date.parse(a.actualCutoffDate ?? a.endDate ?? ''))[0];
  const previous = [...budgets].filter(b => b.status === 'closed' && b.actualCutoffDate)
    .sort((a, b) => Date.parse(b.actualCutoffDate!) - Date.parse(a.actualCutoffDate!))[0];
  const selected = budgets.find(b => b._id === draftId) ??
    (createdDraft?._id === draftId ? createdDraft : undefined);
  const draft = selected?.status === 'draft' && activated?._id !== draftId ? selected : undefined;

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError('');
    try { await action(); } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the budget.');
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  async function refresh() {
    setRefreshFailed(true);
    try {
      await fetchBudgets();
      setCreatedDraft(undefined);
      setRefreshFailed(false);
    } catch {
      throw new Error('Saved. Retry loading budgets to see the latest configuration.');
    }
  }

  async function startCreation(): Promise<DraftAttempt> {
    const timezone = mode === 'copy' && source?.timezone ? source.timezone : browserTimezone();
    const plan = { name: name.trim(), periodType: period, startDate: startInput(start.trim()), timezone };
    if (!plan.name) throw new Error('Enter a budget name.');
    const plannedEndDate = end ? startInput(end.trim()) : undefined;
    if (plannedEndDate && Date.parse(plannedEndDate) <= Date.parse(plan.startDate)) throw new Error('Planned end must follow the provisional start.');
    const owned = await fetchBudgets();
    const copySource = mode === 'copy' ? owned.find(b => b._id === source?._id && b.status !== 'draft') : undefined;
    if (mode === 'copy' && !copySource) throw new Error('The source budget is unavailable. Choose a source or start empty.');
    if (copySource?.timezone && copySource.timezone !== timezone) {
      throw new Error('The source timezone changed. Review the source and save the draft again.');
    }
    return {
      endpoint: copySource ? `/budgets/${copySource._id}/drafts` : '/budgets',
      body: JSON.stringify({
        ...plan, plannedEndDate, currency: 'DOP', operationKey: newOperationKey(),
        ...(!copySource && { status: 'draft' }),
      }),
      sourceName: copySource?.name,
    };
  }

  async function create() {
    if (!mode || refreshFailed) return;
    setNotice('');
    const attempt = createAttempt ?? await startCreation();
    let saved: Budget;
    try {
      const response = await fetchApi<ApiBudget>(attempt.endpoint, { method: 'POST', body: attempt.body });
      if (!response?._id) throw new Error('The save response did not identify the budget.');
      saved = deserializeBudget(response);
    } catch (cause) {
      if (!uncertain && cause instanceof ApiError && cause.status === 400) throw cause;
      setCreateAttempt(attempt);
      if (cause instanceof ApiError && cause.code === 'draft_operation_conflict') {
        throw new Error('This save conflicts with an earlier draft request. Review saved drafts before preparing a separate draft.');
      }
      if (cause instanceof ApiError && cause.status === 404) {
        throw new Error('The original draft or copy source is unavailable. Review saved drafts before preparing a separate draft.');
      }
      throw new Error('Could not confirm the draft save. Retry the original save to recover its result.');
    }
    setCreateAttempt(undefined);
    setMode(undefined);
    setCreatedDraft(saved);
    setDraftId(saved._id);
    setNotice('Draft saved.');
    await refresh();
  }

  async function activate() {
    if (!draft || activeBudget || refreshFailed) return;
    const value = explicitStart.trim();
    const activationStart = value ? startInput(value) : undefined;
    const effective = activationStart ?? previous?.actualCutoffDate ?? draft.startDate;
    if (previous?.actualCutoffDate && Date.parse(effective) < Date.parse(previous.actualCutoffDate)) {
      throw new Error('The start must be at or after the previous confirmed cutoff.');
    }
    const saved = deserializeBudget(await fetchApi<ApiBudget>(`/budgets/${draft._id}/activate`, {
      method: 'POST',
      body: JSON.stringify(activationStart ? { startDate: activationStart } : {}),
    }));
    setActivated(saved);
    setNotice('Budget activated.');
    await refresh();
  }

  return <section className="space-y-3 rounded-xl border bg-card p-4">
    <h2 className="text-lg font-semibold">Prepare the next budget</h2>
    {!activeBudget && <p>No active budget. Review and activate a draft when you’re ready.</p>}
    <p className="text-sm text-muted-foreground">Drafts leave current coverage in place. Copies carry planning configuration. Actual spending and balances stay with their original records.</p>
    {(mode || draft) && <p id={dateHint} className="text-sm text-muted-foreground">A date without a time means midnight UTC. To choose a local time, enter an ISO timestamp with Z or a numeric offset.</p>}
    <div className="flex flex-wrap gap-2">
      {source && <Button variant="outline" disabled={pending || uncertain || refreshFailed} onClick={() => setMode('copy')}>Create from previous</Button>}
      <Button variant="outline" disabled={pending || uncertain || refreshFailed} onClick={() => setMode('empty')}>Start empty</Button>
    </div>
    {mode && <form className="grid max-w-xl gap-3" onSubmit={event => { event.preventDefault(); void run(create); }}>
      {mode === 'copy' && <p>Copy planning from {createAttempt?.sourceName ?? source?.name}.</p>}
      <label>Budget name<Input name="name" required value={name} onChange={event => setName(event.target.value)} disabled={pending || uncertain} /></label>
      <label>Period type<select name="periodType" className="block min-h-12 w-full rounded-md border bg-background px-3" value={period} disabled={pending || uncertain}
        onChange={event => setPeriod(event.target.value as Budget['periodType'])}>
        <option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="custom">Custom</option>
      </select></label>
      <label>Provisional start (YYYY-MM-DD or ISO with offset)<Input name="startDate" aria-describedby={dateHint} required value={start} disabled={pending || uncertain} onChange={event => setStart(event.target.value)} /></label>
      <label>Planned end (optional, YYYY-MM-DD or ISO with offset)<Input name="plannedEndDate" aria-describedby={dateHint} value={end} disabled={pending || uncertain} onChange={event => setEnd(event.target.value)} /></label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || refreshFailed}>{uncertain ? 'Retry draft save' : 'Save draft'}</Button>
        <Button variant="outline" type="button" disabled={pending} aria-describedby={uncertain ? recoveryHint : undefined}
          onClick={() => {
            setCreateAttempt(undefined);
            setError('');
            if (!uncertain) setMode(undefined);
          }}>{uncertain ? 'Prepare a separate draft' : 'Cancel draft preparation'}</Button>
      </div>
      {uncertain && <p id={recoveryHint} className="text-sm text-muted-foreground">The original save may have created a draft. Preparing a separate draft lets you edit these details and create another one.</p>}
    </form>}
    {pending && <p role="status">Working…</p>}
    {notice && <p role="status">{notice}</p>}
    {activated && (activeBudget?._id === activated._id || (refreshFailed && !activeBudget)) &&
      <p>Activated coverage starts {coverageDisplayDate(activated.startDate, activated.timezone, true)} ({activated.timezone ?? 'UTC'}).</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {refreshFailed && <Button disabled={pending} onClick={() => void run(refresh)}>Retry loading budgets</Button>}
    {budgets.filter(b => b.status === 'draft').map(b => <Button variant="outline" key={b._id} disabled={pending} onClick={() => {
      setDraftId(b._id); setExplicitStart('');
    }}>Review draft {b.name}</Button>)}
    {draft && <div key={draft._id} className="space-y-3">
      <BudgetCoverage budget={draft} />
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer py-2">Edit draft settings</summary>
        <form className="grid max-w-xl gap-2" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(async () => {
            const name = String(data.get('name')).trim();
            if (!name) throw new Error('Enter a draft name.');
            const startDate = startInput(String(data.get('startDate')).trim());
            const plannedEnd = String(data.get('plannedEndDate')).trim();
            const plannedEndDate = plannedEnd ? startInput(plannedEnd) : undefined;
            if (plannedEndDate && Date.parse(plannedEndDate) <= Date.parse(startDate)) {
              throw new Error('Planned end must follow the provisional start.');
            }
            await updateBudget(draft._id, { name, startDate, plannedEndDate });
            setNotice('Draft settings saved.');
            await refresh();
          });
        }}>
          <label>Draft name<Input name="name" required defaultValue={draft.name} disabled={pending} /></label>
          <label>Draft provisional start<Input name="startDate" aria-describedby={dateHint} required defaultValue={draft.startDate} disabled={pending} /></label>
          <label>Draft planned end<Input name="plannedEndDate" aria-describedby={dateHint} defaultValue={draft.plannedEndDate ?? draft.endDate ?? ''} disabled={pending} /></label>
          <Button type="submit" variant="outline" disabled={pending || refreshFailed}>Save draft settings</Button>
        </form>
      </details>
      {!draft.items.length && <p>This draft has no budget items.</p>}
      {draft.items.map(item => item._id && <div key={item._id} className="space-y-3 rounded-lg border p-3">
        <h3 className="break-words font-medium">{item.name} · {item.type}</h3>
        {item.description && <p className="break-words">{item.description}</p>}
        <form className="space-y-2" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(async () => {
            const saved = await updateBudgetItem(draft._id, item._id!, { plannedAmount: Number(data.get('plannedAmount')) });
            retainSavedBudgetItem(draft._id, saved);
            setNotice('Draft item saved.');
            await refresh();
          });
        }}>
          <label>Planned amount (DOP)<Input name="plannedAmount" type="number" step="0.01" min="0" required defaultValue={item.plannedAmount} disabled={pending} /></label>
          <Button type="submit" variant="outline" disabled={pending || refreshFailed}>Save item target</Button>
        </form>
        {item.type === 'expense' && <DraftItemRules item={item} otherItems={draft.items.filter(other =>
          other._id !== item._id && other.type === 'expense')} disabled={pending || refreshFailed}
          onSave={(getRules, onSaved) => void run(async () => {
            const saved = await updateBudgetItem(draft._id, item._id!, { matchingRules: getRules() });
            retainSavedBudgetItem(draft._id, saved);
            onSaved();
            setNotice('Draft matching rules saved.');
            await refresh();
          })} />}
      </div>)}
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer py-2">Add draft item</summary>
        <form className="grid max-w-xl gap-2" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void run(async () => {
            const name = String(data.get('name')).trim();
            if (!name) throw new Error('Enter an item name.');
            const saved = await addBudgetItem(draft._id, {
              name, type: String(data.get('type')), plannedAmount: Number(data.get('target')),
            });
            retainSavedBudgetItem(draft._id, saved);
            form.reset();
            setNotice('Draft item added.');
            await refresh();
          });
        }}>
          <label>Item name<Input name="name" required disabled={pending} /></label>
          <label>Item type<select name="type" className="block min-h-12 w-full rounded-md border bg-background px-3" disabled={pending}>
            <option value="expense">Expense</option><option value="income">Income</option>
          </select></label>
          <label>Item target (DOP)<Input name="target" type="number" step="0.01" min="0" required disabled={pending} /></label>
          <Button type="submit" variant="outline" disabled={pending || refreshFailed}>Save new item</Button>
        </form>
      </details>
      {activeBudget ? <p>Close the active budget explicitly before activating this draft.</p> : <form className="grid max-w-xl gap-2" onSubmit={event => {
        event.preventDefault();
        void run(activate);
      }}>
        <p>Provisional start: {coverageDisplayDate(draft.startDate, draft.timezone, true)}</p>
        <p>{previous?.actualCutoffDate ? `Default from the previous confirmed cutoff: ${coverageDisplayDate(previous.actualCutoffDate, draft.timezone, true)}` : 'Default start uses the provisional start when there is no prior closure.'}</p>
        <label>Optional activation start (YYYY-MM-DD or ISO with offset)<Input name="activationStart" aria-describedby={dateHint} value={explicitStart} onChange={event => setExplicitStart(event.target.value)} disabled={pending} /></label>
        <Button type="submit" disabled={pending || refreshFailed}>Activate reviewed draft</Button>
      </form>}
    </div>}
    {activeBudget && <a className="underline" href={`/transactions?budgetId=${encodeURIComponent(activeBudget._id)}`}>Review expenses in the active budget</a>}
  </section>;
}
