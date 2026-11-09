import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ExpenseAssignment } from './ExpenseAssignment';

afterEach(cleanup);

const item = { id: 'food', name: 'Food', icon: null, iconBgClass: '', iconColor: '' };
function setup(onSave = vi.fn()) {
  const cancel = vi.fn();
  render(<ExpenseAssignment initialValue={item} categories={{ food: item, other: { ...item, id: 'other', name: 'Other', matchingRules: [{ id: 'rule', keyword: 'Synthetic Shop', source: 'user' }] } }} merchant="Synthetic Shop" onSave={onSave} onCancel={cancel} />);
  return { onSave, cancel };
}

it('defaults to opt-out and sends only assignment', async () => {
  const { onSave } = setup();
  expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
  expect(screen.getByText('Selected item: Food')).toBeTruthy();
  fireEvent.click(screen.getByText('Save assignment'));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(item, undefined));
});

it('sends edited raw keyword with consent and explains overlaps', async () => {
  const { onSave } = setup();
  fireEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByText(/Possible overlap with: Other/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Merchant keyword'), { target: { value: 'Synthetic' } });
  fireEvent.click(screen.getByText('Save assignment'));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(item, { rememberMerchant: true, merchantKeyword: 'Synthetic' }));
});

it('rejects normalization-empty and overlength keywords only when remembering', () => {
  const { onSave } = setup();
  fireEvent.click(screen.getByRole('checkbox'));
  for (const value of ['!!!', 'a'.repeat(257), 'support.example.com']) {
    fireEvent.change(screen.getByLabelText('Merchant keyword'), { target: { value } });
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save assignment' }).disabled).toBe(true);
  }
  expect(onSave).not.toHaveBeenCalled();
});

it('retains inputs after failure, blocks duplicate submission, and permits explicit opt-out retry', async () => {
  let reject!: (error: Error) => void;
  const onSave = vi.fn().mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; })).mockResolvedValue(undefined);
  setup(onSave);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByText('Save assignment'));
  fireEvent.submit(screen.getByText('Saving assignment…').closest('form')!);
  expect(onSave).toHaveBeenCalledTimes(1);
  reject(new Error('Service unavailable'));
  await screen.findByRole('alert');
  expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>('Merchant keyword').value).toBe('Synthetic Shop');
  expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('food');
  expect(onSave).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByText('Retry save'));
  await waitFor(() => expect(onSave).toHaveBeenLastCalledWith(item, undefined));
});

it('clears assignment without sending consent even after opting in', async () => {
  const { onSave } = setup();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Save assignment'));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: '' }), undefined));
});
