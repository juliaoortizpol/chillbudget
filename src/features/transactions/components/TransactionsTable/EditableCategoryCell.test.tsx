import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { TransactionCategory } from '../../data/mock-transactions';
import { EditableCategoryCell } from './index';

it('clears a saved category that is no longer eligible', () => {
  const historical: TransactionCategory = {
    id: 'historical',
    name: 'Historical category',
    icon: null,
    iconBgClass: '',
    iconColor: '',
  };
  const onSave = vi.fn<(category: TransactionCategory) => void>();
  const { rerender } = render(
    <EditableCategoryCell initialValue={historical} categories={{}} onSave={onSave} />,
  );

  fireEvent.click(screen.getByText('Historical category'));
  const editor = screen.getByRole<HTMLSelectElement>('combobox', { name: 'Assign category' });
  expect(editor.value).toBe(historical.id);
  expect(editor.selectedOptions[0].disabled).toBe(true);
  fireEvent.change(editor, { target: { value: '' } });

  expect(onSave).toHaveBeenCalledOnce();
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: '' }));
  expect(screen.getByText('Historical category')).toBeTruthy();

  const saved = { ...historical, id: '', name: 'Uncategorized' };
  rerender(<EditableCategoryCell initialValue={saved} categories={{}} onSave={onSave} />);
  expect(screen.getByText('Uncategorized')).toBeTruthy();
});
