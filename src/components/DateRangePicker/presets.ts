import { endOfDay, startOfDay } from '../../internal/dateFormat';
import type { DateRange, DateRangePreset } from './types';

const range = (start: Date, end: Date): DateRange => [startOfDay(start), endOfDay(end)];

/**
 * The usual shortcuts of a report: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month. "Last 7 days"
 * ends today and includes it.
 *
 * Call it while rendering, not once at the top of a file: an app left open overnight would keep yesterday's "Today".
 *
 * @param today The day the shortcuts are counted from. @default new Date()
 *
 * @example
 * <DateRangePicker aria-label="Period" presets={dateRangePresets()} />
 */
export function dateRangePresets(today: Date = new Date()): DateRangePreset[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const yesterday = new Date(year, month, day - 1);
  return [
    { label: 'Today', value: range(today, today) },
    { label: 'Yesterday', value: range(yesterday, yesterday) },
    { label: 'Last 7 days', value: range(new Date(year, month, day - 6), today) },
    { label: 'Last 30 days', value: range(new Date(year, month, day - 29), today) },
    { label: 'This month', value: range(new Date(year, month, 1), new Date(year, month + 1, 0)) },
    { label: 'Last month', value: range(new Date(year, month - 1, 1), new Date(year, month, 0)) },
  ];
}
