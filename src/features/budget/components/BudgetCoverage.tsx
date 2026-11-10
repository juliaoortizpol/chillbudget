import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalBudget } from '../hooks/useGlobalBudget';
import { browserTimezone, coverageDate } from '../coverage';
import type { Budget } from '../hooks/useBudget';

export function BudgetCoverage({ budget }: { budget: Budget }) {
  const plan = budget.plannedEndDate ?? budget.endDate;
  return <div className="space-y-1 break-words text-sm">
    <p className="font-semibold">{budget.name} · {budget.status === 'active' ? 'Active' : budget.status === 'closed' ? 'Closed' : 'Draft'}</p>
    <p>Coverage start (inclusive): {coverageDate(budget.startDate, budget.timezone)}</p>
    {plan && <p>{budget.coverageVersion === 1 ? 'Planned end (target / reminder)' : 'Coverage end (inclusive, legacy)'}: {coverageDate(plan, budget.timezone)}</p>}
    {budget.coverageVersion === 1 ? <>
      <p>Actual cutoff (exclusive): {budget.actualCutoffDate ? coverageDate(budget.actualCutoffDate, budget.timezone) : budget.status === 'active' ? 'Open — continues beyond the planned end' : 'Not finalized'}</p>
    </> : <p>Legacy coverage: saved end is inclusive. Lifecycle/timezone migration may be required before activation.</p>}
    {budget.status === 'closed' && <p>Closed at (confirmation): {coverageDate(budget.closedAt, budget.timezone)}</p>}
    {budget.status === 'closed' && <p>Read-only coverage summary.</p>}
  </div>;
}

function localInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function inputInstant(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || localInput(date) !== value) throw new Error('Enter an existing local date and time.');
  return date.toISOString();
}

export function BudgetLifecycle() {
  const { budgets, activeBudget, createBudget, updateBudget, fetchBudgets } = useGlobalBudget();
  const [name, setName] = useState('New budget');
  const [start, setStart] = useState(() => localInput(new Date()));
  const [plan, setPlan] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  let timezone = '';
  try { timezone = browserTimezone(); } catch { /* Show a creation validation error below. */ }

  const run = async (mutation: () => Promise<unknown>) => {
    if (lock.current || saved) return;
    lock.current = true;
    setPending(true);
    setError('');
    try {
      await mutation();
      setSaved(true);
      try { await fetchBudgets(); } catch { setError('Budget saved. Refresh failed; use Retry loading before another action.'); }
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'Unable to save budget.'} Correct the dates or resolve active-budget, overlap or legacy migration conflicts, then retry.`);
    } finally { lock.current = false; setPending(false); }
  };

  return <div className="space-y-6">
    {!activeBudget && <>
      <p>No active budget. Create a budget or explicitly activate a draft. Closed summaries remain read-only.</p>
      <form className="grid gap-3 max-w-xl" onSubmit={event => {
        event.preventDefault();
        void run(async () => {
          const zone = browserTimezone();
          const startDate = inputInstant(start);
          const plannedEndDate = plan ? inputInstant(plan) : undefined;
          if (plannedEndDate && Date.parse(plannedEndDate) <= Date.parse(startDate)) throw new Error('Planned end must follow the start.');
          return createBudget({ name: name.trim(), periodType: 'custom', startDate, plannedEndDate, timezone: zone, status: 'active' });
        });
      }}>
        <label>Budget name<Input required value={name} disabled={pending || saved} onChange={event => setName(event.target.value)} /></label>
        <label>Coverage start (inclusive)<Input type="datetime-local" required value={start} disabled={pending || saved} onChange={event => setStart(event.target.value)} /></label>
        <label>Planned end (optional target / reminder)<Input type="datetime-local" value={plan} disabled={pending || saved} onChange={event => setPlan(event.target.value)} /></label>
        <p>New budget timezone: {timezone || 'Unavailable — a valid browser timezone is required'}. Dates above use this timezone.</p>
        <Button disabled={pending || saved || !timezone || !name.trim()} type="submit">Create active budget</Button>
      </form>
    </>}
    {pending && <p role="status">Saving budget…</p>}
    {error && <p role="alert">{error}</p>}
    {budgets.filter(b => b.status !== 'active').map(budget => <section key={budget._id} className="rounded-lg border p-4 space-y-3">
      <BudgetCoverage budget={budget} />
      {!activeBudget && budget.status === 'draft' && <Button disabled={pending || saved} onClick={() => { void run(() => updateBudget(budget._id, { status: 'active' })); }}>Activate {budget.name}</Button>}
    </section>)}
  </div>;
}
