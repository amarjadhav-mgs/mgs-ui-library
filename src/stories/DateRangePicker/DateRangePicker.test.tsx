import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { afterToday, allowedMaxDays, beforeToday, DateRangePicker } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './DateRangePicker.stories';

const allStories = composeStories(stories);

describe('DateRangePicker stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  // Runs each story's play function, as Storybook's Interactions panel does.
  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite DateRangePicker behaviour documented in DateRangePicker.mdx', () => {
  it('<label htmlFor> and the label prop both name the input', () => {
    render(
      <>
        <label htmlFor="travel">Travel dates</label>
        <DateRangePicker id="travel" />
        <DateRangePicker label="Report period" />
      </>,
    );
    expect(screen.getByLabelText('Travel dates').tagName).toBe('INPUT');
    expect(screen.getByLabelText('Report period').tagName).toBe('INPUT');
  });

  it('shows both dates joined by `character`', () => {
    render(
      <DateRangePicker
        label="Dates"
        format="dd/MM/yyyy"
        character=" – "
        value={[new Date(2026, 8, 24), new Date(2026, 8, 30)]}
      />,
    );
    expect(screen.getByLabelText('Dates')).toHaveValue('24/09/2026 – 30/09/2026');
  });

  it('date rules from @mgs/ui work as documented', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86_400_000);
    const tomorrow = new Date(today.getTime() + 86_400_000);
    expect(beforeToday()(yesterday)).toBe(true);
    expect(beforeToday()(tomorrow)).toBe(false);
    expect(afterToday()(tomorrow)).toBe(true);
  });

  it('allowedMaxDays blocks calendar clicks only, not typed ranges (validate on submit)', () => {
    type Target = Parameters<ReturnType<typeof allowedMaxDays>>[3];
    const rule = allowedMaxDays(7);
    const start = new Date(2026, 8, 1);
    const farDate = new Date(2026, 8, 20);
    // While picking in the calendar (start chosen, end not yet): dates beyond 7 days are disabled.
    expect(rule(new Date(2026, 8, 7), [start], false, 'CALENDAR' as Target)).toBe(false);
    expect(rule(farDate, [start], false, 'CALENDAR' as Target)).toBe(true);
    // Limitation: the same date typed into the input is not blocked.
    expect(rule(farDate, [start], false, 'INPUT' as Target)).toBe(false);
  });
});
