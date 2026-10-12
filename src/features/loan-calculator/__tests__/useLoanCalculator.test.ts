import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLoanCalculator } from '../hooks/useLoanCalculator';

describe('useLoanCalculator', () => {
  it('switches between years and months without changing the loan duration', () => {
    const { result } = renderHook(() => useLoanCalculator());
    const payment = result.current.baseline!.scheduledPayment;
    act(() => result.current.setTermUnit('months'));
    expect(result.current.inputs.loanTerm).toBe('72');
    expect(result.current.termLabel).toBe('72 months');
    expect(result.current.termPresets[0]).toEqual({ value: '36', label: '36 mo' });
    expect(result.current.baseline!.scheduledPayment).toBe(payment);
    act(() => result.current.setField('loanTerm', '17'));
    expect(result.current.baseline!.scheduledNumberOfPayments).toBe(17);
    const monthlyPayment = result.current.baseline!.scheduledPayment;
    act(() => result.current.setTermUnit('years'));
    expect(result.current.baseline!.scheduledNumberOfPayments).toBe(17);
    expect(result.current.baseline!.scheduledPayment).toBeCloseTo(monthlyPayment, 7);
    act(() => result.current.setTermUnit('months'));
    expect(result.current.inputs.loanTerm).toBe('17');
    act(() => result.current.reset());
    expect(result.current.inputs.loanTermUnit).toBe('years');
    expect(result.current.inputs.loanTerm).toBe('6');
  });
  it('preserves blank terms and shows the limit in the selected unit', () => {
    const { result } = renderHook(() => useLoanCalculator());
    act(() => result.current.setField('loanTerm', ''));
    act(() => result.current.setTermUnit('months'));
    expect(result.current.inputs.loanTerm).toBe('');
    expect(result.current.baseline).toBeNull();
    expect(result.current.validation.loanTermYears).toContain('1200 months');
    act(() => result.current.setField('loanTerm', '18'));
    expect(result.current.baseline!.scheduledNumberOfPayments).toBe(18);
    act(() => result.current.setField('paymentFrequency', 'biweekly'));
    expect(result.current.baseline!.scheduledNumberOfPayments).toBe(39);
  });
  it('starts with the reference scenario and identical no-extra scenarios', () => {
    const { result } = renderHook(() => useLoanCalculator());
    expect(result.current.inputs.annualInterestRate).toBe('16.95');
    expect(result.current.baseline?.scheduledPayment).toBeCloseTo(13908.618742377907, 8);
    expect(result.current.baseline).toEqual(result.current.accelerated);
    expect(result.current.validation).toEqual({});
  });
  it('updates both scenarios consistently, then resets', () => {
    const { result } = renderHook(() => useLoanCalculator());
    act(() => result.current.setField('extraPayment', '5000'));
    expect(result.current.comparison!.paymentsSaved).toBeGreaterThan(0);
    expect(result.current.comparison!.interestSaved).toBeGreaterThan(0);
    expect(result.current.baseline!.totalExtraPayments).toBe(0);
    act(() => result.current.setField('paymentFrequency', 'weekly'));
    expect(result.current.baseline!.scheduledNumberOfPayments).toBe(312);
    act(() => result.current.reset());
    expect(result.current.inputs.extraPayment).toBe('0');
    expect(result.current.inputs.paymentFrequency).toBe('monthly');
    expect(result.current.comparison!.paymentsSaved).toBe(0);
  });
  it('hides results on invalid or blank input and recovers without stale results', () => {
    const { result } = renderHook(() => useLoanCalculator());
    act(() => result.current.setField('loanAmount', ''));
    expect(result.current.validation.loanAmount).toBeTruthy();
    expect(result.current.baseline).toBeNull();
    expect(result.current.accelerated).toBeNull();
    expect(result.current.chartData).toEqual([]);
    act(() => result.current.setField('loanAmount', '1000'));
    expect(result.current.validation).toEqual({});
    expect(result.current.baseline!.totalPrincipal).toBeCloseTo(1000, 8);
    act(() => result.current.setField('annualInterestRate', '0'));
    expect(result.current.baseline!.totalInterest).toBe(0);
  });
  it('memoizes calculations across rerenders with unchanged inputs', () => {
    const { result, rerender } = renderHook(() => useLoanCalculator());
    const previous = result.current.baseline;
    rerender();
    expect(result.current.baseline).toBe(previous);
  });
});
