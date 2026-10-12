import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RetirementForm } from '../components/RetirementForm';
import { RetirementMilestones } from '../components/RetirementMilestones';
import { RetirementScenarios } from '../components/RetirementScenarios';
import { useRetirementPlanner } from '../hooks/useRetirementPlanner';

afterEach(cleanup);
function Controls() {
  const planner = useRetirementPlanner();
  return <>
    <RetirementForm {...planner} yearsToRetirement={planner.projection?.yearsToRetirement} />
    {planner.projection && planner.scenario && <>
      <RetirementScenarios input={planner.input} projection={planner.projection} scenario={planner.scenario} extra={planner.extraContribution} newContribution={planner.newContribution} difference={planner.difference} onSelect={planner.setExtraContribution} />
      <RetirementMilestones projection={planner.projection} />
    </>}
  </>;
}

describe('retirement planner controls', () => {
  it('keeps advanced assumptions collapsed and updates the retirement horizon', () => {
    const { container } = render(<Controls />);
    expect(container.querySelector('details')?.open).toBe(false);
    fireEvent.change(screen.getByLabelText('Retirement age'), { target: { value: '70' } });
    expect(screen.getByText('43 years to retirement')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Current age'), { target: { value: '80' } });
    expect(screen.getByText('Retirement age must be greater than your current age.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Update projection' }).hasAttribute('disabled')).toBe(true);
  });
  it('selects a savings scenario and expands yearly details without a table', () => {
    const { container } = render(<Controls />);
    const option = screen.getByRole('button', { name: '+ RD$ 2.5K' });
    fireEvent.click(option);
    expect(option.getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText('Age 28')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'View yearly projection' }));
    expect(screen.getByText('Age 28')).toBeTruthy();
    expect(container.querySelector('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show milestones' }));
    expect(screen.queryByText('Age 28')).toBeNull();
  });
});
