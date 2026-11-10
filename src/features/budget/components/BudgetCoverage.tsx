import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, History } from 'lucide-react';
import { useGlobalBudget } from '../hooks/useGlobalBudget';
import { browserTimezone, coverageDisplayDate, lastIncludedCoverageDay } from '../coverage';
import type { Budget } from '../hooks/useBudget';

export function BudgetCoverage({ budget, heading = false }: { budget: Budget; heading?: boolean }) {
  const plan = budget.plannedEndDate ?? budget.endDate;
  const display = (value: string | undefined, withTime = false) => coverageDisplayDate(value, budget.timezone, withTime);
  const lastDay = budget.coverageVersion === 1 && budget.status === 'closed'
    ? lastIncludedCoverageDay(budget.actualCutoffDate, budget.timezone) : undefined;
  const exactDate = (value: string | undefined) => value && Number.isFinite(Date.parse(value))
    ? <>{display(value, true)} · <time dateTime={value}>{new Date(value).toISOString()}</time></> : 'Unavailable';
  // Compare saved-zone calendar days: a target is informational for its whole local day.
  const localDay = (value: string) => {
    try {
      const parts = new Intl.DateTimeFormat('en', { timeZone: budget.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
      return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
    }
    catch { return undefined; }
  };
  const targetDay = budget.timezone && plan ? localDay(plan) : undefined;
  const today = budget.timezone ? localDay(new Date().toISOString()) : undefined;
  const pastPlan = budget.coverageVersion === 1 && budget.status === 'active' && targetDay && today && targetDay < today;
  const Title = heading ? 'h1' : 'h2';
  return <div className="space-y-1 break-words text-sm">
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Title className={heading ? 'min-w-0 text-2xl font-semibold sm:text-3xl' : 'min-w-0 text-lg font-semibold'}>{budget.name}</Title>
      <Badge variant="secondary">{budget.status === 'active' ? 'Active' : budget.status === 'closed' ? 'Closed' : 'Draft'}</Badge>
      {pastPlan && <Badge variant="outline">Past planned end</Badge>}
    </div>
    {budget.status === 'active' && <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
      <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
      <span>Started {display(budget.startDate)} (inclusive).</span>
      <span className="font-medium text-primary">{budget.coverageVersion === 1 ? 'Still active until manually closed.' : 'Legacy coverage uses the saved inclusive end.'}</span>
      {plan && <span>{budget.coverageVersion === 1 ? 'Planned end (target / reminder)' : 'Coverage end (inclusive, legacy)'}: {display(plan)}</span>}
    </p>}
    {lastDay ? <p>Coverage: {display(budget.startDate)} through {lastDay} (inclusive).</p>
      : budget.status !== 'active' && <p>Coverage start (inclusive): {display(budget.startDate)}</p>}
    {budget.status === 'closed' && budget.coverageVersion === 1 && !lastDay && <p>Coverage ends before: {display(budget.actualCutoffDate, true)}</p>}
    {plan && budget.status !== 'active' && <p>{budget.coverageVersion === 1 ? 'Planned end (target / reminder)' : 'Coverage end (inclusive, legacy)'}: {display(plan)}</p>}
    {budget.coverageVersion === 1 ? <>
      {budget.status === 'draft' && <p>Planning only. Activate explicitly to use this budget.</p>}
    </> : <p>Legacy coverage: saved end is inclusive. Lifecycle/timezone migration may be required before activation.</p>}
    {budget.status === 'closed' && <p>Read-only coverage summary.</p>}
    <details>
      <summary className="w-fit cursor-pointer rounded-sm py-2 text-primary focus-visible:outline-2 focus-visible:outline-ring">Exact coverage dates</summary>
      <div className="space-y-1 pt-1">
        <p className="text-muted-foreground">Timezone: {budget.timezone || 'Unavailable — saved timezone unavailable'}</p>
        {budget.status === 'active' && budget.coverageVersion === 1 && <p>Remains active until manually closed. A planned end is only a target.</p>}
        <p>Coverage start (inclusive), exact: {exactDate(budget.startDate)}</p>
        {plan && <p>{budget.coverageVersion === 1 ? 'Planned target' : 'Legacy inclusive end'}, exact: {exactDate(plan)}</p>}
        {budget.coverageVersion === 1 && budget.actualCutoffDate && <p>Actual cutoff (exclusive): {exactDate(budget.actualCutoffDate)}</p>}
        {budget.status === 'closed' && <p>Closed at (confirmation): {exactDate(budget.closedAt)}</p>}
      </div>
    </details>
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
    <details>
    <summary className="w-fit cursor-pointer rounded-sm py-2 text-primary focus-visible:outline-2 focus-visible:outline-ring"><History aria-hidden="true" className="mr-2 inline size-4" />History and drafts</summary>
    <div className="space-y-3 pt-3">
    {!budgets.some(b => b.status !== 'active') && <p className="text-sm text-muted-foreground">No closed budgets or drafts yet.</p>}
    {budgets.filter(b => b.status !== 'active').map(budget => <section key={budget._id} className="rounded-lg border p-4 space-y-3">
      <BudgetCoverage budget={budget} />
      {!activeBudget && budget.status === 'draft' && <Button disabled={pending || saved} onClick={() => { void run(() => updateBudget(budget._id, { status: 'active' })); }}>Activate {budget.name}</Button>}
    </section>)}
    </div>
    </details>
  </div>;
}
