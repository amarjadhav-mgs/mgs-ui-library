import type { ComponentPropsWithoutRef, SyntheticEvent } from 'react';
import type { InputSize } from '../Input/types';

/** A shortcut in the calendar of a DatePicker: "Today", "Tomorrow". */
export interface DatePreset {
  /** The text of the shortcut. */
  label: string;
  /** The date it chooses. */
  value: Date;
}

/**
 * The native attributes a date field takes, except the ones MGS defines below and the ARIA attributes the field sets
 * itself to describe its calendar. `id` and `aria-*` go to the `<input>`; the others to the element around it.
 */
export type NativeDateFieldProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  | 'role'
  | 'children'
  | 'defaultValue'
  | 'onChange'
  | 'onSelect'
  | 'color'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-controls'
>;

/** What DatePicker, DateRangePicker and TimePicker have in common. */
export interface DateFieldBaseProps extends NativeDateFieldProps {
  /** Shown while the field is empty. Without it, the field shows its format (`dd/MM/yyyy`). Not a label. */
  placeholder?: string;
  /** Size, the same scale as Input and Button. @default 'md' */
  size?: InputSize;
  /** A button in the field that removes the value. For values that may be empty. @default false */
  clearable?: boolean;
  /** Busy: the value is being loaded. Shows a spinner in the field. @default false */
  loading?: boolean;
  /** Can't be focused or changed, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused and copied, but not changed; submitted with a form. @default false */
  readOnly?: boolean;
  /** The field must have a value before the form can be submitted: said to screen readers. @default false */
  required?: boolean;
  /** The `name` a form submits the value with, in a fixed format that doesn't depend on the locale. */
  name?: string;
  /** Whether the popup is open, for a controlled popup. Use with `onOpenChange`. */
  open?: boolean;
  /** Whether the popup starts open. @default false */
  defaultOpen?: boolean;
  /** Called when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

export interface DatePickerProps extends DateFieldBaseProps {
  /** The date, for a controlled field; `null` when empty. Use with `onChange`. */
  value?: Date | null;
  /** The starting date, for an uncontrolled field. */
  defaultValue?: Date;
  /**
   * Called when the user chooses or types a whole date, or clears the field (`null`), with the date first. Not called
   * for a date that is only half typed.
   */
  onChange?: (value: Date | null, event: SyntheticEvent) => void;
  /** Also asks for the time, in the locale's format (24-hour, or 12-hour in `en-US`). @default false */
  withTime?: boolean;
  /** The first day that can be chosen. Earlier days are shown, but disabled. */
  minDate?: Date;
  /** The last day that can be chosen. Later days are shown, but disabled. */
  maxDate?: Date;
  /** Disables more days: weekends, holidays. Return `true` for a day that can't be chosen. */
  isDateDisabled?: (date: Date) => boolean;
  /** Shortcuts in the calendar: "Today", "Tomorrow". A shortcut outside `minDate` and `maxDate` is left out. */
  presets?: DatePreset[];
}
