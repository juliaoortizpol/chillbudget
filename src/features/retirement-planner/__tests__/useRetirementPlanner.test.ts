import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRetirementPlanner } from '../hooks/useRetirementPlanner';

describe('useRetirementPlanner', () => {
  it('updates the save-more scenario without altering the current contribution', () => {
    const { result } = renderHook(() => useRetirementPlanner());
    const original = result.current.projection!.projectedBalance;
    act(() => result.current.setExtraContribution(2500));
    expect(result.current.inputs.monthlyContribution).toBe('10000');
    expect(result.current.newContribution).toBe(12500);
    expect(result.current.projection!.projectedBalance).toBe(original);
    expect(result.current.difference).toBeGreaterThan(0);
    act(() => result.current.setExtraContribution(0));
    expect(result.current.difference).toBe(0);
  });
  it('applies a suggested contribution and resets to the initial assumptions', () => {
    const { result } = renderHook(() => useRetirementPlanner());
    act(() => result.current.setField('monthlyContribution', '100'));
    expect(result.current.projection!.shortfall).toBeGreaterThan(0);
    act(() => result.current.applyRecommendation());
    expect(result.current.projection!.shortfall).toBe(0);
    act(() => result.current.reset());
    expect(result.current.inputs.monthlyContribution).toBe('10000');
    expect(result.current.inputs.inflation).toBe('3');
  });
  it('clears stale results for invalid inputs and recovers', () => {
    const { result } = renderHook(() => useRetirementPlanner());
    act(() => result.current.setField('retirementAge', ''));
    expect(result.current.validation.retirementAge).toBeTruthy();
    expect(result.current.projection).toBeNull();
    expect(result.current.scenario).toBeNull();
    act(() => result.current.setField('retirementAge', '70'));
    expect(result.current.projection!.yearsToRetirement).toBe(43);
  });
});
