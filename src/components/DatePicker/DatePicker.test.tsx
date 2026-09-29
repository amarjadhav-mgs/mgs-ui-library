import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, FormField, InputGroup, MgsProvider } from '@mgs/ui';
import { isDayOutside, toDateTimeValue, toDateValue } from '../../internal/dateFormat';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { pressKeys, typeDate } from '../../test/typing';
import * as stories from './DatePicker.stories';

const allStories = composeStories(stories);
const date = new Date(2026, 8, 24, 14, 30);
const ymd = (value: Date) => [value.getFullYear(), value.getMonth() + 1, value.getDate()];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error the format comes from the locale of MgsProvider */}
    <DatePicker aria-label="Date" format="yyyy-MM-dd" />
    {/* @ts-expect-error the value is a Date, not a text */}
    <DatePicker aria-label="Date" value="2026-09-24" />
    {/* @ts-expect-error RSuite's label is hidden; use a <label>, aria-label or FormField */}
    <DatePicker label="Date" />
    {/* @ts-expect-error RSuite's cleanable is hidden; use clearable */}
    <DatePicker aria-label="Date" cleanable />
    {/* @ts-expect-error RSuite's shouldDisableDate is hidden; use minDate, maxDate or isDateDisabled */}
    <DatePicker aria-label="Date" shouldDisableDate={() => false} />
    {/* @ts-expect-error RSuite's ranges is hidden; use presets */}
    <DatePicker aria-label="Date" ranges={[]} />
    {/* @ts-expect-error RSuite's oneTap is hidden: a date alone always closes on a click */}
    <DatePicker aria-label="Date" oneTap />
    {/* @ts-expect-error RSuite's block is hidden: a DatePicker is always full width */}
    <DatePicker aria-label="Date" block />
    {/* @ts-expect-error RSuite's plaintext is hidden; use readOnly */}
    <DatePicker aria-label="Date" plaintext />
    {/* @ts-expect-error RSuite's placement is hidden */}
    <DatePicker aria-label="Date" placement="topStart" />
    {/* @ts-expect-error RSuite's showMeridiem is hidden: 12 or 24 hours come from the locale */}
    <DatePicker aria-label="Date" showMeridiem />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <DatePicker aria-label="Date" size="xs" />
  </>
);

describe('DatePicker stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('DatePicker', () => {
  it('renders a text input of size md, named by its label, showing the format of en-GB', () => {
    const { container } = render(
      <>
        <label htmlFor="due">Due date</label>
        <DatePicker id="due" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Due date' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('placeholder', 'dd/MM/yyyy');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input.closest('.rs-input-group')).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('.mgs-date-picker')).toContainElement(input);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it.each([
    ['en-GB', 'dd/MM/yyyy', 'dd/MM/yyyy HH:mm', '24/09/2026 14:30'],
    ['en-IN', 'dd/MM/yyyy', 'dd/MM/yyyy HH:mm', '24/09/2026 14:30'],
    ['en-US', 'MM/dd/yyyy', 'MM/dd/yyyy hh:mm aa', '09/24/2026 02:30 PM'],
  ] as const)('%s: the format comes from the locale', (locale, dateOnly, withTime, shown) => {
    render(
      <MgsProvider locale={locale}>
        <DatePicker aria-label="Date" />
        <DatePicker aria-label="Date and time" withTime />
        <DatePicker aria-label="Filled" withTime defaultValue={date} />
      </MgsProvider>,
    );
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', dateOnly);
    expect(screen.getByLabelText('Date and time')).toHaveAttribute('placeholder', withTime);
    expect(screen.getByLabelText('Filled')).toHaveValue(shown);
  });

  it('typing calls onChange once, with the whole date first: not for the steps on the way', async () => {
    const onChange = vi.fn();
    render(<DatePicker aria-label="Date" onChange={onChange} />);
    const input = screen.getByLabelText('Date');
    // RSuite alone reports the years 2, 20 and 202 on the way to 2026, each of them twice.
    await typeDate(input, '24092026');
    expect(input).toHaveValue('24/09/2026');
    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, event] = onChange.mock.lastCall as [Date, unknown];
    expect(ymd(value)).toEqual([2026, 9, 24]);
    expect(event).toBeDefined();
  });

  it('half a date calls nothing', async () => {
    const onChange = vi.fn();
    render(<DatePicker aria-label="Date" onChange={onChange} />);
    await typeDate(screen.getByLabelText('Date'), '2409');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('after Tab, typing starts at the first part of the date, not at the year', async () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    render(<DatePicker aria-label="Date" onChange={onChange} onKeyDown={onKeyDown} />);
    const input = screen.getByLabelText<HTMLInputElement>('Date');
    await userEvent.tab();
    expect(input).toHaveFocus();
    // RSuite alone would put the first digit into the year: 04/09/2026.
    await waitFor(() => expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await pressKeys(input, '24092026');
    expect(input).toHaveValue('24/09/2026');
    // The app's own key handler still gets the keys.
    expect(onKeyDown).toHaveBeenCalled();
    expect(ymd(onChange.mock.lastCall?.[0] as Date)).toEqual([2026, 9, 24]);
  });

  it('a click on a day of the calendar chooses it and closes the calendar', async () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DatePicker
        aria-label="Date"
        defaultValue={date}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );
    await userEvent.click(screen.getByLabelText('Date'));
    const calendar = await screen.findByRole('dialog');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(within(calendar).getByRole('gridcell', { name: /25 Sep 2026/ }));
    expect(ymd(onChange.mock.lastCall?.[0] as Date)).toEqual([2026, 9, 25]);
    expect(screen.getByLabelText('Date')).toHaveValue('25/09/2026');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('value: stays what the app sets, and null empties the field', async () => {
    const { rerender } = render(<DatePicker aria-label="Date" value={date} onChange={() => {}} />);
    expect(screen.getByLabelText('Date')).toHaveValue('24/09/2026');
    rerender(<DatePicker aria-label="Date" value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('Date')).toHaveValue('');
  });

  it('minDate and maxDate disable the days outside them, and keep the days themselves', async () => {
    render(
      <DatePicker
        aria-label="Date"
        defaultValue={date}
        minDate={new Date(2026, 8, 20, 18)}
        maxDate={new Date(2026, 8, 26, 6)}
      />,
    );
    await userEvent.click(screen.getByLabelText('Date'));
    const calendar = await screen.findByRole('dialog');
    const cell = (name: RegExp) => within(calendar).getByRole('gridcell', { name });
    expect(cell(/19 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(/20 Sep 2026/)).not.toHaveAttribute('aria-disabled', 'true');
    expect(cell(/26 Sep 2026/)).not.toHaveAttribute('aria-disabled', 'true');
    expect(cell(/27 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
  });

  it('a typed day outside minDate is not given to the app, and the field says it is invalid', async () => {
    const onChange = vi.fn();
    render(<DatePicker aria-label="Date" minDate={new Date(2026, 8, 20)} onChange={onChange} />);
    const input = screen.getByLabelText('Date');
    await typeDate(input, '01012020');
    expect(input).toHaveValue('01/01/2020');
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('isDateDisabled disables days by a rule, together with minDate', async () => {
    render(
      <DatePicker
        aria-label="Date"
        defaultValue={date}
        minDate={new Date(2026, 8, 22)}
        isDateDisabled={(day) => day.getDay() === 0 || day.getDay() === 6}
      />,
    );
    await userEvent.click(screen.getByLabelText('Date'));
    const calendar = await screen.findByRole('dialog');
    const cell = (name: RegExp) => within(calendar).getByRole('gridcell', { name });
    // Monday 21 is before minDate; Saturday 26 is a weekend; Friday 25 is fine.
    expect(cell(/21 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(/26 Sep 2026/)).toHaveAttribute('aria-disabled', 'true');
    expect(cell(/25 Sep 2026/)).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('presets are shortcuts in the calendar; one outside minDate is left out; without presets there are none', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DatePicker
        aria-label="Date"
        defaultValue={date}
        onChange={onChange}
        minDate={new Date(2026, 8, 24)}
        presets={[
          { label: 'Start of the project', value: new Date(2026, 8, 28) },
          { label: 'Last month', value: new Date(2026, 7, 24) },
        ]}
      />,
    );
    await userEvent.click(screen.getByLabelText('Date'));
    const calendar = await screen.findByRole('dialog');
    expect(within(calendar).queryByRole('button', { name: 'Last month' })).not.toBeInTheDocument();
    await userEvent.click(within(calendar).getByRole('button', { name: 'Start of the project' }));
    expect(ymd(onChange.mock.lastCall?.[0] as Date)).toEqual([2026, 9, 28]);

    rerender(<DatePicker aria-label="Date" defaultValue={date} open />);
    const plain = await screen.findByRole('dialog');
    expect(
      within(plain).queryByRole('button', { name: /today|yesterday/i }),
    ).not.toBeInTheDocument();
  });

  it('withTime keeps the calendar open after a day is chosen, until OK', async () => {
    const onChange = vi.fn();
    render(<DatePicker aria-label="Date" withTime defaultValue={date} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Date'));
    const calendar = await screen.findByRole('dialog');
    await userEvent.click(within(calendar).getByRole('gridcell', { name: /25 Sep 2026/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(within(calendar).getByRole('button', { name: 'OK' }));
    const value = onChange.mock.lastCall?.[0] as Date;
    expect(ymd(value)).toEqual([2026, 9, 25]);
    expect([value.getHours(), value.getMinutes()]).toEqual([14, 30]);
  });

  it('clearable: a button empties the field, and onChange gets null', async () => {
    const onChange = vi.fn();
    render(<DatePicker aria-label="Date" defaultValue={date} onChange={onChange} clearable />);
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null, expect.anything());
    expect(screen.getByLabelText('Date')).toHaveValue('');
  });

  it('disabled: not focusable and does not open; also inside a disabled InputGroup', async () => {
    const { rerender } = render(<DatePicker aria-label="Date" disabled defaultValue={date} />);
    const input = screen.getByLabelText('Date');
    expect(input).toBeDisabled();
    await userEvent.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <InputGroup disabled>
        <DatePicker aria-label="Date" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Date')).toBeDisabled();
  });

  it('readOnly: focusable, marked read-only, not editable, and does not open', async () => {
    render(<DatePicker aria-label="Date" readOnly defaultValue={date} />);
    const input = screen.getByLabelText('Date');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await userEvent.keyboard('11');
    await userEvent.click(input);
    expect(input).toHaveValue('24/09/2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a form submits the date in a fixed format, in the local time zone, and empty when there is none', async () => {
    render(
      <form data-testid="form">
        <DatePicker aria-label="Start" name="start" defaultValue={new Date(2026, 8, 24)} />
        <DatePicker aria-label="Follow-up" name="followUp" withTime defaultValue={date} />
        <DatePicker aria-label="End" name="end" />
        <DatePicker aria-label="Closed" name="closed" disabled defaultValue={date} />
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect([...new FormData(form).entries()]).toEqual([
      ['start', '2026-09-24'],
      ['followUp', '2026-09-24T14:30'],
      ['end', ''],
    ]);
  });

  it('a form submits what the user typed into an uncontrolled field', async () => {
    render(
      <form data-testid="form">
        <DatePicker aria-label="End" name="end" />
      </form>,
    );
    await typeDate(screen.getByLabelText('End'), '01102026');
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(new FormData(form).get('end')).toBe('2026-10-01');
  });

  it('required is said to screen readers; FormField wires the label, the error and required', () => {
    render(
      <FormField label="Due date" error="Enter the due date" required>
        <DatePicker />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: /Due date/ });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter the due date');
  });

  it('className and style go to the root; id, aria-* and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    const { container } = render(
      <DatePicker
        ref={ref}
        id="due"
        aria-label="Due date"
        aria-describedby="due-help"
        onBlur={onBlur}
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const input = screen.getByLabelText('Due date');
    const root = container.querySelector('.mgs-date-picker');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'due');
    expect(input).toHaveAttribute('aria-describedby', 'due-help');
    input.focus();
    input.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  describe('date helpers', () => {
    it('form values use the local day, not the UTC day', () => {
      // Local midnight is the day before in UTC for every time zone ahead of it.
      const midnight = new Date(2026, 8, 24, 0, 0);
      expect(toDateValue(midnight)).toBe('2026-09-24');
      expect(toDateTimeValue(new Date(2026, 0, 5, 9, 5))).toBe('2026-01-05T09:05');
    });

    it('min and max count whole days, whatever their time', () => {
      const min = new Date(2026, 8, 20, 23, 59);
      const max = new Date(2026, 8, 26, 0, 0);
      expect(isDayOutside(new Date(2026, 8, 20, 0, 0), min, max)).toBe(false);
      expect(isDayOutside(new Date(2026, 8, 26, 23, 59), min, max)).toBe(false);
      expect(isDayOutside(new Date(2026, 8, 19, 23, 59), min, max)).toBe(true);
      expect(isDayOutside(new Date(2026, 8, 27, 0, 0), min, max)).toBe(true);
      expect(isDayOutside(new Date(2026, 8, 27))).toBe(false);
    });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
