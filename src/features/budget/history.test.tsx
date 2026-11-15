import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BudgetOverview } from './index';
import type { Budget } from './hooks/useBudget';

const active: Budget = { _id: 'active', name: 'Extended synthetic', status: 'active', coverageVersion: 1, timezone: 'UTC', startDate: '2024-11-01T00:00:00Z', plannedEndDate: '2024-11-30T00:00:00Z', periodType: 'custom', items: [], createdAt: '', updatedAt: '' };
const state = vi.hoisted(() => ({ budgets: [] as Budget[], activeBudget: undefined as Budget | undefined, createBudget: vi.fn(), updateBudget: vi.fn(), fetchBudgets: vi.fn() }));
vi.mock('./hooks/useGlobalBudget', () => ({ useGlobalBudget: () => state }));
vi.mock('./hooks/useBudgetOverview', () => ({ useBudgetOverview: () => ({ activeBudget: state.activeBudget, isLoading: false, hasLoaded: true, tableData: [], totalAllocated: 0, totalSpent: 0, comparison: null }) }));
vi.mock('./components/BudgetSummaryCard', () => ({ BudgetSummaryCard: () => null }));
vi.mock('./components/CategoryTable', () => ({ CategoryTable: () => null }));
beforeEach(() => { state.activeBudget = active; state.budgets = [active]; vi.clearAllMocks(); });
afterEach(cleanup);

it('connects the header History action to the empty disclosure and moves focus without a mutation', async () => {
  render(<BudgetOverview />);
  const button = screen.getByRole('button', { name: 'History' });
  const details = document.getElementById(button.getAttribute('aria-controls')!) as HTMLDetailsElement;
  const summary = details.querySelector('summary')!;
  const scroll = vi.fn();
  details.scrollIntoView = scroll;
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(details.open).toBe(false);
  fireEvent.click(button);
  expect(details.open).toBe(true);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(summary);
  expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
  expect(screen.getByText('No closed budgets or drafts yet.')).toBeTruthy();
  fireEvent.click(summary);
  await waitFor(() => expect(button.getAttribute('aria-expanded')).toBe('false'));
  fireEvent.click(button);
  expect(details.open).toBe(true);
  expect(state.updateBudget).not.toHaveBeenCalled();
  expect(state.createBudget).not.toHaveBeenCalled();
});

it('reveals closed and draft summaries while keeping activation unavailable with an active budget', () => {
  state.budgets = [active, { ...active, _id: 'closed', name: 'Closed synthetic', status: 'closed', actualCutoffDate: '2024-12-01T00:00:00Z', closedAt: '2024-12-05T12:00:00Z' }, { ...active, _id: 'draft', name: 'Draft synthetic', status: 'draft' }];
  render(<BudgetOverview />);
  fireEvent.click(screen.getByRole('button', { name: 'History' }));
  expect(screen.getByRole('heading', { name: 'Closed synthetic' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Draft synthetic' })).toBeTruthy();
  expect(screen.getByText('Read-only coverage summary.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Activate/ })).toBeNull();
  expect(screen.queryByRole('button', { name: /Create active/ })).toBeNull();
  expect(state.updateBudget).not.toHaveBeenCalled();
});
