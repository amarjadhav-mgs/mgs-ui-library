import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { compiledRules } from '../../test/compiledStyle';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Calendar.stories';

const allStories = composeStories(stories);
const date = new Date(2026, 8, 24);
const ymd = (value: Date) => [value.getFullYear(), value.getMonth() + 1, value.getDate()];
const cell = (name: RegExp) => screen.getByRole('gridcell', { name });

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's bordered is hidden: a Calendar always has its border */}
    <Calendar aria-label="Calendar" bordered />
    {/* @ts-expect-error RSuite's renderCell is hidden; use renderDay */}
    <Calendar aria-label="Calendar" renderCell={() => null} />
    {/* @ts-expect-error RSuite's cellClassName is hidden */}
    <Calendar aria-label="Calendar" cellClassName={() => 'busy'} />
    {/* @ts-expect-error RSuite's isoWeek is hidden: the locale sets the first day of the week */}
    <Calendar aria-label="Calendar" isoWeek />
    {/* @ts-expect-error RSuite's onSelect is hidden; use onChange */}
    <Calendar aria-label="Calendar" onSelect={() => {}} />
    {/* @ts-expect-error the value is a Date, not a text */}
    <Calendar aria-label="Calendar" value="2026-09-24" />
  </>
);

describe('Calendar stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Calendar', () => {
  it('shows the month of its value, with a border, and marks the chosen day', () => {
    const { container } = render(<Calendar aria-label="Team calendar" defaultValue={date} />);
    const root = container.querySelector('.mgs-calendar');
    expect(root).toHaveAttribute('aria-label', 'Team calendar');
    expect(root).toHaveClass('rs-calendar-bordered');
    expect(root).not.toHaveClass('rs-calendar-compact');
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(cell(/24 Sep 2026/)).toHaveClass('mgs-calendar__chosen');
    expect(cell(/24 Sep 2026/)).toHaveAttribute('aria-selected', 'true');
  });

  it('without a value, shows the month of today and no day is chosen', () => {
    const { container } = render(<Calendar aria-label="Calendar" />);
    const today = new Date();
    expect(container.querySelector('.rs-calendar-table-cell-is-today')).toHaveTextContent(
      String(today.getDate()),
    );
    expect(container.querySelector('.mgs-calendar__chosen')).not.toBeInTheDocument();
  });

  it('a click on a day calls onChange with the day and marks it', async () => {
    const onChange = vi.fn();
    render(<Calendar aria-label="Calendar" defaultValue={date} onChange={onChange} />);
    await userEvent.click(cell(/10 Sep 2026/));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(ymd(onChange.mock.lastCall?.[0] as Date)).toEqual([2026, 9, 10]);
    expect(cell(/10 Sep 2026/)).toHaveClass('mgs-calendar__chosen');
    expect(cell(/24 Sep 2026/)).not.toHaveClass('mgs-calendar__chosen');
  });

  it('moving to another month calls onMonthChange with its first day, not onChange, and chooses no day', async () => {
    const onChange = vi.fn();
    const onMonthChange = vi.fn();
    const { container } = render(
      <Calendar
        aria-label="Calendar"
        defaultValue={date}
        onChange={onChange}
        onMonthChange={onMonthChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(cell(/24 Oct 2026/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(ymd(onMonthChange.mock.lastCall?.[0] as Date)).toEqual([2026, 10, 1]);
    // RSuite is now on 24 October; the chosen day is still 24 September.
    expect(container.querySelector('.mgs-calendar__chosen')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(cell(/24 Sep 2026/)).toHaveClass('mgs-calendar__chosen');
  });

  it('only the chosen day keeps the outline of a selected day', () => {
    const rule = compiledRules('src/styles/rsuite-bridge.scss').find(({ selector }) =>
      selector.includes(
        '.mgs-calendar .rs-calendar-table-cell-selected:not(.mgs-calendar__chosen)',
      ),
    );
    expect(rule?.declarations).toContain('--rs-input-focus-border: transparent');
  });

  it('value: stays what the app sets, shows its month, and null chooses no day', () => {
    const { container, rerender } = render(
      <Calendar aria-label="Calendar" value={date} onChange={() => {}} />,
    );
    expect(cell(/24 Sep 2026/)).toHaveClass('mgs-calendar__chosen');
    rerender(<Calendar aria-label="Calendar" value={new Date(2026, 11, 5)} onChange={() => {}} />);
    expect(cell(/05 Dec 2026/)).toHaveClass('mgs-calendar__chosen');
    rerender(<Calendar aria-label="Calendar" value={null} onChange={() => {}} />);
    expect(container.querySelector('.mgs-calendar__chosen')).not.toBeInTheDocument();
  });

  it('a controlled calendar does not change its chosen day by itself', async () => {
    render(<Calendar aria-label="Calendar" value={date} />);
    await userEvent.click(cell(/10 Sep 2026/));
    expect(cell(/24 Sep 2026/)).toHaveClass('mgs-calendar__chosen');
    expect(cell(/10 Sep 2026/)).not.toHaveClass('mgs-calendar__chosen');
  });

  it('renderDay puts content into the days; compact makes the days smaller', () => {
    const { container } = render(
      <Calendar
        aria-label="Calendar"
        defaultValue={date}
        compact
        renderDay={(day) => (day.getDate() === 24 ? <span>Invoices due</span> : null)}
      />,
    );
    expect(cell(/24 Sep 2026/)).toHaveTextContent('Invoices due');
    expect(cell(/23 Sep 2026/)).not.toHaveTextContent('Invoices due');
    expect(container.querySelector('.mgs-calendar')).toHaveClass('rs-calendar-compact');
  });

  it('className, style, native attributes and ref go to the root', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Calendar
        ref={ref}
        id="team"
        aria-label="Calendar"
        data-section="planning"
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const root = container.querySelector('.mgs-calendar');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('id', 'team');
    expect(root).toHaveAttribute('data-section', 'planning');
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
