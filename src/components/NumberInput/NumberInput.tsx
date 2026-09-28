import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { MinusIcon, PlusIcon } from '../../icons';
import { TextInput } from '../Input/Input';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { useInputGroupDisabled } from '../InputGroup/context';
import { useMgsLocale } from '../MgsProvider/context';
import {
  clamp,
  cleanPaste,
  decimalPlaces,
  formatNumber,
  MAX_DIGITS,
  parseDraft,
  round,
  significantDigits,
  toDraft,
} from './number';
import type { NumberInputChangeEvent, NumberInputProps } from './types';
import './NumberInput.scss';

/**
 * A field for numbers: quantities, prices, amounts, percentages. Its value is a `number` (or `null` when empty), it
 * shows the number formatted for the locale when not focused, and ↑ ↓ change it by `step`.
 *
 * Built by MGS instead of on RSuite's NumberInput, which reports strings, has no spinbutton semantics for screen
 * readers, changes the value on mouse-wheel scroll, and rejects pasted numbers with grouping ("1,234.50").
 *
 * @example
 * <label htmlFor="price">Unit price (₹)</label>
 * <NumberInput id="price" prefix="₹" decimals={2} min={0} value={price} onChange={setPrice} />
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue = null,
    onChange,
    min,
    max,
    step = 1,
    decimals,
    grouping = true,
    prefix,
    suffix,
    controls = true,
    size,
    disabled: disabledProp,
    readOnly,
    className,
    style,
    name,
    form,
    onFocus,
    onBlur,
    onKeyDown,
    onPaste,
    autoComplete = 'off',
    ...rest
  },
  ref,
) {
  const locale = useMgsLocale();
  const groupDisabled = useInputGroupDisabled();
  const disabled = disabledProp || groupDisabled;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledValue;

  // While focused, the field shows the text being edited ("12.", "-"); otherwise the formatted value.
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;

  const allowDecimals = decimals !== 0;
  const allowNegative = min === undefined || min < 0;
  const parseOptions = { allowDecimals, allowNegative };
  // Stepping keeps as many decimals as the step and the value need, so 0.1 + 0.2 stays 0.3.
  const stepDecimals = (current: number) =>
    decimals ?? Math.max(decimalPlaces(step), decimalPlaces(current));

  // The draft shows only while it still means the current value. When the app changes the value during editing (a
  // recalculation, a lookup, or a controlled value that rejects what was typed), the field shows the new value.
  const draftIsCurrent = editing && parseDraft(draft, parseOptions).value === value;
  const formatted = formatNumber(value, { locale, decimals, grouping });
  const shownText = editing ? (draftIsCurrent ? draft : toDraft(value, decimals)) : formatted;

  const commit = (next: number | null, event: NumberInputChangeEvent) => {
    if (next === value) return;
    if (!controlled) setUncontrolledValue(next);
    onChange?.(next, event);
  };

  const applyText = (
    text: string,
    event: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>,
  ) => {
    // More than 15 digits is refused (JavaScript numbers lose precision beyond that), but a longer value set by the
    // app can still be shortened, so the field never gets stuck.
    const maxDigits = Math.max(MAX_DIGITS, significantDigits(shownText) - 1);
    const parsed = parseDraft(text, { ...parseOptions, maxDigits });
    if (!parsed.accepted) return;
    setDraft(parsed.text);
    commit(parsed.value, event);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented) return;
    // "₹1,234.50", "$1,234" or "12 kg": keep only the number, then insert it where the text is selected.
    const affixes = [prefix, suffix].filter((affix): affix is string => typeof affix === 'string');
    const pasted = cleanPaste(event.clipboardData.getData('text'), affixes);
    const input = event.currentTarget;
    const start = input.selectionStart ?? shownText.length;
    const end = input.selectionEnd ?? shownText.length;
    event.preventDefault();
    applyText(shownText.slice(0, start) + pasted + shownText.slice(end), event);
  };

  /** Rounds to `decimals` and limits to min and max: on leaving the field, and on Enter before the form submits. */
  const settle = (event: NumberInputChangeEvent) => {
    if (value === null || readOnly) return value;
    const settled = clamp(decimals === undefined ? value : round(value, decimals), min, max);
    commit(settled, event);
    return settled;
  };

  const stepBy = (
    steps: number,
    event: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    // From empty, a step starts at min (or 0) instead of jumping a whole step past it.
    const base = value ?? clamp(0, min, max);
    const next =
      value === null ? base : clamp(round(base + steps * step, stepDecimals(base)), min, max);
    commit(next, event);
    if (editing) setDraft(toDraft(next, decimals));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;
    const keySteps: Record<string, number> = {
      ArrowUp: 1,
      ArrowDown: -1,
      PageUp: 10,
      PageDown: -10,
    };
    if (event.key in keySteps) {
      event.preventDefault();
      stepBy(keySteps[event.key], event);
    } else if (event.key === 'Home' && min !== undefined) {
      event.preventDefault();
      commit(min, event);
      setDraft(toDraft(min, decimals));
    } else if (event.key === 'End' && max !== undefined) {
      event.preventDefault();
      commit(max, event);
      setDraft(toDraft(max, decimals));
    } else if (event.key === 'Enter') {
      // Enter submits the form without leaving the field: settle the value first, so the form gets 100, not 150.
      setDraft(toDraft(settle(event), decimals));
    }
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    // A read-only value keeps its formatted look; nobody edits it.
    if (!readOnly) setDraft(toDraft(value, decimals));
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setDraft(null);
    settle(event);
    onBlur?.(event);
  };

  // Screen readers hear the unit too: "₹54,999.00", "12 units".
  const valueText =
    value === null
      ? undefined
      : `${typeof prefix === 'string' ? prefix : ''}${formatted}${
          typeof suffix === 'string' ? `${suffix === '%' ? '' : ' '}${suffix}` : ''
        }`;
  const atMin = value !== null && min !== undefined && value <= min;
  const atMax = value !== null && max !== undefined && value >= max;

  return (
    <InputGroup
      inside
      size={size}
      disabled={disabled}
      className={className ? `mgs-number-input ${className}` : 'mgs-number-input'}
      style={style}
    >
      {prefix !== undefined && <InputGroupAddon>{prefix}</InputGroupAddon>}
      <TextInput
        ref={ref}
        {...rest}
        type="text"
        // WAI-ARIA spinbutton: screen readers announce the value and its limits, and ↑ ↓ change it. A text input, not
        // <input type="number">, which can't show locale grouping (12,34,567.50) and changes on mouse-wheel scroll.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        autoComplete={autoComplete}
        value={shownText}
        disabled={disabled}
        readOnly={readOnly}
        onChange={applyText}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {suffix !== undefined && <InputGroupAddon>{suffix}</InputGroupAddon>}
      {name !== undefined && (
        // Forms submit the raw number ("54999.5"), not the formatted text ("54,999.50") the field shows.
        <input type="hidden" name={name} form={form} value={toDraft(value)} disabled={disabled} />
      )}
      {controls && !readOnly && (
        // For the mouse only: ↑ ↓ do the same from the keyboard, so the buttons are out of the Tab order and hidden
        // from screen readers (the spinbutton announces the value). They don't take focus from the field. Side by
        // side and the field's full height, so each is at least 24 × 24px (WCAG 2.5.8).
        <span className="mgs-number-input__controls" aria-hidden="true">
          {(
            [
              ['decrement', -1, atMin, <MinusIcon key="decrement" />],
              ['increment', 1, atMax, <PlusIcon key="increment" />],
            ] as const
          ).map(([action, steps, atLimit, icon]) => (
            <button
              key={action}
              type="button"
              tabIndex={-1}
              className={`mgs-number-input__step mgs-number-input__step--${action}`}
              disabled={disabled || atLimit}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => stepBy(steps, event)}
            >
              {icon}
            </button>
          ))}
        </span>
      )}
    </InputGroup>
  );
});
