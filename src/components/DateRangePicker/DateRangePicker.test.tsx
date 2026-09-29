import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type DateRange, DateRangePicker, dateRangePresets, FormField, MgsProvider } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { pressKeys, typeDate } from '../../test/typing';
import * as stories from './DateRangePicker.stories';

const allStories = composeStories(stories);
const range: DateRange = [new Date(2026, 8, 18), new Date(2026, 8, 24)];
const ymd = (value: Date) => [value.getFullYear(), value.getMonth() + 1, value.getDate()];
const hms = (value: Date) => [
  value.getHours(),
  value.getMinutes(),
  value.getSeconds(),
  value.getMilliseconds(),
];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error the format comes from the locale of MgsProvider */}
    <DateRangePicker aria-label="Period" format="yyyy-MM-dd" />
    {/* @ts-expect-error the value is two Dates, not one */}
    <DateRangePicker aria-label="Period" value={new Date()} />
    {/* @ts-expect-error RSuite's label is hidden; use a <label>, aria-label or FormField */}
    <DateRangePicker label="Period" />
    {/* @ts-expect-error RSuite's cleanable is hidden; use clearable */}
    <DateRangePicker aria-label="Period" cleanable />
    {/* @ts-expect-error RSuite's shouldDisableDate is hidden; use minDate, maxDate or isDateDisabled */}
    <DateRangePicker aria-label="Period" shouldDisableDate={() => false} />
    {/* @ts-expect-error RSuite's ranges is hidden; use presets */}
    <DateRangePicker aria-label="Period" ranges={[]} />
    {/* @ts-expect-error RSuite's character is hidden: the separator is the same everywhere */}
    <DateRangePicker aria-label="Period" character=" to " />
    {/* @ts-expect-error RSuite's showOneCalendar is hidden: the width of the screen decides */}
    <DateRangePicker aria-label="Period" showOneCalendar />
    {/* @ts-expect-error RSuite's block is hidden: a DateRangePicker is always full width */}
    <DateRangePicker aria-label="Period" block />
    {/* @ts-expect-error RSuite's placement is hidden */}
    <DateRangePicker aria-label="Period" placement="topStart" />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <DateRangePicker aria-label="Period" size="xs" />
  </>
);

describe('DateRangePicker stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('DateRangePicker', () => {
  it('renders a text input of size md, named by its label, showing the format of en-GB', () => {
    const { container } = render(
      <>
        <label htmlFor="period">Period</label>
        <DateRangePicker id="period" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Period' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('placeholder', 'dd/MM/yyyy – dd/MM/yyyy');
    expect(input.closest('.rs-input-group')).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('.mgs-date-range-picker')).toContainElement(input);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it.each([
    ['en-GB', '18/09/2026 – 24/09/2026'],
    ['en-IN', '18/09/2026 – 24/09/2026'],
    ['en-US', '09/18/2026 – 09/24/2026'],
  ] as const)('%s: the format comes from the locale', (locale, shown) => {
    render(
      <MgsProvider locale={locale}>
        <DateRangePicker aria-label="Period" defaultValue={range} />
      </MgsProvider>,
    );
    expect(screen.getByLabelText('Period')).toHaveValue(shown);
  });

  it('typing calls onChange once, with the whole range: from the start of the first day to the end of the last', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="Period" onChange={onChange} />);
    const input = screen.getByLabelText('Period');
    await typeDate(input, '0109202630092026');
    expect(input).toHaveValue('01/09/2026 – 30/09/2026');
    expect(onChange).toHaveBeenCalledTimes(1);
    const [[start, end], event] = onChange.mock.lastCall as [DateRange, unknown];
    expect([ymd(start), hms(start)]).toEqual([
      [2026, 9, 1],
      [0, 0, 0, 0],
    ]);
    expect([ymd(end), hms(end)]).toEqual([
      [2026, 9, 30],
      [23, 59, 59, 999],
    ]);
    expect(event).toBeDefined();
  });

  it('half a range calls nothing', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="Period" onChange={onChange} />);
    await typeDate(screen.getByLabelText('Period'), '01092026');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('an end before the start calls nothing', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="Period" onChange={onChange} />);
    await typeDate(screen.getByLabelText('Period'), '3009202601092026');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('after Tab, typing starts at the first part of the range', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="Period" onChange={onChange} />);
    const input = screen.getByLabelText<HTMLInputElement>('Period');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await waitFor(() => expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]));
    await pressKeys(input, '0109202630092026');
    expect(input).toHaveValue('01/09/2026 – 30/09/2026');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('two clicks in the calendar choose a range; OK gives it to the app', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker aria-label="Period" defaultValue={range} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Period'));
    const calendar = await screen.findByRole('dialog');
    const cell = (name: RegExp) => within(calendar).getAllByRole('gridcell', { name })[0];
    await userEvent.click(cell(/07 Sep 2026/));
    await userEvent.click(cell(/11 Sep 2026/));
    await userEvent.click(within(calendar).getByRole('button', { name: 'OK' }));
    const [[start, end]] = onChange.mock.lastCall as [DateRange];
    expect([ymd(start), ymd(end)]).toEqual([
      [2026, 9, 7],
      [2026, 9, 11],
    ]);
    expect(hms(end)).toEqual([23, 59, 59, 999]);
    expect(screen.getByLabelText('Period')).toHaveValue('07/09/2026 – 11/09/2026');
  });

  it('value: stays what the app sets, and null empties the field', () => {
    const { rerender } = render(
      <DateRangePicker aria-label="Period" value={range} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Period')).toHaveValue('18/09/2026 – 24/09/2026');
    rerender(<DateRangePicker aria-label="Period" value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('Period')).toHaveValue('');
  });

  it('minDate, maxDate and isDateDisabled disable days, and a typed range outside them is not given to the app', async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Period"
        defaultValue={range}
        onChange={onChange}
        minDate={new Date(2026, 8, 14, 18)}
        maxDate={new Date(2026, 8, 25, 6)}
        isDateDisabled={(date) => date.getDay() === 0}
      />,
    );
    const input = screen.getByLabelText('Period');
    await userEvent.click(input);
    const calendar = await screen.findByRole('dialog');
    const cell = (name: RegExp) => within(calendar).getAllByRole('gridcell', { name })[0];
    expect(cell(/13 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(/14 Sep 2026/)).not.toHaveAttribute('aria-disabled', 'true');
    expect(cell(/20 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(/25 Sep 2026/)).not.toHaveAttribute('aria-disabled', 'true');
    expect(cell(/26 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    await pressKeys(input, '0109202624092026');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('presets are shortcuts; one outside maxDate is left out; without presets there are none', async () => {
    const onChange = vi.fn();
    const today = new Date(2026, 8, 24, 10, 30);
    const { rerender } = render(
      <DateRangePicker
        aria-label="Period"
        onChange={onChange}
        maxDate={today}
        presets={dateRangePresets(today)}
      />,
    );
    await userEvent.click(screen.getByLabelText('Period'));
    const calendar = await screen.findByRole('dialog');
    const names = within(calendar)
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(names).toEqual(
      expect.arrayContaining(['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last month']),
    );
    // This month ends on 30 September, after maxDate.
    expect(names).not.toContain('This month');
    await userEvent.click(within(calendar).getByRole('button', { name: 'Last 7 days' }));
    const [[start, end]] = onChange.mock.lastCall as [DateRange];
    expect([ymd(start), ymd(end)]).toEqual([
      [2026, 9, 18],
      [2026, 9, 24],
    ]);

    rerender(<DateRangePicker aria-label="Period" open />);
    const plain = await screen.findByRole('dialog');
    expect(
      within(plain).queryByRole('button', { name: /today|yesterday|last/i }),
    ).not.toBeInTheDocument();
  });

  it('dateRangePresets counts from the day it is given, over the ends of months and years', () => {
    const presets = dateRangePresets(new Date(2026, 0, 3, 15, 0));
    const days = Object.fromEntries(
      presets.map(({ label, value }) => [label, [ymd(value[0]), ymd(value[1])]]),
    );
    expect(days).toEqual({
      Today: [
        [2026, 1, 3],
        [2026, 1, 3],
      ],
      Yesterday: [
        [2026, 1, 2],
        [2026, 1, 2],
      ],
      'Last 7 days': [
        [2025, 12, 28],
        [2026, 1, 3],
      ],
      'Last 30 days': [
        [2025, 12, 5],
        [2026, 1, 3],
      ],
      'This month': [
        [2026, 1, 1],
        [2026, 1, 31],
      ],
      'Last month': [
        [2025, 12, 1],
        [2025, 12, 31],
      ],
    });
    expect(hms(presets[0].value[0])).toEqual([0, 0, 0, 0]);
    expect(hms(presets[0].value[1])).toEqual([23, 59, 59, 999]);
  });

  it('clearable: a button empties the field, and onChange gets null', async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker aria-label="Period" defaultValue={range} onChange={onChange} clearable />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null, expect.anything());
    expect(screen.getByLabelText('Period')).toHaveValue('');
  });

  it('disabled: not focusable and does not open', async () => {
    render(<DateRangePicker aria-label="Period" disabled defaultValue={range} />);
    const input = screen.getByLabelText('Period');
    expect(input).toBeDisabled();
    await userEvent.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('readOnly: focusable, marked read-only, and does not open', async () => {
    render(<DateRangePicker aria-label="Period" readOnly defaultValue={range} />);
    const input = screen.getByLabelText('Period');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await userEvent.click(input);
    expect(input).toHaveValue('18/09/2026 – 24/09/2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a form submits the range in a fixed format, and empty when there is none', () => {
    render(
      <form data-testid="form">
        <DateRangePicker aria-label="Period" name="period" defaultValue={range} />
        <DateRangePicker aria-label="Leave" name="leave" />
        <DateRangePicker aria-label="Closed" name="closed" disabled defaultValue={range} />
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect([...new FormData(form).entries()]).toEqual([
      ['period', '2026-09-18/2026-09-24'],
      ['leave', ''],
    ]);
  });

  it('required is said to screen readers; FormField wires the label, the error and required', () => {
    render(
      <FormField label="Period" error="Choose the period" required>
        <DateRangePicker />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: /Period/ });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Choose the period');
  });

  it('className and style go to the root; id, aria-* and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <DateRangePicker
        ref={ref}
        id="period"
        aria-label="Period"
        aria-describedby="period-help"
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const input = screen.getByLabelText('Period');
    const root = container.querySelector('.mgs-date-range-picker');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'period');
    expect(input).toHaveAttribute('aria-describedby', 'period-help');
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
