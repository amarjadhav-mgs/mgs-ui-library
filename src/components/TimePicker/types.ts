import type { SyntheticEvent } from 'react';
import type { DateFieldBaseProps } from '../DatePicker/types';

export interface TimePickerProps extends DateFieldBaseProps {
  /**
   * The time, for a controlled field, as 24-hour text: `'14:30'`; `null` when empty. Use with `onChange`. The field
   * shows it in the locale's format.
   */
  value?: string | null;
  /** The starting time, for an uncontrolled field: `'09:00'`. */
  defaultValue?: string;
  /**
   * Called when the user chooses or types a whole time, or clears the field (`null`), with the time first, as
   * 24-hour text: `'14:30'`.
   */
  onChange?: (value: string | null, event: SyntheticEvent) => void;
  /**
   * The minutes offered in the list: `15` offers 00, 15, 30 and 45. Other minutes can still be typed.
   * @default 1
   */
  minuteStep?: number;
}
