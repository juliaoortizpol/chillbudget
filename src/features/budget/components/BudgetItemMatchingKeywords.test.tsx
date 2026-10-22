import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BudgetItemMatchingKeywords, type KeywordProps } from './BudgetItemMatchingKeywords';
import { BudgetItemKeywordsEditor } from './BudgetItemKeywordsEditor';
import { CategoryTable } from './CategoryTable';
import type { BudgetItemMatchingRule } from '../hooks/useBudget';

vi.mock('@/features/transactions/hooks/useTransactions', () => ({ useTransactions: () => ({ fetchTransactions: fetchTransactions, transactionsData: null }) }));
const fetchTransactions = vi.fn().mockResolvedValue({ data: [] });
afterEach(cleanup);
function Harness(props: Partial<KeywordProps>) {
  const [value, onChange] = useState(props.value || []);
  return <BudgetItemMatchingKeywords {...props} value={value} onChange={onChange} />;
}
const rule: BudgetItemMatchingRule = { id: 'saved', keyword: 'Uber', source: 'learned' };
describe('matching keywords', () => {
  it.each(['Enter', 'blur'])('saves item names with %s and displays the refreshed name', async trigger => {
    const update = vi.fn().mockResolvedValue(undefined);
    const item = { id: '1', name: 'Travel', allocated: 250, spent: 0, icon: null, iconBgClass: '', iconColor: '' };
    const props = { onCreateItem: vi.fn(), onUpdateItem: update, onDeleteItem: vi.fn() };
    const { rerender } = render(<CategoryTable {...props} categories={[item]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Travel' }));
    const input = screen.getByRole('textbox', { name: 'Item name' });
    fireEvent.change(input, { target: { value: '  Transportation  ' } });
    if (trigger === 'Enter') fireEvent.keyDown(input, { key: 'Enter' });
    else fireEvent.blur(input);
    await waitFor(() => expect(update).toHaveBeenCalledExactlyOnceWith('1', { name: 'Transportation' }));
    rerender(<CategoryTable {...props} categories={[{ ...item, name: 'Transportation' }]} />);
    expect(await screen.findByRole('button', { name: 'Transportation' })).toBeTruthy();
  });
  it('preserves a failed name edit and displays the API error', async () => {
    const update = vi.fn().mockRejectedValue(new Error('Name update rejected'));
    render(<CategoryTable categories={[{ id: '1', name: 'Travel', allocated: 250, spent: 0, icon: null, iconBgClass: '', iconColor: '' }]} onCreateItem={vi.fn()} onUpdateItem={update} onDeleteItem={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Travel' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Item name' }), { target: { value: 'Transport' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Item name' }), { key: 'Enter' });
    expect((await screen.findByRole('alert')).textContent).toBe('Name update rejected');
    expect((screen.getByRole('textbox', { name: 'Item name' }) as HTMLInputElement).value).toBe('Transport');
  });
  it('adds with Enter and comma, trims, prevents case-insensitive duplicates, and removes', () => {
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: 'Matching keywords' });
    fireEvent.change(input, { target: { value: '  Uber  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: 'DiDi' } });
    fireEvent.keyDown(input, { key: ',' });
    fireEvent.change(input, { target: { value: ' uber, ,inDrive,' } });
    expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Uber' }));
    expect(screen.queryByRole('button', { name: 'Remove Uber' })).toBeNull();
  });
  it('loads saved rules, offers opt-in suggestions and shows overlap warnings', () => {
    render(<Harness value={[rule]} suggestions={['Uber', 'DiDi']} otherItems={[{ name: 'Transportation', matchingRules: [rule] }]} />);
    expect(screen.getByRole('button', { name: 'Remove Uber' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Transportation');
    expect(screen.queryByRole('button', { name: 'Uber' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'DiDi' }));
    expect(screen.getByRole('button', { name: 'Remove DiDi' })).toBeTruthy();
    expect(screen.queryByText('Suggested keywords')).toBeNull();
  });
  it('reopens saved keywords and saves an empty collection', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<BudgetItemKeywordsEditor value={[rule]} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit matching keywords' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Remove Uber' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save keywords' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith([]));
  });
  it('keeps edits and displays backend errors', async () => {
    render(<BudgetItemKeywordsEditor value={[rule]} onSave={vi.fn().mockRejectedValue(new Error('Rejected'))} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit matching keywords' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save keywords' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Rejected');
    expect(screen.getByRole('button', { name: 'Remove Uber' })).toBeTruthy();
  });
  it.each([false, true])('creates an item preserving fields, keywords=%s', async withKeywords => {
    const create = vi.fn().mockResolvedValue(undefined);
    render(<CategoryTable categories={[]} onCreateItem={create} onUpdateItem={vi.fn()} onDeleteItem={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('New Item Name'), { target: { value: 'Travel' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '250' } });
    if (withKeywords) {
      fireEvent.click(screen.getByRole('button', { name: 'Add matching keywords' }));
      fireEvent.change(await screen.findByRole('textbox', { name: 'Matching keywords' }), { target: { value: 'Uber,DiDi,inDrive,' } });
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Matching keywords' }), { key: 'Escape' });
    }
    fireEvent.keyDown(screen.getByPlaceholderText('New Item Name'), { key: 'Enter' });
    await waitFor(() => expect(create).toHaveBeenCalled());
    const [name, amount, icon, rules] = create.mock.calls[0];
    expect([name, amount, icon]).toEqual(['Travel', 250, 'default']);
    expect(rules.map((r: BudgetItemMatchingRule) => r.keyword)).toEqual(withKeywords ? ['Uber', 'DiDi', 'inDrive'] : []);
  });
  it('displays keyword chips and the add/edit label in the existing name column', () => {
    render(<CategoryTable categories={[{ id: '1', name: 'Travel', allocated: 250, spent: 0, icon: null, iconBgClass: '', iconColor: '', matchingRules: [rule, ...['DiDi', 'inDrive', 'Taxi'].map((keyword, i) => ({ id: String(i), keyword, source: 'user' as const }))] }]} onCreateItem={vi.fn()} onUpdateItem={vi.fn()} onDeleteItem={vi.fn()} />);
    expect(screen.getByText('Uber')).toBeTruthy();
    expect(screen.getByText('DiDi')).toBeTruthy();
    expect(screen.getByText('inDrive')).toBeTruthy();
    expect(screen.queryByText('Taxi')).toBeNull();
    expect(screen.getByLabelText('1 more matching keywords').textContent).toBe('+1');
    expect(screen.getByRole('button', { name: 'Edit matching keywords' }).textContent).toBe('Matching keywords - Add / edit');
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  });
});
