import { forwardRef, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { DateRangePicker as RSuiteDateRangePicker } from 'rsuite';
import {
  dateFormats,
  RANGE_SEPARATOR,
  endOfDay,
  isDayOutside,
  isWholeDate,
  startOfDay,
  toDateValue,
} from '../../internal/dateFormat';
import { useDateField } from '../../internal/useDateField';
import { useMediaQuery } from '../../internal/useMediaQuery';
import { useMgsLocale } from '../MgsProvider/context';
import type { DateRange, DateRangePickerProps } from './types';
import './DateRangePicker.scss';

const sameRange = (a: DateRange | null, b: DateRange | null) =>
  a === null || b === null
    ? a === b
    : a[0].getTime() === b[0].getTime() && a[1].getTime() === b[1].getTime();

/**
 * A field for a start and an end day that belong together, typed or chosen from a calendar: the period of a report.
 * Its value is `[start, end]`, or `null` when empty. The format comes from the locale of `MgsProvider`.
 *
 * Built on RSuite's DateRangePicker, which provides the calendars, their position, the keyboard and the typing.
 * Label it with `<label htmlFor>` and `id` (or `aria-label`), or put it in a `FormField`.
 *
 * `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.
 *
 * @example
 * <label htmlFor="period">Period</label>
 * <DateRangePicker id="period" value={period} onChange={setPeriod} presets={dateRangePresets()} />
 */
export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  function DateRangePicker(
    { value, defaultValue, onChange, minDate, maxDate, isDateDisabled, presets, ...props },
    ref,
  ) {
    const locale = useMgsLocale();
    const { name, disabled, fieldProps, rest } = useDateField(props, ref, 'mgs-date-range-picker');
    // Two calendars side by side need about 600px.
    const narrow = useMediaQuery('(max-width: 639px)');

    // Only to give a form the value of an uncontrolled field; RSuite keeps the value it shows.
    const [uncontrolled, setUncontrolled] = useState<DateRange | null>(defaultValue ?? null);
    const current = value === undefined ? uncontrolled : value;
    // The value the app knows: what it set, or what onChange last gave it.
    const reported = useRef<DateRange | null>(current ?? null);
    useEffect(() => {
      if (value !== undefined) reported.current = value;
    }, [value]);

    const shouldDisableDate = useMemo(
      () =>
        minDate || maxDate || isDateDisabled
          ? (date: Date) =>
              isDayOutside(date, minDate, maxDate) || (isDateDisabled?.(date) ?? false)
          : undefined,
      [minDate, maxDate, isDateDisabled],
    );
    const ranges = useMemo(
      () =>
        // No shortcuts: RSuite would add its own ("today", "yesterday", "last 7 days").
        (presets ?? [])
          .filter(
            (preset) =>
              !(shouldDisableDate?.(preset.value[0]) || shouldDisableDate?.(preset.value[1])),
          )
          .map((preset) => ({
            label: preset.label,
            value: preset.value,
            // Beside the calendars when there is room; a long list under them would push the calendars up.
            placement: narrow ? ('bottom' as const) : ('left' as const),
          })),
      [presets, shouldDisableDate, narrow],
    );

    return (
      <>
        <RSuiteDateRangePicker
          {...rest}
          {...fieldProps}
          format={dateFormats[locale].date}
          character={RANGE_SEPARATOR}
          showOneCalendar={narrow}
          // The field shows the range; the same text above the calendars is a repeat.
          showHeader={false}
          value={value}
          defaultValue={defaultValue}
          shouldDisableDate={shouldDisableDate}
          ranges={ranges}
          onChange={(next: DateRange | null, event: SyntheticEvent) => {
            let range: DateRange | null = null;
            if (next !== null) {
              const [start, end] = next;
              // While a range is being typed, RSuite reports every step. Only a whole range is a value for the app.
              if (!isWholeDate(start) || !isWholeDate(end) || start > end) return;
              // Days that can't be chosen can still be typed. RSuite marks the field invalid; the app doesn't get them.
              if (shouldDisableDate?.(start) || shouldDisableDate?.(end)) return;
              range = [startOfDay(start), endOfDay(end)];
            }
            if (sameRange(range, reported.current)) return;
            reported.current = range;
            setUncontrolled(range);
            onChange?.(range, event);
          }}
        />
        {name !== undefined && (
          // Forms submit the range in a fixed format ("2026-09-01/2026-09-30"), not the text the field shows.
          <input
            type="hidden"
            name={name}
            disabled={disabled}
            value={
              current && isWholeDate(current[0]) && isWholeDate(current[1])
                ? `${toDateValue(current[0])}/${toDateValue(current[1])}`
                : ''
            }
          />
        )}
      </>
    );
  },
);
