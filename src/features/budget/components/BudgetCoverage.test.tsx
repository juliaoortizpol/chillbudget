import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BudgetCoverage, BudgetLifecycle } from './BudgetCoverage';
import type { Budget } from '../hooks/useBudget';

const state = vi.hoisted(() => ({ budgets: [] as Budget[], activeBudget: undefined as Budget | undefined, createBudget: vi.fn(), updateBudget: vi.fn(), fetchBudgets: vi.fn() }));
vi.mock('../hooks/useGlobalBudget', () => ({ useGlobalBudget: () => state }));
beforeEach(() => { state.budgets = []; state.activeBudget = undefined; state.createBudget.mockReset().mockResolvedValue({}); state.updateBudget.mockReset().mockResolvedValue({}); state.fetchBudgets.mockReset().mockResolvedValue([]); });
afterEach(cleanup);
const draft: Budget = { _id: 'draft', name: 'Synthetic November', periodType: 'custom', startDate: '2024-11-01T04:00:00Z', endDate: '2024-11-30T04:00:00Z', timezone: 'America/La_Paz', coverageVersion: 1, status: 'draft', items: [], createdAt: '', updatedAt: '' };

it('distinguishes a November cutoff from December closure confirmation', () => {
  render(<BudgetCoverage budget={{ ...draft, status: 'closed', actualCutoffDate: '2024-12-01T04:00:00Z', closedAt: '2024-12-05T16:00:00Z' }} />);
  expect(screen.getByText(/Actual cutoff \(exclusive\)/).textContent).toContain('2024-12-01T04:00:00.000Z');
  expect(screen.getByText(/Closed at \(confirmation\)/).textContent).toContain('2024-12-05T16:00:00.000Z');
  expect(screen.queryByRole('button')).toBeNull();
});

it('identifies legacy inclusive ends without inventing timezone or closure', () => {
  render(<BudgetCoverage budget={{ ...draft, coverageVersion: undefined, timezone: undefined, status: 'closed' }} />);
  expect(screen.getByText(/Coverage end \(inclusive, legacy\)/).textContent).toContain('saved timezone unavailable');
  expect(screen.getByText(/Closed at \(confirmation\)/).textContent).toContain('Unavailable');
  expect(screen.queryByText(/Planned end \(target/)).toBeNull();
});

it('creates explicitly with a timezone and no manufactured cutoff or plan', async () => {
  render(<BudgetLifecycle />);
  expect(state.createBudget).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Budget name'), { target: { value: 'Synthetic custom' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create active budget' }));
  await waitFor(() => expect(state.createBudget).toHaveBeenCalledTimes(1));
  const payload = state.createBudget.mock.calls[0][0];
  expect(payload).toMatchObject({ name: 'Synthetic custom', status: 'active', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  expect(payload.actualCutoffDate).toBeUndefined();
  expect(payload.plannedEndDate).toBeUndefined();
  expect(payload.startDate).toMatch(/Z$/);
});

it('retains input after create failure and retries only on explicit action', async () => {
  state.createBudget.mockRejectedValueOnce(new Error('Overlap'));
  render(<BudgetLifecycle />);
  fireEvent.change(screen.getByLabelText('Budget name'), { target: { value: 'Keep this name' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create active budget' }));
  await screen.findByRole('alert');
  expect((screen.getByLabelText('Budget name') as HTMLInputElement).value).toBe('Keep this name');
  expect(state.createBudget).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Create active budget' }));
  await waitFor(() => expect(state.createBudget).toHaveBeenCalledTimes(2));
});

it('activates only explicitly, locks duplicate clicks and surfaces migration errors', async () => {
  state.budgets = [draft, { ...draft, _id: 'closed', status: 'closed' }];
  let reject!: (reason: Error) => void;
  state.updateBudget.mockReturnValue(new Promise((_, rejectPromise) => { reject = rejectPromise; }));
  render(<BudgetLifecycle />);
  expect(state.updateBudget).not.toHaveBeenCalled();
  const button = screen.getByRole('button', { name: 'Activate Synthetic November' });
  fireEvent.click(button); fireEvent.click(button);
  expect(state.updateBudget).toHaveBeenCalledTimes(1);
  expect(state.updateBudget).toHaveBeenCalledWith('draft', { status: 'active' });
  reject(new Error('Legacy migration required'));
  expect((await screen.findByRole('alert')).textContent).toContain('Legacy migration required');
  expect(screen.getAllByRole('button', { name: /Activate/ })).toHaveLength(1);
});
