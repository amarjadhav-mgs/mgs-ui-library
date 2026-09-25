import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import * as stories from './DatePicker.stories';

const allStories = composeStories(stories);

describe('DatePicker stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite DatePicker behaviour documented in DatePicker.mdx', () => {
  it('id goes to the input, so <label htmlFor> names it', () => {
    render(
      <>
        <label htmlFor="start">Start date</label>
        <DatePicker id="start" />
      </>,
    );
    expect(screen.getByLabelText('Start date').tagName).toBe('INPUT');
  });

  it('the label prop names the input', () => {
    render(<DatePicker label="Due date" />);
    expect(screen.getByLabelText('Due date').tagName).toBe('INPUT');
  });

  it('shows the format as the placeholder', () => {
    render(<DatePicker label="Date" format="dd/MM/yyyy" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', 'dd/MM/yyyy');
  });

  it('typing a full date calls onChange with a Date', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Date" format="dd/MM/yyyy" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Date'), '24092026');
    const value = onChange.mock.lastCall?.[0];
    expect(value).toBeInstanceOf(Date);
    expect([value.getFullYear(), value.getMonth(), value.getDate()]).toEqual([2026, 8, 24]);
  });

  it('opens a dialog popup (aria-haspopup="dialog")', () => {
    render(<DatePicker label="Date" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
