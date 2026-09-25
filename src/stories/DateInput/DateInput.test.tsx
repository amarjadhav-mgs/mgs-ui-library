import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateInput } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import * as stories from './DateInput.stories';

const allStories = composeStories(stories);

describe('DateInput stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite DateInput behaviour documented in DateInput.mdx', () => {
  it('shows the format as the placeholder', () => {
    render(<DateInput aria-label="Date" format="dd/MM/yyyy" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', 'dd/MM/yyyy');
  });

  // Typing digit by digit depends on real caret movement between parts, which jsdom doesn't
  // reproduce; it is verified in the browser (Accessibility story). Here: value → formatted text.
  it('shows the value in the given format', () => {
    render(<DateInput aria-label="Date" format="dd/MM/yyyy" value={new Date(2026, 8, 24)} />);
    expect(screen.getByLabelText('Date')).toHaveValue('24/09/2026');
  });

  it('↑ increases the selected part', async () => {
    const onChange = vi.fn();
    render(
      <DateInput
        aria-label="Date"
        format="dd/MM/yyyy"
        defaultValue={new Date(2026, 8, 24)}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText('Date');
    await userEvent.click(input);
    (input as HTMLInputElement).setSelectionRange(0, 2); // the day part
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange.mock.lastCall?.[0].getDate()).toBe(25);
  });

  // Known limitation, documented in DateInput.mdx. If this starts failing, update the docs.
  it('limitation: an incomplete date is reported as an Invalid Date, not null', async () => {
    const onChange = vi.fn();
    render(<DateInput aria-label="Date" format="dd/MM/yyyy" onChange={onChange} />);
    const input = screen.getByLabelText('Date');
    input.focus();
    await userEvent.keyboard('{ArrowRight}'); // select a part
    await userEvent.keyboard('2');
    const value = onChange.mock.lastCall?.[0];
    expect(value).toBeInstanceOf(Date);
    expect(Number.isNaN(value.getTime())).toBe(true);
  });
});
