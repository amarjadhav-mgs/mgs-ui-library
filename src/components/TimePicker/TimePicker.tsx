import { forwardRef, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { DatePicker as RSuiteDatePicker } from 'rsuite';
import { dateFormats, isValidDate, parseTime, toTimeValue } from '../../internal/dateFormat';
import { useDateField } from '../../internal/useDateField';
import { useMgsLocale } from '../MgsProvider/context';
import type { TimePickerProps } from './types';
import './TimePicker.scss';

/**
 * A field for a time of day, typed or chosen from lists of hours and minutes. Its value is 24-hour text (`'14:30'`),
 * or `null` when empty: a time without a day, so without a time zone. The field shows it in the format of the locale
 * of `MgsProvider`: 24-hour, or 12-hour with AM and PM in `en-US`.
 *
 * Built on RSuite's DatePicker with a time format (which is what RSuite's TimePicker is), which provides the lists, their position, the keyboard and the typing.
 * Label it with `<label htmlFor>` and `id` (or `aria-label`), or put it in a `FormField`.
 *
 * `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.
 *
 * @example
 * <label htmlFor="start">Start time</label>
 * <TimePicker id="start" value={start} onChange={setStart} minuteStep={15} />
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { value, defaultValue, onChange, minuteStep = 1, ...props },
  ref,
) {
  const locale = useMgsLocale();
  const formats = dateFormats[locale];
  const { name, disabled, fieldProps, rest } = useDateField(props, ref, 'mgs-time-picker');

  // Only to give a form the value of an uncontrolled field; RSuite keeps the value it shows.
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? uncontrolled : value;
  // The value the app knows: what it set, or what onChange last gave it.
  const reported = useRef<string | null>(current ?? null);
  useEffect(() => {
    if (value !== undefined) reported.current = value;
  }, [value]);

  // RSuite's value is a Date. The same Date as long as the text is the same: a new one would restart its typing.
  const date = useMemo(() => (value == null ? value : parseTime(value)), [value]);
  const defaultDate = useMemo(
    () => (defaultValue === undefined ? undefined : (parseTime(defaultValue) ?? undefined)),
    [defaultValue],
  );
  const hideMinutes = useMemo(
    () => (minuteStep > 1 ? (minute: number) => minute % minuteStep !== 0 : undefined),
    [minuteStep],
  );

  return (
    <>
      <RSuiteDatePicker
        {...rest}
        {...fieldProps}
        format={formats.time}
        showMeridiem={formats.twelveHour}
        value={date}
        defaultValue={defaultDate}
        hideMinutes={hideMinutes}
        // No shortcuts: RSuite would add its own.
        ranges={[]}
        onChange={(next: Date | null, event: SyntheticEvent) => {
          // While a time is being typed, RSuite reports an invalid Date ("14:__"). Only a whole time is a value.
          if (next !== null && !isValidDate(next)) return;
          const time = next === null ? null : toTimeValue(next);
          if (time === reported.current) return;
          reported.current = time;
          setUncontrolled(time);
          onChange?.(time, event);
        }}
      />
      {name !== undefined && (
        // Forms submit the time as 24-hour text ("14:30"), not the text the field shows ("02:30 PM").
        <input
          type="hidden"
          name={name}
          disabled={disabled}
          value={current != null && parseTime(current) ? current : ''}
        />
      )}
    </>
  );
});
