import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormField, MgsProvider, TimePicker } from '@mgs/ui';
import { parseTime } from '../../internal/dateFormat';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { nextFrame, pressKeys, typeDate } from '../../test/typing';
import * as stories from './TimePicker.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error the format comes from the locale of MgsProvider */}
    <TimePicker aria-label="Time" format="HH:mm:ss" />
    {/* @ts-expect-error the value is 24-hour text, not a Date */}
    <TimePicker aria-label="Time" value={new Date()} />
    {/* @ts-expect-error RSuite's label is hidden; use a <label>, aria-label or FormField */}
    <TimePicker label="Time" />
    {/* @ts-expect-error RSuite's cleanable is hidden; use clearable */}
    <TimePicker aria-label="Time" cleanable />
    {/* @ts-expect-error RSuite's hideMinutes is hidden; use minuteStep */}
    <TimePicker aria-label="Time" hideMinutes={() => false} />
    {/* @ts-expect-error RSuite's showMeridiem is hidden: 12 or 24 hours come from the locale */}
    <TimePicker aria-label="Time" showMeridiem />
    {/* @ts-expect-error RSuite's block is hidden: a TimePicker is always full width */}
    <TimePicker aria-label="Time" block />
    {/* @ts-expect-error RSuite's placement is hidden */}
    <TimePicker aria-label="Time" placement="topStart" />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <TimePicker aria-label="Time" size="xs" />
  </>
);

describe('TimePicker stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('TimePicker', () => {
  it('renders a text input of size md, named by its label, showing the format of en-GB', () => {
    const { container } = render(
      <>
        <label htmlFor="start">Start time</label>
        <TimePicker id="start" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Start time' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('placeholder', 'HH:mm');
    expect(input.closest('.rs-input-group')).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('.mgs-time-picker')).toContainElement(input);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it.each([
    ['en-GB', 'HH:mm', '14:05'],
    ['en-IN', 'HH:mm', '14:05'],
    ['en-US', 'hh:mm aa', '02:05 PM'],
  ] as const)(
    '%s: the format comes from the locale, the value stays 24-hour text',
    (locale, format, shown) => {
      render(
        <MgsProvider locale={locale}>
          <TimePicker aria-label="Empty" />
          <TimePicker aria-label="Filled" defaultValue="14:05" />
        </MgsProvider>,
      );
      expect(screen.getByLabelText('Empty')).toHaveAttribute('placeholder', format);
      expect(screen.getByLabelText('Filled')).toHaveValue(shown);
    },
  );

  it('typing calls onChange with the whole time as 24-hour text, not for half a time', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="Time" onChange={onChange} />);
    const input = screen.getByLabelText('Time');
    await typeDate(input, '14');
    expect(onChange).not.toHaveBeenCalled();
    await pressKeys(input, '30');
    expect(input).toHaveValue('14:30');
    expect(onChange).toHaveBeenLastCalledWith('14:30', expect.anything());
  });

  it('en-US: a typed afternoon time is given as 24-hour text', async () => {
    const onChange = vi.fn();
    render(
      <MgsProvider locale="en-US">
        <TimePicker aria-label="Time" onChange={onChange} />
      </MgsProvider>,
    );
    const input = screen.getByLabelText('Time');
    await typeDate(input, '0230');
    fireEvent.keyDown(input, { key: 'p' });
    await nextFrame();
    expect(input).toHaveValue('02:30 PM');
    expect(onChange).toHaveBeenLastCalledWith('14:30', expect.anything());
  });

  it('after Tab, typing starts at the hours', async () => {
    render(<TimePicker aria-label="Time" />);
    const input = screen.getByLabelText<HTMLInputElement>('Time');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await waitFor(() => expect([input.selectionStart, input.selectionEnd]).toEqual([0, 2]));
    await pressKeys(input, '0815');
    expect(input).toHaveValue('08:15');
  });

  it('the lists choose a time; OK gives it to the app', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="Time" defaultValue="09:00" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Time'));
    const dialog = await screen.findByRole('dialog');
    const hours = within(dialog).getByRole('listbox', { name: /hour/i });
    const minutes = within(dialog).getByRole('listbox', { name: /minute/i });
    await userEvent.click(within(hours).getByRole('option', { name: /^11/ }));
    await userEvent.click(within(minutes).getByRole('option', { name: /^45/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(onChange).toHaveBeenLastCalledWith('11:45', expect.anything());
    expect(screen.getByLabelText('Time')).toHaveValue('11:45');
  });

  it('minuteStep offers only its minutes; there are no shortcuts', async () => {
    render(<TimePicker aria-label="Time" defaultValue="09:00" minuteStep={15} />);
    await userEvent.click(screen.getByLabelText('Time'));
    const dialog = await screen.findByRole('dialog');
    const minutes = within(dialog).getByRole('listbox', { name: /minute/i });
    expect(
      within(minutes)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['00', '15', '30', '45']);
    expect(within(dialog).queryByRole('button', { name: /now/i })).not.toBeInTheDocument();
  });

  it('value: stays what the app sets, null empties the field, and text that is not a time shows nothing', () => {
    const { rerender } = render(<TimePicker aria-label="Time" value="14:30" onChange={() => {}} />);
    expect(screen.getByLabelText('Time')).toHaveValue('14:30');
    rerender(<TimePicker aria-label="Time" value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('Time')).toHaveValue('');
    rerender(<TimePicker aria-label="Time" value="25:00" onChange={() => {}} />);
    expect(screen.getByLabelText('Time')).toHaveValue('');
  });

  it('clearable: a button empties the field, and onChange gets null', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="Time" defaultValue="09:00" onChange={onChange} clearable />);
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null, expect.anything());
    expect(screen.getByLabelText('Time')).toHaveValue('');
  });

  it('disabled: not focusable and does not open', async () => {
    render(<TimePicker aria-label="Time" disabled defaultValue="09:00" />);
    const input = screen.getByLabelText('Time');
    expect(input).toBeDisabled();
    await userEvent.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('readOnly: focusable, marked read-only, and does not open', async () => {
    render(<TimePicker aria-label="Time" readOnly defaultValue="09:00" />);
    const input = screen.getByLabelText('Time');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await userEvent.click(input);
    expect(input).toHaveValue('09:00');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a form submits 24-hour text, whatever the locale, and empty when there is none', () => {
    render(
      <MgsProvider locale="en-US">
        <form data-testid="form">
          <TimePicker aria-label="Opens" name="opens" defaultValue="14:30" />
          <TimePicker aria-label="Closes" name="closes" />
          <TimePicker aria-label="Break" name="break" disabled defaultValue="12:00" />
        </form>
      </MgsProvider>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect([...new FormData(form).entries()]).toEqual([
      ['opens', '14:30'],
      ['closes', ''],
    ]);
  });

  it('required is said to screen readers; FormField wires the label, the error and required', () => {
    render(
      <FormField label="Pickup time" error="Enter the pickup time" required>
        <TimePicker />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: /Pickup time/ });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter the pickup time');
  });

  it('className and style go to the root; id, aria-* and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <TimePicker
        ref={ref}
        id="start"
        aria-label="Start time"
        aria-describedby="start-help"
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const input = screen.getByLabelText('Start time');
    const root = container.querySelector('.mgs-time-picker');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'start');
    expect(input).toHaveAttribute('aria-describedby', 'start-help');
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('parseTime reads 24-hour text only', () => {
    const time = parseTime('23:59');
    expect([time?.getHours(), time?.getMinutes()]).toEqual([23, 59]);
    expect(parseTime('00:00')?.getHours()).toBe(0);
    for (const text of ['24:00', '12:60', '9:00', '09:00:00', '2:30 PM', '']) {
      expect(parseTime(text)).toBeNull();
    }
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
