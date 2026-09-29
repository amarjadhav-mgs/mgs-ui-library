import type { SyntheticEvent } from 'react';
import type { DateFieldBaseProps } from '../DatePicker/types';

/** A start and an end day. The start is the first moment of its day, the end the last moment of its day. */
export type DateRange = [start: Date, end: Date];

/** A shortcut in the calendar of a DateRangePicker: "Last 7 days", "This month". */
export interface DateRangePreset {
  /** The text of the shortcut. */
  label: string;
  /** The range it chooses. */
  value: DateRange;
}

export interface DateRangePickerProps extends DateFieldBaseProps {
  /** The range, for a controlled field; `null` when empty. Use with `onChange`. */
  value?: DateRange | null;
  /** The starting range, for an uncontrolled field. */
  defaultValue?: DateRange;
  /**
   * Called when the user chooses or types a whole range, or clears the field (`null`), with the range first. The
   * start is the first moment of its day (00:00) and the end the last moment of its day (23:59:59.999).
   */
  onChange?: (value: DateRange | null, event: SyntheticEvent) => void;
  /** The first day that can be chosen. Earlier days are shown, but disabled. */
  minDate?: Date;
  /** The last day that can be chosen. Later days are shown, but disabled. */
  maxDate?: Date;
  /** Disables more days: weekends, holidays. Return `true` for a day that can't be chosen. */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Shortcuts in the calendar. `dateRangePresets()` gives the usual ones. A shortcut that starts or ends on a day
   * that can't be chosen is left out.
   */
  presets?: DateRangePreset[];
}
