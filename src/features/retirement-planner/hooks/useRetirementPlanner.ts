import { useMemo, useState } from 'react';
import { DEFAULT_RETIREMENT_INPUT } from '../constants';
import type { RetirementFormValues, RetirementInput, RetirementValidation } from '../types';
import { calculateRetirementProjection, validateRetirementInput } from '../utils/retirementCalculator';

const toForm = (input: RetirementInput) => Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value)])) as RetirementFormValues;

export function useRetirementPlanner() {
  const [inputs, setInputs] = useState(() => toForm(DEFAULT_RETIREMENT_INPUT));
  const [extraContribution, setExtraContribution] = useState(5000);
  const result = useMemo(() => {
    const input = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)])) as unknown as RetirementInput;
    const validation: RetirementValidation = validateRetirementInput(input);
    const empty = { input, validation, projection: null, scenario: null, difference: 0, newContribution: 0 };
    if (Object.keys(validation).length) return empty;
    try {
      const projection = calculateRetirementProjection(input);
      const newContribution = input.monthlyContribution + extraContribution;
      const scenario = calculateRetirementProjection({ ...input, monthlyContribution: newContribution });
      return { input, validation, projection, scenario, newContribution, difference: scenario.projectedBalance - projection.projectedBalance };
    } catch (error) {
      return { ...empty, validation: { calculation: error instanceof Error ? error.message : 'Unable to calculate this projection.' } };
    }
  }, [inputs, extraContribution]);
  const setField = (key: keyof RetirementInput, value: string) => setInputs(current => ({ ...current, [key]: value }));
  const applyRecommendation = () => {
    if (result.projection) setField('monthlyContribution', String(result.projection.recommendedContribution));
  };
  return {
    inputs, setField, extraContribution, setExtraContribution, ...result, applyRecommendation,
    reset: () => { setInputs(toForm(DEFAULT_RETIREMENT_INPUT)); setExtraContribution(5000); },
  };
}
