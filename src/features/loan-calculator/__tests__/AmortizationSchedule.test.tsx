import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AmortizationSchedule } from '../components/AmortizationSchedule';
import { AmortizationRow } from '../components/AmortizationRow';
import { DEFAULT_LOAN_INPUT } from '../constants/loanCalculator.constants';
import { calculateLoanScenario } from '../utils/loanCalculator';

afterEach(cleanup);
const baseline = calculateLoanScenario(DEFAULT_LOAN_INPUT);
const accelerated = calculateLoanScenario({ ...DEFAULT_LOAN_INPUT, extraPayment: 5000 });

describe('amortization schedule interactions', () => {
  it('expands, filters by year and switches scenarios', () => {
    render(<AmortizationSchedule baseline={baseline} accelerated={accelerated} />);
    expect(screen.getByText(`Showing 8 of ${accelerated.actualNumberOfPayments} payments`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View full schedule' }));
    expect(screen.getByText(`Showing ${accelerated.actualNumberOfPayments} of ${accelerated.actualNumberOfPayments} payments`)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    expect(screen.getByText('Showing 7 of 7 payments')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: 'all' } });
    fireEvent.click(screen.getByRole('button', { name: 'Current plan' }));
    expect(screen.getByText('Showing 8 of 72 payments')).toBeTruthy();
  });

  it('renders a mobile disclosure with all payment details instead of a spreadsheet row', () => {
    const { container } = render(<AmortizationRow row={accelerated.schedule[0]} mobile />);
    const disclosure = container.querySelector('details');
    expect(disclosure).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(screen.getByText('Recurring charges')).toBeTruthy();
    expect(screen.getByText('Cumulative interest')).toBeTruthy();
    expect(screen.getByText('Principal (including extra)')).toBeTruthy();
  });
});
