import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { LoanScenarioResult } from '../types/loanCalculator.types';
import { AmortizationRow } from './AmortizationRow';

export function AmortizationSchedule({ baseline, accelerated }: { baseline: LoanScenarioResult; accelerated: LoanScenarioResult }) {
  const [scenario, setScenario] = useState('extra');
  const [year, setYear] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const result = scenario === 'extra' ? accelerated : baseline;
  const years = [...new Set(result.schedule.map(row => row.paymentDate.slice(0, 4)))];
  const selectedYear = years.includes(year) ? year : 'all';
  const filtered = result.schedule.filter(row => selectedYear === 'all' || row.paymentDate.startsWith(selectedYear));
  const visible = expanded ? filtered : filtered.slice(0, 8);
  return <section className="min-w-0 space-y-4" aria-label="Amortization schedule">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Schedule scenario" className="flex flex-wrap gap-2">{[{ id: 'current', label: 'Current plan' }, { id: 'extra', label: 'With extra payments' }].map(item => <Button key={item.id} type="button" size="sm" variant={scenario === item.id ? 'default' : 'secondary'} aria-pressed={scenario === item.id} onClick={() => { setScenario(item.id); setExpanded(false); }}>{item.label}</Button>)}</div>
      <label className="flex items-center gap-2 text-xs">Year<select className="rounded-lg border bg-card p-2" value={selectedYear} onChange={event => { setYear(event.target.value); setExpanded(false); }}><option value="all">All years</option>{years.map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p className="text-xs text-muted-foreground">Payment is scheduled principal + interest. Principal includes extra payments. Total paid also includes extra payments and recurring charges.</p>
    <div className="hidden max-w-full overflow-x-auto md:block"><table className="w-full text-xs"><caption className="sr-only">Loan amortization schedule</caption><thead className="bg-muted/60 text-muted-foreground"><tr>{['Payment #', 'Date', 'Beginning balance', 'Payment', 'Principal', 'Interest', 'Extra', 'Charges', 'Total paid', 'Ending balance', 'Cumulative interest'].map(label => <th key={label} scope="col" className="px-3 py-3 text-left whitespace-nowrap font-medium">{label}</th>)}</tr></thead><tbody>{visible.map(row => <AmortizationRow key={row.paymentNumber} row={row} />)}</tbody></table></div>
    <div className="md:hidden">{visible.map(row => <AmortizationRow key={row.paymentNumber} row={row} mobile />)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Showing {visible.length} of {filtered.length} payments</p>{filtered.length > 8 && <Button type="button" variant="secondary" size="sm" onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer payments' : 'View full schedule'}</Button>}</div>
  </section>;
}
