import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFetch } from '@/hooks/useFetch';
import { coverageDisplayDate } from '../coverage';
import type { HistoryEntry, PurchaseEvidence, ReportException, ReportPage, SavedReport } from '../hooks/useBudgetReports';
import { ReportFigures } from './ReportFigures';
import { purchaseAmount } from '../utils/reportMoney';

function useReportRead<T>(path: string | null, revision = 0) {
  const { fetchApi } = useFetch();
  const [data, setData] = useState<T>();
  const [settled, setSettled] = useState<{ key: string; error?: string }>();
  const [attempt, setAttempt] = useState(0);
  const key = `${path}:${revision}:${attempt}`;

  useEffect(() => {
    if (!path) return;
    let current = true;
    void fetchApi<T>(path).then(result => {
      if (current) {
        setData(result);
        setSettled({ key });
      }
    }).catch(() => {
      if (current) setSettled({ key, error: 'Could not load this information.' });
    });
    return () => { current = false; };
  }, [path, key, fetchApi]);

  return {
    data,
    error: settled?.key === key ? settled.error ?? '' : '',
    pending: !!path && settled?.key !== key,
    retry: () => setAttempt(previous => previous + 1),
  };
}

function ReadStatus({ read }: { read: { error: string; pending: boolean; retry: () => void } }) {
  return <>
    {read.pending && <p role="status">Loading…</p>}
    {read.error && <div role="alert" className="flex flex-wrap items-center gap-2">
      <p>{read.error}</p><Button variant="outline" onClick={read.retry}>Retry read</Button>
    </div>}
  </>;
}

function PageNav({ data, pending, onPage, label }: {
  data: ReportPage<unknown>;
  pending: boolean;
  onPage: (page: number) => void;
  label: string;
}) {
  return <nav aria-label={label} className="flex flex-wrap items-center gap-2">
    <Button variant="outline" disabled={pending || data.page <= 1} onClick={() => onPage(data.page - 1)}>Previous</Button>
    <span>Page {data.page}</span>
    <Button variant="outline" disabled={pending || data.page * data.limit >= data.total} onClick={() => onPage(data.page + 1)}>Next</Button>
  </nav>;
}

const liveLink = (id: string) => `/transactions?transactionId=${encodeURIComponent(id)}`;

function Purchase({ row, report }: { row: PurchaseEvidence; report: SavedReport }) {
  const item = report.items.find(item => item.budgetItemId === row.budgetItemId);
  return <div className="break-words text-sm">
    <p>{row.name} · {purchaseAmount(row.amount, row.currency ?? 'Currency unavailable')} · {row.type}</p>
    <p>{coverageDisplayDate(row.date, report.timezone, true)} · {item?.categoryName ?? (row.budgetItemId ? 'Different assignment' : 'Unassigned')}</p>
    {row.currencyOrigin && <p>Currency evidence: {row.currencyOrigin}</p>}
    {row.matchingSource && <p>Assignment source: {row.matchingSource}</p>}
    {row.rawDescription && <p>{row.rawDescription}</p>}
  </div>;
}

function SavedPurchase({ report, id }: { report: SavedReport; id: string }) {
  const read = useReportRead<PurchaseEvidence>(`/budget-reports/${report._id}/transactions/${id}`);
  return <>
    <ReadStatus read={read} />
    {read.data && <>
      <Purchase row={read.data} report={report} />
      <a className="underline" href={liveLink(id)}>Open live transaction</a>
    </>}
  </>;
}

function Exceptions({ report }: { report: SavedReport }) {
  const [page, setPage] = useState(1);
  const read = useReportRead<ReportPage<ReportException>>(`/budget-reports/${report._id}/exceptions?page=${page}`);
  return <section className="space-y-2">
    <h3 className="font-semibold">Late arrivals and later corrections</h3>
    <p>These changes are excluded from the saved report.</p>
    <ReadStatus read={read} />
    {read.data?.total === 0 && <p>No exceptions.</p>}
    {read.data?.data.map(exception => <details key={exception._id} className="rounded-lg border p-3">
      <summary className="cursor-pointer py-2">{exception.before ? 'Correction' : 'Late arrival'} · {exception.after?.name ?? exception.before?.name} · {coverageDisplayDate(exception.createdAt, report.timezone, true)}</summary>
      <p>{exception.includedInSnapshot ? 'Original purchase included at closing.' : 'Purchase outside the snapshot.'}</p>
      <p>{exception.inCoverageAfter ? 'Corrected date is within closed coverage.' : 'Current purchase is outside closed coverage.'}</p>
      {exception.before && <div><h4 className="font-medium">Before</h4><Purchase row={exception.before} report={report} /></div>}
      {exception.after && <div><h4 className="font-medium">After</h4><Purchase row={exception.after} report={report} /></div>}
      <a className="underline" href={liveLink(exception.transactionId)}>Open live transaction</a>
    </details>)}
    {read.data && read.data.total > 0 && <PageNav label="Exception pages" data={read.data} pending={read.pending} onPage={setPage} />}
  </section>;
}

function ReportDetail({ id }: { id: string }) {
  const read = useReportRead<SavedReport>(`/budget-reports/${id}`);
  const [purchase, setPurchase] = useState<string>();
  const [page, setPage] = useState(1);
  const limit = 20;
  const report = read.data;
  return <section className="space-y-4 rounded-lg border bg-card p-4">
    <ReadStatus read={read} />
    {report && <>
      <h2 className="text-lg font-semibold">Saved closing report for {report.budgetName}</h2>
      <p>Closed at {coverageDisplayDate(report.closedAt, report.timezone, true)}. Live transactions may have changed since closing.</p>
      <ReportFigures report={report} currency={report.currencyContext.actualsCurrency} />
      <p>Planning currency: {report.currencyContext.planning.currency} ({report.currencyContext.planning.origin})</p>
      <h3 className="font-semibold">Included purchases at closing</h3>
      {!report.transactions.length && <p>No purchases were included.</p>}
      <ul className="max-h-72 space-y-2 overflow-y-auto" aria-label="Included purchases">
        {report.transactions.slice((page - 1) * limit, page * limit).map(row => <li key={row.transactionId} className="rounded-lg border p-2">
          <Purchase row={row} report={report} />
          <Button variant="outline" aria-expanded={purchase === row.transactionId} onClick={() =>
            setPurchase(current => current === row.transactionId ? undefined : row.transactionId)}>
            Saved details for {row.name}
          </Button>
          {purchase === row.transactionId && <SavedPurchase key={purchase} report={report} id={purchase} />}
        </li>)}
      </ul>
      {report.transactions.length > limit && <PageNav label="Included purchase pages"
        data={{ data: [], page, limit, total: report.transactions.length }} pending={false} onPage={setPage} />}
      <Exceptions report={report} />
    </>}
  </section>;
}

export function BudgetHistory({ open, revision, selected, onSelect }: {
  open: boolean;
  revision: number;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const read = useReportRead<ReportPage<HistoryEntry>>(open ? `/budget-reports?page=${page}&limit=20` : null, revision);

  return <div className="space-y-3">
    <ReadStatus read={read} />
    {read.data?.total === 0 && <p>No closed budgets yet.</p>}
    {read.data?.data.map(entry => <section key={entry._id} className="space-y-2 rounded-lg border p-4 break-words">
      <h2 className="font-semibold">{entry.name} · Closed</h2>
      <p>Coverage start: {coverageDisplayDate(entry.startDate, entry.timezone, true)}</p>
      {entry.actualCutoffDate
        ? <p>Actual cutoff (exclusive): {coverageDisplayDate(entry.actualCutoffDate, entry.timezone, true)}</p>
        : <p>Legacy end (inclusive): {coverageDisplayDate(entry.endDate, entry.timezone, true)}</p>}
      <p>Timezone: {entry.timezone ?? 'Unavailable'} · Closed at: {coverageDisplayDate(entry.closedAt, entry.timezone, true)}</p>
      {entry.reportStatus === 'final' && entry.reportId
        ? <Button variant="outline" onClick={() => onSelect(entry.reportId!)}>View saved report for {entry.name}</Button>
        : <p>Saved report unavailable for this legacy budget.</p>}
    </section>)}
    {read.data && read.data.total > 0 && <PageNav label="History pages" data={read.data} pending={read.pending} onPage={setPage} />}
    {selected && <ReportDetail key={selected} id={selected} />}
  </div>;
}
