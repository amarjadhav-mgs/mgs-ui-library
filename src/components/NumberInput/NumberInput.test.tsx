import { createRef, useState } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputGroup, MgsProvider, NumberInput } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import {
  clamp,
  cleanPaste,
  decimalPlaces,
  formatNumber,
  parseDraft,
  round,
  toDraft,
} from './number';
import * as stories from './NumberInput.stories';

const allStories = composeStories(stories);

/** A form with a controlled discount field; reports the state and the FormData value on submit. */
function DiscountForm({ onSubmit }: { onSubmit: (state: number | null, posted: unknown) => void }) {
  const [discount, setDiscount] = useState<number | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(discount, new FormData(event.currentTarget).get('discount'));
      }}
    >
      <NumberInput
        aria-label="Discount"
        name="discount"
        min={0}
        max={100}
        decimals={1}
        value={discount}
        onChange={setDiscount}
      />
      <button type="submit">Save</button>
    </form>
  );
}

/** A price the app can replace while the field has focus (a lookup). */
function LookupPrice() {
  const [price, setPrice] = useState<number | null>(10);
  return (
    <>
      <NumberInput aria-label="Price" value={price} onChange={setPrice} />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setPrice(99)}
      >
        Look up price
      </button>
    </>
  );
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error the value is a number, not a string */}
    <NumberInput value="12" />
    {/* @ts-expect-error RSuite's scrollable is hidden; the mouse wheel never changes the value */}
    <NumberInput scrollable />
    {/* @ts-expect-error RSuite's formatter is hidden; formatting comes from the locale */}
    <NumberInput formatter={(v: number) => String(v)} />
    {/* @ts-expect-error RSuite's decimalSeparator is hidden */}
    <NumberInput decimalSeparator="," />
    {/* @ts-expect-error the type is always a text field with a numeric keyboard */}
    <NumberInput type="number" />
  </>
);

describe('number helpers', () => {
  it('parseDraft accepts numbers, parts of numbers and pasted grouping', () => {
    expect(parseDraft('1,234.50')).toEqual({ accepted: true, text: '1234.50', value: 1234.5 });
    expect(parseDraft('12,34,567')).toMatchObject({ value: 1234567 });
    expect(parseDraft('12.')).toMatchObject({ accepted: true, value: 12 });
    // No digits yet: shown, and the value is empty (not the previous number).
    expect(parseDraft('-')).toMatchObject({ accepted: true, text: '-', value: null });
    expect(parseDraft('.')).toMatchObject({ accepted: true, value: null });
    expect(Object.is(parseDraft('-0').value, 0)).toBe(true);
    expect(parseDraft('123456789012345').accepted).toBe(true);
    expect(parseDraft('1234567890123456').accepted).toBe(false);
    expect(parseDraft('1234567890123456', { maxDigits: 16 }).accepted).toBe(true);
    expect(parseDraft('')).toMatchObject({ accepted: true, value: null });
    expect(parseDraft('12a').accepted).toBe(false);
    expect(parseDraft('1.2.3').accepted).toBe(false);
    expect(parseDraft('1.5', { allowDecimals: false }).accepted).toBe(false);
    expect(parseDraft('-3', { allowNegative: false }).accepted).toBe(false);
  });

  it('clamp, round and decimalPlaces', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0)).toBe(0);
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
    expect(decimalPlaces(0.25)).toBe(2);
    expect(decimalPlaces(1e-7)).toBe(7);
    expect(decimalPlaces(1.5e-7)).toBe(8);
    // Money rounds half away from zero, without floating-point errors.
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(2.675, 2)).toBe(2.68);
    expect(round(-1.005, 2)).toBe(-1.01);
    expect(round(12.345, 1)).toBe(12.3);
    expect(Object.is(round(-0.001, 2), 0)).toBe(true);
  });

  it('formats for the locale and keeps the editable text plain', () => {
    const options = { decimals: 2, grouping: true };
    expect(formatNumber(1234567.5, { locale: 'en-GB', ...options })).toBe('1,234,567.50');
    expect(formatNumber(1234567.5, { locale: 'en-IN', ...options })).toBe('12,34,567.50');
    expect(formatNumber(1234567.5, { locale: 'en-GB', decimals: 2, grouping: false })).toBe(
      '1234567.50',
    );
    expect(formatNumber(null, { locale: 'en-GB', ...options })).toBe('');
    expect(toDraft(54999, 2)).toBe('54999.00');
    expect(toDraft(1e21)).toBe('1000000000000000000000');
    expect(toDraft(1e-7)).toBe('0.0000001');
    expect(toDraft(-0)).toBe('0');
    expect(formatNumber(-0, { locale: 'en-GB', grouping: true })).toBe('0');
  });

  it('cleanPaste keeps only the number', () => {
    expect(cleanPaste('₹1,234.50')).toBe('1234.50');
    expect(cleanPaste('$1,234')).toBe('1234');
    expect(cleanPaste('12 kg', ['kg'])).toBe('12');
    expect(cleanPaste('-5.5 %')).toBe('-5.5');
  });
});

describe('NumberInput stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('NumberInput', () => {
  it('is a spinbutton with its value and limits, a decimal keyboard, and the formatted value when not focused', () => {
    render(
      <NumberInput aria-label="Price" min={0} max={100000} decimals={2} defaultValue={54999} />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Price' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAttribute('aria-valuenow', '54999');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '100000');
    expect(input).toHaveAttribute('aria-valuetext', '54,999.00');
    expect(input).toHaveValue('54,999.00');
  });

  it('shows the plain number while focused, and formats it again on leaving', async () => {
    render(<NumberInput aria-label="Price" decimals={2} defaultValue={54999} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    expect(input).toHaveValue('54999.00');
    await userEvent.tab();
    expect(input).toHaveValue('54,999.00');
  });

  it('reports numbers, not strings, as the user types, and null when emptied', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Quantity" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '12.5');
    expect(onChange).toHaveBeenLastCalledWith(12.5, expect.anything());
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([1, 12, 12.5]);
    await userEvent.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(null, expect.anything());
  });

  it('ignores letters and accepts pasted numbers with grouping', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Amount" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, 'a1b');
    expect(input).toHaveValue('1');
    await userEvent.clear(input);
    await userEvent.click(input);
    await userEvent.paste('1,234.50');
    expect(onChange).toHaveBeenLastCalledWith(1234.5, expect.anything());
  });

  it('decimals={0} accepts whole numbers only; min >= 0 rejects the minus sign', async () => {
    render(<NumberInput aria-label="Quantity" decimals={0} min={0} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    await userEvent.type(input, '-3.5');
    expect(input).toHaveValue('35');
  });

  it('on leaving the field: rounds to decimals and limits to min and max', async () => {
    const onChange = vi.fn();
    render(
      <NumberInput aria-label="Discount" min={0} max={100} decimals={1} onChange={onChange} />,
    );
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '150');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(100, expect.objectContaining({ type: 'blur' }));
    await userEvent.clear(input);
    await userEvent.type(input, '12.345');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(12.3, expect.anything());
    expect(input).toHaveValue('12.3');
  });

  it('keyboard: arrows step, Page Up / Down step by 10, Home and End jump to the limits', async () => {
    render(<NumberInput aria-label="Quantity" min={0} max={100} step={5} defaultValue={50} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '55');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveAttribute('aria-valuenow', '45');
    await userEvent.keyboard('{PageUp}');
    expect(input).toHaveAttribute('aria-valuenow', '95');
    await userEvent.keyboard('{PageUp}');
    expect(input).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    expect(input).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    expect(input).toHaveAttribute('aria-valuenow', '100');
    expect(input).toHaveValue('100');
  });

  it('decimal steps have no floating-point noise', async () => {
    render(<NumberInput aria-label="Rate" step={0.1} defaultValue={0.2} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '0.3');
  });

  it('from empty, ↑ starts at min', async () => {
    render(<NumberInput aria-label="Quantity" min={1} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '1');
  });

  it('step buttons: hidden from screen readers, out of the Tab order, disabled at the limits, keep focus', async () => {
    const { container } = render(<NumberInput aria-label="Quantity" max={3} defaultValue={2} />);
    const input = screen.getByRole('spinbutton');
    const [down, up] = container.querySelectorAll<HTMLButtonElement>('.mgs-number-input__step');
    expect(up.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(up).toHaveAttribute('tabindex', '-1');
    await userEvent.click(input);
    await userEvent.click(up);
    expect(input).toHaveAttribute('aria-valuenow', '3');
    expect(input).toHaveFocus();
    expect(up).toBeDisabled();
    expect(down).not.toBeDisabled();
  });

  it('read-only: no step buttons, the formatted value stays, and keys do not change it', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <NumberInput
        aria-label="Total"
        readOnly
        decimals={2}
        defaultValue={1250}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    expect(container.querySelector('.mgs-number-input__controls')).toBeNull();
    await userEvent.click(input);
    expect(input).toHaveValue('1,250.00');
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled: the field and the step buttons, also from a disabled InputGroup context', () => {
    const { container } = render(<NumberInput aria-label="Limit" disabled defaultValue={5} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    container
      .querySelectorAll('.mgs-number-input__step')
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('controlled: follows value, reports changes', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput aria-label="Qty" value={3} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('3');
    rerender(<NumberInput aria-label="Qty" value={7} onChange={onChange} />);
    expect(input).toHaveValue('7');
  });

  it('formats for the MgsProvider locale: en-IN groups in lakhs', () => {
    render(
      <MgsProvider locale="en-IN">
        <NumberInput aria-label="Amount" decimals={2} defaultValue={1234567.5} />
      </MgsProvider>,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue('12,34,567.50');
  });

  it('prefix and suffix sit inside the field; native attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <NumberInput
        ref={ref}
        id="price"
        name="price"
        required
        aria-label="Price"
        aria-describedby="hint"
        prefix="₹"
        suffix="per unit"
        className="custom"
      />,
    );
    const input = screen.getByRole('spinbutton');
    expect(ref.current).toBe(input);
    expect(input).toBeRequired();
    // The visible field has no name: the hidden input submits the raw number.
    expect(input).not.toHaveAttribute('name');
    expect(container.querySelector('input[type="hidden"][name="price"]')).not.toBeNull();
    expect(input).toHaveAttribute('aria-describedby', 'hint');
    expect(screen.getByText('₹')).toBeInTheDocument();
    expect(screen.getByText('per unit')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(
      'mgs-input-group',
      'mgs-number-input',
      'custom',
    );
  });

  it('works inside a disabled InputGroup context too', () => {
    const { container } = render(
      <InputGroup disabled>
        <div>
          <NumberInput aria-label="Nested" defaultValue={5} />
        </div>
      </InputGroup>,
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    // The step buttons too, so a click can't change a disabled field.
    const steps = container.querySelectorAll('.mgs-number-input__step');
    expect(steps).toHaveLength(2);
    steps.forEach((button) => expect(button).toBeDisabled());
  });

  it('Enter settles the value before the form submits (limited and rounded), in state and in FormData', async () => {
    const onSubmit = vi.fn();
    render(<DiscountForm onSubmit={onSubmit} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '150{Enter}');
    expect(onSubmit).toHaveBeenLastCalledWith(100, '100');
    expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, '12.36{Enter}');
    expect(onSubmit).toHaveBeenLastCalledWith(12.4, '12.4');
  });

  it('forms get the raw number from the hidden input, not the formatted text; nothing when disabled', () => {
    const { container, rerender } = render(
      <form>
        <NumberInput aria-label="Price" name="price" decimals={2} defaultValue={54999.5} />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(screen.getByRole('spinbutton')).toHaveValue('54,999.50');
    expect(new FormData(form).get('price')).toBe('54999.5');
    rerender(
      <form>
        <NumberInput aria-label="Price" name="price" disabled defaultValue={54999.5} />
      </form>,
    );
    expect(new FormData(form).get('price')).toBeNull();
  });

  it('shows a value the app changes while the field is focused', async () => {
    render(<LookupPrice />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.type(input, '5');
    expect(input).toHaveValue('105');
    await userEvent.click(screen.getByRole('button', { name: 'Look up price' }));
    expect(input).toHaveFocus();
    expect(input).toHaveValue('99');
    expect(input).toHaveAttribute('aria-valuenow', '99');
  });

  it('a controlled value that rejects what was typed wins', async () => {
    render(<NumberInput aria-label="Locked" value={5} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.type(input, '7');
    expect(input).toHaveValue('5');
  });

  it('typing only "-" over a number empties the value instead of keeping the old one', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Change" defaultValue={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.tripleClick(input);
    await userEvent.keyboard('-');
    expect(input).toHaveValue('-');
    expect(onChange).toHaveBeenLastCalledWith(null, expect.anything());
    expect(input).not.toHaveAttribute('aria-valuenow');
  });

  it('-0 is stored and shown as 0', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Change" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '-0');
    expect(Object.is(onChange.mock.lastCall?.[0], 0)).toBe(true);
    await userEvent.tab();
    expect(input).toHaveValue('0');
  });

  it('refuses a 16th digit, but a longer value from the app can still be shortened', async () => {
    render(<NumberInput aria-label="Typed" />);
    const typed = screen.getByRole('spinbutton');
    await userEvent.type(typed, '1234567890123456');
    expect(typed).toHaveValue('123456789012345');
  });

  it('a value over 15 digits from the app shows without exponent notation and can be shortened', async () => {
    render(<NumberInput aria-label="Big" defaultValue={1e21} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    expect(input).toHaveValue('1000000000000000000000');
    await userEvent.keyboard('{End}{Backspace}');
    expect(input).toHaveValue('100000000000000000000');
  });

  it('paste removes currency symbols, units and grouping', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Weight" suffix="kg" onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.paste('₹1,234.50');
    expect(onChange).toHaveBeenLastCalledWith(1234.5, expect.anything());
    await userEvent.clear(input);
    await userEvent.paste('12 kg');
    expect(onChange).toHaveBeenLastCalledWith(12, expect.anything());
  });

  it('screen readers hear the unit: aria-valuetext includes a text prefix or suffix', () => {
    render(
      <>
        <NumberInput aria-label="Price" prefix="₹" decimals={2} defaultValue={54999} />
        <NumberInput aria-label="Quantity" suffix="units" defaultValue={12} />
        <NumberInput aria-label="Discount" suffix="%" defaultValue={5} />
      </>,
    );
    expect(screen.getByLabelText('Price')).toHaveAttribute('aria-valuetext', '₹54,999.00');
    expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-valuetext', '12 units');
    expect(screen.getByLabelText('Discount')).toHaveAttribute('aria-valuetext', '5%');
  });

  it('does not accept strings or RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
