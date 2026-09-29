import { forwardRef, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { DatePicker as RSuiteDatePicker } from 'rsuite';
import {
  dateFormats,
  isDayOutside,
  isValidDate,
  isWholeDate,
  toDateTimeValue,
  toDateValue,
} from '../../internal/dateFormat';
import { useDateField } from '../../internal/useDateField';
import { useMgsLocale } from '../MgsProvider/context';
import type { DatePickerProps } from './types';
import './DatePicker.scss';

/**
 * A field for one date, typed or chosen from a calendar. Its value is a `Date`, or `null` when empty. With
 * `withTime` it also asks for the time. The format comes from the locale of `MgsProvider`.
 *
 * Built on RSuite's DatePicker, which provides the calendar, its position, the keyboard and the typing.
 * Label it with `<label htmlFor>` and `id` (or `aria-label`), or put it in a `FormField`.
 *
 * `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.
 *
 * @example
 * <label htmlFor="due">Due date</label>
 * <DatePicker id="due" value={due} onChange={setDue} minDate={new Date()} />
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    onChange,
    withTime = false,
    minDate,
    maxDate,
    isDateDisabled,
    presets,
    ...props
  },
  ref,
) {
  const locale = useMgsLocale();
  const formats = dateFormats[locale];
  const { name, disabled, fieldProps, rest } = useDateField(props, ref, 'mgs-date-picker');

  // Only to give a form the value of an uncontrolled field; RSuite keeps the value it shows.
  const [uncontrolled, setUncontrolled] = useState<Date | null>(defaultValue ?? null);
  const current = value === undefined ? uncontrolled : value;
  // The value the app knows: what it set, or what onChange last gave it.
  const reported = useRef<Date | null>(current ?? null);
  useEffect(() => {
    if (value !== undefined) reported.current = value;
  }, [value]);

  const shouldDisableDate = useMemo(
    () =>
      minDate || maxDate || isDateDisabled
        ? (date: Date) => isDayOutside(date, minDate, maxDate) || (isDateDisabled?.(date) ?? false)
        : undefined,
    [minDate, maxDate, isDateDisabled],
  );
  const ranges = useMemo(
    () =>
      // No shortcuts: RSuite would add its own ("today", "yesterday").
      (presets ?? []).filter((preset) => !(shouldDisableDate?.(preset.value) ?? false)),
    [presets, shouldDisableDate],
  );

  return (
    <>
      <RSuiteDatePicker
        {...rest}
        {...fieldProps}
        format={withTime ? `${formats.date} ${formats.time}` : formats.date}
        showMeridiem={withTime && formats.twelveHour}
        // A date alone is chosen with one click; with a time, the OK button ends the choice.
        oneTap={!withTime}
        value={value}
        defaultValue={defaultValue}
        shouldDisableDate={shouldDisableDate}
        ranges={ranges}
        onChange={(next: Date | null, event: SyntheticEvent) => {
          // While a date is being typed, RSuite reports every step: an invalid Date ("24/__/____"), then the years
          // 2, 20 and 202 on the way to 2026, each of them twice. Only a whole date is a value for the app.
          if (next !== null && !isWholeDate(next)) return;
          // A day that can't be chosen can still be typed. RSuite marks the field invalid; the app doesn't get it.
          if (next !== null && shouldDisableDate?.(next)) return;
          if ((next?.getTime() ?? null) === (reported.current?.getTime() ?? null)) return;
          reported.current = next;
          setUncontrolled(next);
          onChange?.(next, event);
        }}
      />
      {name !== undefined && (
        // Forms submit the date in a fixed format ("2026-09-24"), not the text the field shows ("24/09/2026").
        <input
          type="hidden"
          name={name}
          disabled={disabled}
          value={
            isValidDate(current) ? (withTime ? toDateTimeValue(current) : toDateValue(current)) : ''
          }
        />
      )}
    </>
  );
});
