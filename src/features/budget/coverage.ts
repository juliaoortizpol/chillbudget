/** API instants remain instants. Plans never bound version 1 coverage. */
export interface Coverage {
  coverageVersion?: number;
  startDate?: string;
  endDate?: string;
  plannedEndDate?: string;
  actualCutoffDate?: string;
  timezone?: string;
}

export function coversPurchase(coverage: Coverage, timestamp?: string) {
  const time = Date.parse(timestamp || '');
  const start = Date.parse(coverage.startDate || '');
  if (!Number.isFinite(time) || !Number.isFinite(start) || time < start) return false;
  if (coverage.coverageVersion === 1) {
    if (!coverage.actualCutoffDate) return true;
    const cutoff = Date.parse(coverage.actualCutoffDate);
    return Number.isFinite(cutoff) && cutoff > start && time < cutoff;
  }
  const end = Date.parse(coverage.endDate || '');
  return Number.isFinite(end) && end >= start && time <= end;
}

export function browserTimezone() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!zone) throw new Error('A valid browser timezone is required to create a budget.');
  new Intl.DateTimeFormat('en', { timeZone: zone });
  return zone;
}

export function coverageDate(value: string | undefined, timezone: string | undefined) {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Unavailable';
  if (!timezone) return `${date.toISOString()} (saved timezone unavailable)`;
  try {
    return `${new Intl.DateTimeFormat(undefined, { timeZone: timezone, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(date)} [${timezone}] (${date.toISOString()})`;
  } catch {
    return `${date.toISOString()} (saved timezone unavailable)`;
  }
}

/** Short saved-zone dates for summaries; never substitute the browser zone. */
export function coverageDisplayDate(value: string | undefined, timezone: string | undefined, withTime = false) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Unavailable';
  if (!timezone) return 'Unavailable (saved timezone unavailable)';
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone, year: 'numeric', month: 'short', day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short' } as const : {}),
    }).format(new Date(value));
  } catch { return 'Unavailable (saved timezone unavailable)'; }
}

/** Only an exact saved-zone midnight represents a completed local day. */
export function lastIncludedCoverageDay(cutoff: string | undefined, timezone: string | undefined) {
  if (!cutoff || !timezone || !Number.isFinite(Date.parse(cutoff))) return undefined;
  const date = new Date(cutoff);
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(date);
    if (date.getUTCMilliseconds() !== 0 || !['hour', 'minute', 'second'].every(type => parts.find(part => part.type === type)?.value === '00')) return undefined;
    // The preceding instant is on the included day even across DST or year changes.
    return coverageDisplayDate(new Date(date.getTime() - 1).toISOString(), timezone);
  } catch { return undefined; }
}
