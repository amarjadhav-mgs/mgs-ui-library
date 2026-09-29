import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** The native attributes a Calendar takes, except the ones MGS defines below. They go to the root element. */
export type NativeCalendarProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'onSelect' | 'color'
>;

export interface CalendarProps extends NativeCalendarProps {
  /** The chosen day, for a controlled calendar; `null` when none. Use with `onChange`. */
  value?: Date | null;
  /** The day chosen at the start, for an uncontrolled calendar. Without it, no day is chosen and today's month shows. */
  defaultValue?: Date;
  /** Called when the user chooses a day, with the day. Not called when the user only moves to another month. */
  onChange?: (value: Date) => void;
  /** Called when the calendar shows another month, with the first day of that month. */
  onMonthChange?: (month: Date) => void;
  /**
   * What a day shows under its number: the events of that day, a count, a dot. Keep it short; the calendar gives a
   * day about two lines.
   */
  renderDay?: (date: Date) => ReactNode;
  /** Smaller days, without room for `renderDay` content: for sidebars and cards. @default false */
  compact?: boolean;
}
