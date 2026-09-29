import type { MgsLocale } from '../components/MgsProvider/types';

/**
 * The date and time formats of each MGS locale, as the patterns the date components use. One place, so every date in
 * an app looks the same (ARCHITECTURE.md: the locale sets the format; there is no format prop).
 * Internal: not exported from '@mgs/ui'.
 */
export const dateFormats: Record<MgsLocale, { date: string; time: string; twelveHour: boolean }> = {
  'en-GB': { date: 'dd/MM/yyyy', time: 'HH:mm', twelveHour: false },
  'en-IN': { date: 'dd/MM/yyyy', time: 'HH:mm', twelveHour: false },
  'en-US': { date: 'MM/dd/yyyy', time: 'hh:mm aa', twelveHour: true },
};

/** Between the two dates or times of a range, in the field: an en dash. */
export const RANGE_SEPARATOR = ' – ';

const two = (value: number) => String(value).padStart(2, '0');

/** A valid Date: not `null`, and not the "Invalid Date" that half-typed text gives. */
export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

/**
 * A valid Date with a year of four digits. While the user types "2026", the field holds the years 2, 20 and 202:
 * valid dates, but not what the user means. Years before 1000 can't be entered.
 */
export const isWholeDate = (value: unknown): value is Date =>
  isValidDate(value) && value.getFullYear() >= 1000;

/**
 * The date as a form submits it, in the user's own time zone: `2026-09-24`. Not `toISOString()`, which turns local
 * midnight into the day before for every time zone ahead of UTC.
 */
export const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;

/** The time as a form submits it: `14:30`. */
export const toTimeValue = (date: Date) => `${two(date.getHours())}:${two(date.getMinutes())}`;

/** The date and time as a form submits them, in the user's own time zone: `2026-09-24T14:30`. */
export const toDateTimeValue = (date: Date) => `${toDateValue(date)}T${toTimeValue(date)}`;

/** The first moment of the day of `date`. */
export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The last moment of the day of `date`. */
export const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

/** Whether the day of `date` is before the day of `min` or after the day of `max`. */
export function isDayOutside(date: Date, min?: Date, max?: Date) {
  const day = startOfDay(date).getTime();
  if (min && day < startOfDay(min).getTime()) return true;
  if (max && day > startOfDay(max).getTime()) return true;
  return false;
}

/**
 * The time of 24-hour text (`'14:30'`) as a Date, or `null` when the text is not a time. The day is 1 January 2000:
 * a day without a change of clocks, so every time of the day exists on it.
 */
export function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? new Date(2000, 0, 1, Number(match[1]), Number(match[2])) : null;
}
