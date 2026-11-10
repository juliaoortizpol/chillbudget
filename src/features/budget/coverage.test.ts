import { describe, expect, it } from 'vitest';
import { coversPurchase, coverageDate, coverageDisplayDate, lastIncludedCoverageDay } from './coverage';

describe('purchase coverage', () => {
  const open = { coverageVersion: 1, startDate: '2024-02-29T05:00:00Z', plannedEndDate: '2024-03-01T05:00:00Z' };
  it('keeps leap-day coverage open across DST, month and year boundaries', () => {
    for (const instant of ['2024-02-29T05:00:00Z', '2024-03-10T07:00:00Z', '2025-01-01T00:00:00Z']) expect(coversPurchase(open, instant)).toBe(true);
    expect(coversPurchase(open, '2024-02-29T04:59:59.999Z')).toBe(false);
  });
  it('excludes the exact actual cutoff and rejects invalid intervals', () => {
    const closed = { ...open, actualCutoffDate: '2024-12-01T05:00:00Z' };
    expect(coversPurchase(closed, '2024-12-01T04:59:59.999Z')).toBe(true);
    expect(coversPurchase(closed, closed.actualCutoffDate)).toBe(false);
    expect(coversPurchase({ ...open, actualCutoffDate: 'invalid' }, '2025-01-01')).toBe(false);
    expect(coversPurchase({ startDate: '2024-02-29', endDate: '2024-02-28' }, '2024-02-29')).toBe(false);
  });
  it('preserves the exact legacy inclusive instant without extending to the whole day', () => {
    const legacy = { startDate: '2024-11-01T00:00:00Z', endDate: '2024-11-30T00:00:00Z' };
    expect(coversPurchase(legacy, legacy.endDate)).toBe(true);
    expect(coversPurchase(legacy, '2024-11-30T00:00:00.001Z')).toBe(false);
  });
  it('displays the saved timezone rather than the host timezone without inferring legacy zones', () => {
    const shown = coverageDate('2024-03-01T00:30:00Z', 'America/New_York');
    expect(shown).toContain('Feb 29, 2024');
    expect(shown).toContain('America/New_York');
    expect(coverageDate('2024-03-01T00:30:00Z', undefined)).toContain('saved timezone unavailable');
    expect(coverageDate('invalid', 'UTC')).toBe('Unavailable');
  });
  it('finds the last included local day across leap, year and DST boundaries', () => {
    expect(lastIncludedCoverageDay('2024-03-01T05:00:00Z', 'America/New_York')).toBe('Feb 29, 2024');
    expect(lastIncludedCoverageDay('2025-01-01T04:00:00Z', 'America/La_Paz')).toBe('Dec 31, 2024');
    expect(lastIncludedCoverageDay('2024-03-11T04:00:00Z', 'America/New_York')).toBe('Mar 10, 2024');
    expect(lastIncludedCoverageDay('2024-11-04T05:00:00Z', 'America/New_York')).toBe('Nov 3, 2024');
    expect(lastIncludedCoverageDay('2024-03-11T04:00:00.001Z', 'America/New_York')).toBeUndefined();
    expect(lastIncludedCoverageDay('2024-03-11T05:00:00Z', 'America/New_York')).toBeUndefined();
    expect(lastIncludedCoverageDay('2024-03-11T04:00:00Z', undefined)).toBeUndefined();
    expect(lastIncludedCoverageDay('2024-03-11T04:00:00Z', 'invalid')).toBeUndefined();
    expect(coverageDisplayDate('2024-03-01T00:30:00Z', 'America/New_York')).toBe('Feb 29, 2024');
    expect(coverageDisplayDate('2024-03-01T00:30:00Z', undefined)).toContain('saved timezone unavailable');
  });
});
