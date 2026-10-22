import { useMemo, useState } from 'react';
import { DEFAULT_LOAN_INPUT, MAX_TERM_YEARS, TERM_PRESETS } from '../constants/loanCalculator.constants';
import type { LoanCalculatorInput, LoanFormValues, LoanTermUnit, LoanValidation } from '../types/loanCalculator.types';
import { convertLoanTerm } from '../utils/loanTerm';
import { buildLoanBalanceData, calculateLoanScenario, compareLoanScenarios } from '../utils/loanCalculator';
import { normalizeLoanInput, toLoanFormValues, validateLoanInput } from '../utils/loanValidation';

export function useLoanCalculator(initial: LoanCalculatorInput = DEFAULT_LOAN_INPUT) {
  const [inputs, setInputs] = useState(() => toLoanFormValues(initial));
  const result = useMemo(() => {
    const normalized = normalizeLoanInput(inputs);
    const validation: LoanValidation = validateLoanInput(normalized);
    if (Object.keys(validation).length) return { normalized, validation, baseline: null, accelerated: null, comparison: null, chartData: [] };
    try {
      const baseline = calculateLoanScenario({ ...normalized, extraPayment: 0 });
      const accelerated = calculateLoanScenario(normalized);
      return { normalized, validation, baseline, accelerated, comparison: compareLoanScenarios(baseline, accelerated), chartData: buildLoanBalanceData(normalized, baseline, accelerated) };
    } catch (error) {
      return { normalized, validation: { calculation: error instanceof Error ? error.message : 'Unable to calculate this loan.' }, baseline: null, accelerated: null, comparison: null, chartData: [] };
    }
  }, [inputs]);

  const setField = (field: Exclude<keyof LoanFormValues, 'loanTermUnit'>, value: string) => setInputs(current => ({ ...current, [field]: value }));
  const setTermUnit = (unit: LoanTermUnit) => setInputs(current => ({
    ...current,
    loanTerm: convertLoanTerm(current.loanTerm, current.loanTermUnit, unit),
    loanTermUnit: unit,
  }));
  const termPresets = TERM_PRESETS.map(years => ({
    value: convertLoanTerm(String(years), 'years', inputs.loanTermUnit),
    label: `${convertLoanTerm(String(years), 'years', inputs.loanTermUnit)} ${inputs.loanTermUnit === 'years' ? 'yr' : 'mo'}`,
  }));
  const validation = { ...result.validation };
  if (validation.loanTermYears && (!Number.isFinite(result.normalized.loanTermYears) || result.normalized.loanTermYears <= 0 || result.normalized.loanTermYears > MAX_TERM_YEARS)) {
    validation.loanTermYears = `Loan term must be greater than 0 and no more than ${convertLoanTerm(String(MAX_TERM_YEARS), 'years', inputs.loanTermUnit)} ${inputs.loanTermUnit}.`;
  }
  return { inputs, setField, setTermUnit, termPresets, termLabel: `${inputs.loanTerm} ${inputs.loanTermUnit}`, ...result, validation, reset: () => setInputs(toLoanFormValues(initial)) };
}
