import { forwardRef, useState } from 'react';
import { Calendar as RSuiteCalendar } from 'rsuite';
import type { CalendarProps } from './types';
import './Calendar.scss';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/**
 * A month shown on the page, to look at days and what happens on them, and to choose one. For a date in a form, use a
 * `DatePicker`.
 *
 * Built on RSuite's Calendar, which provides the month and the header to move between months.
 * `className`, `style`, the other native attributes and `ref` go to the root element.
 *
 * @example
 * <Calendar aria-label="Team calendar" value={day} onChange={setDay} renderDay={(date) => eventsOf(date)} />
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value, defaultValue, onChange, onMonthChange, renderDay, compact = false, className, ...rest },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState<Date | null>(defaultValue ?? null);
  const chosen = value === undefined ? uncontrolled : value;

  return (
    <RSuiteCalendar
      {...rest}
      ref={ref}
      className={className ? `mgs-calendar ${className}` : 'mgs-calendar'}
      bordered
      compact={compact}
      // For RSuite this is also the month on show. It moves by itself when the user changes the month.
      value={chosen ?? undefined}
      // RSuite marks the day it is on, which moves with the month. MGS marks the chosen day only.
      cellClassName={(date) =>
        chosen !== null && sameDay(date, chosen) ? 'mgs-calendar__chosen' : undefined
      }
      renderCell={renderDay}
      onMonthChange={(month) => onMonthChange?.(new Date(month.getFullYear(), month.getMonth(), 1))}
      onSelect={(date) => {
        setUncontrolled(date);
        onChange?.(date);
      }}
    />
  );
});
