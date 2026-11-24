import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/hooks/useFetch';
import type { Budget } from '../hooks/useBudget';
import { useBudgetReports, type ClosePreview, type Cutoff } from '../hooks/useBudgetReports';
import { ReportFigures } from './ReportFigures';
import { planningCurrencyLabel } from '../utils/reportMoney';

const blockerMessages: Record<string, string> = {
  resolve_budget_lifecycle: 'The saved legacy coverage must be resolved before closing.',
  resolve_other_budget_lifecycle: 'Another budget has unresolved legacy coverage.',
  conflicting_budget_coverage: 'Review overlapping budget coverage or choose a different cutoff.',
  resolve_planning_currency: 'The budget needs explicit DOP planning currency.',
  assignment_outside_cutoff: 'Review this assignment or choose a different cutoff.',
  unassigned: 'Assign the purchase to an eligible budget item.',
  invalid_assignment: 'Review the purchase’s existing assignment.',
  assignment_type_conflict: 'The purchase and assigned item have different types.',
  invalid_purchase_amount: 'Correct the recorded amount before closing.',
};

export function BudgetClose({ budget, onClosed, onDismiss }: {
  budget: Budget;
  onClosed: (reportId?: string) => Promise<unknown>;
  onDismiss: () => void;
}) {
  const title = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lock = useRef(false);
  const [fallback] = useState(() => typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    heading.current?.focus();
    return () => element?.close();
  }, []);
  const [day, setDay] = useState('');
  const [instant, setInstant] = useState('');
  const [preview, setPreview] = useState<ClosePreview>();
  const [reviewed, setReviewed] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<'uncertain' | 'closed'>();
  const [reportId, setReportId] = useState<string>();
  const api = useBudgetReports();

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request failed. Please retry.');
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  function cutoff(): Cutoff {
    if (instant.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(instant.trim()) || !Number.isFinite(Date.parse(instant))) {
        throw new Error('Enter a cutoff such as 2025-02-14T00:00:00-04:00.');
      }
      return { actualCutoffDate: instant.trim() };
    }
    return day ? { closeThroughDate: day } : {};
  }

  async function refresh(selection: Cutoff) {
    setReviewed(false);
    setPreviewCurrent(false);
    setPreview(await api.preview(budget._id, selection));
    setPreviewCurrent(true);
  }

  async function readClosed(id?: string) {
    setOutcome('closed');
    setReportId(id);
    try {
      await onClosed(id);
    } catch {
      throw new Error('Budget closed. Retry loading the saved closure.');
    }
  }

  async function reconcile() {
    const owned = await api.ownedBudget(budget._id);
    if (owned.status === 'closed') {
      await readClosed();
      return;
    }
    setOutcome(undefined);
    await refresh(preview ? { actualCutoffDate: preview.actualCutoffDate } : cutoff());
    setError('The budget is still active. Review the current preview before confirming again.');
  }

  function confirm() {
    if (!preview || !previewCurrent || !reviewed || preview.blockers.length || outcome) return;
    void run(async () => {
      setReviewed(false);
      let id: string;
      try {
        id = (await api.close(budget._id, preview)).reportId;
      } catch (cause) {
        if (cause instanceof ApiError && ['stale_close_preview', 'close_blocked'].includes(cause.code ?? '')) {
          await refresh({ actualCutoffDate: preview.actualCutoffDate });
          setError('The closing evidence changed. Review the refreshed figures and confirm again.');
          return;
        }
        setOutcome('uncertain');
        await reconcile();
        return;
      }
      await readClosed(id);
    });
  }

  const dismiss = () => {
    if (lock.current) return;
    setReviewed(false);
    dialog.current?.close();
    onDismiss();
  };

  const body = <>
    <h2 ref={heading} id={title} tabIndex={-1} className="break-words text-xl font-semibold">Review and close {budget.name}</h2>
    <p>Closing keeps transactions and balances, freezes the closing report, and excludes the closed period from later automatic matching.</p>
    <p>Saved timezone: {budget.timezone ?? 'Unavailable'}</p>
    {!outcome && <form className="grid gap-3" onSubmit={event => {
      event.preventDefault();
      setReviewed(false);
      void run(() => refresh(cutoff()));
    }}>
      <label>Close through calendar day
        <Input type="date" name="closeThroughDate" value={day} disabled={pending} onChange={event => {
          setDay(event.target.value); setInstant(''); setReviewed(false); setPreview(undefined);
        }} />
      </label>
      <label>Or enter an ISO cutoff with seconds and Z or a numeric offset
        <Input name="actualCutoffDate" value={instant} disabled={pending} onChange={event => {
          setInstant(event.target.value); setDay(''); setReviewed(false); setPreview(undefined);
        }} />
      </label>
      <p className="text-sm text-muted-foreground">Leave both fields empty to preview through the current instant.</p>
      <Button type="submit" disabled={pending}>{preview ? 'Refresh preview' : 'Load preview'}</Button>
    </form>}
    {pending && <p role="status">Checking budget…</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {outcome === 'uncertain' && <Button disabled={pending} onClick={() => void run(reconcile)}>Check closure status</Button>}
    {outcome === 'closed' && <p role="status">Budget closed and report saved.</p>}
    {outcome === 'closed' && error && <Button disabled={pending} onClick={() => void run(() => readClosed(reportId))}>Retry loading closure</Button>}
    {preview && !outcome && <>
      {!previewCurrent && <p role="status">These are the previous figures. Refresh the preview before confirming.</p>}
      <ReportFigures report={preview} currency={preview.actualsCurrency} incomplete={preview.blockers.length > 0 || !previewCurrent} />
      <p>Planning currency: {planningCurrencyLabel(preview.planningCurrencyContext)}</p>
      {preview.blockers.length > 0 && <ul className="list-disc space-y-2 pl-5">{preview.blockers.map((blocker, index) =>
        <li key={`${blocker.code}-${blocker.transactionId ?? index}`}>
          {blockerMessages[blocker.code] ?? 'Review the original purchase evidence and currency.'}
          {blocker.currency !== undefined && <> Recorded currency: {JSON.stringify(blocker.currency)}.</>}
          {blocker.transactionId && <> <a className="underline" href={`/transactions?transactionId=${encodeURIComponent(blocker.transactionId)}`} target="_blank" rel="noreferrer">Review live transaction (new tab)</a></>}
        </li>)}</ul>}
      {preview.blockers.length > 0 && <a className="underline" href="/accounts" target="_blank" rel="noreferrer">Open Accounts to sync transactions (new tab)</a>}
      {!preview.blockers.length && previewCurrent && <label className="flex min-h-12 items-center gap-2">
        <input type="checkbox" checked={reviewed} disabled={pending} onChange={event => setReviewed(event.target.checked)} />
        I reviewed this cutoff and the closing figures.
      </label>}
    </>}
    <div className="flex flex-wrap gap-2 [&_button]:min-h-12">
      <Button variant="outline" disabled={pending} onClick={dismiss}>{outcome === 'closed' ? 'Done' : 'Cancel'}</Button>
      {!outcome && <Button variant="destructive" disabled={pending || !reviewed || !previewCurrent || !preview || !!preview.blockers.length} onClick={confirm}>Close budget</Button>}
    </div>
  </>;
  if (fallback) return <section aria-labelledby={title} onKeyDown={event => {
    if (event.key === 'Escape') dismiss();
  }} className="basis-full space-y-4 rounded-xl border bg-card p-4">{body}</section>;
  return <dialog aria-labelledby={title} ref={dialog} onCancel={event => {
      event.preventDefault();
      dismiss();
    }} className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl space-y-4 overflow-y-auto overscroll-contain rounded-xl border bg-card p-4 text-card-foreground shadow-lg backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-black/50 sm:p-6">
      {body}
    </dialog>;
}
