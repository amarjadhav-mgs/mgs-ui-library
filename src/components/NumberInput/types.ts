import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import type { InputSize } from '../Input/types';

/**
 * The event that changed the value: typing, pasting, a key (↑ ↓ Page Up/Down Home End, Enter), a step button, or
 * leaving the field.
 */
export type NumberInputChangeEvent =
  | ChangeEvent<HTMLInputElement>
  | ClipboardEvent<HTMLInputElement>
  | KeyboardEvent<HTMLInputElement>
  | MouseEvent<HTMLButtonElement>
  | FocusEvent<HTMLInputElement>;

/**
 * Every native `<input>` attribute except the ones MGS defines below, `type` (always a text field with a numeric
 * keyboard), and `width`, `height`, `color` and `prefix`, which RSuite would read as its own props.
 */
type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
  | 'prefix'
  | 'color'
  | 'width'
  | 'height'
>;

export interface NumberInputProps extends NativeInputProps {
  /** The value, for a controlled input: a number, or `null` when empty. Use with `onChange`. */
  value?: number | null;
  /** The starting value, for an uncontrolled input. */
  defaultValue?: number | null;
  /**
   * Called with the new number (or `null` when emptied): as the user types or pastes, on ↑ ↓ and the step buttons, and
   * when leaving the field or pressing Enter rounds or limits the value.
   */
  onChange?: (value: number | null, event: NumberInputChangeEvent) => void;
  /** Smallest value. On leaving the field, a smaller value becomes this. */
  min?: number;
  /** Largest value. On leaving the field, a larger value becomes this. */
  max?: number;
  /** How much ↑ ↓ and the step buttons change the value (Page Up / Page Down: 10 steps). @default 1 */
  step?: number;
  /**
   * Decimal places, e.g. 2 for money. On leaving the field the value is rounded to them and shown with all of them
   * (`54,999.00`). `0` accepts whole numbers only. Without it, any number of decimals is kept.
   */
  decimals?: number;
  /** Thousands separators while the field isn't focused (`54,999`; `12,34,567` in `en-IN`). @default true */
  grouping?: boolean;
  /** Text or an icon inside the field, before the number: `₹`, `$`. Say it in the label too: "Price (₹)". */
  prefix?: ReactNode;
  /** Text or an icon inside the field, after the number: `kg`, `%`, `units`. */
  suffix?: ReactNode;
  /** The − + step buttons, for the mouse; ↑ ↓ always work. Hidden when read-only. @default true */
  controls?: boolean;
  /** Size, the same scale as Input and Button. @default 'md' */
  size?: InputSize;
  /** Can't be focused or edited, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused and copied, but not edited. @default false */
  readOnly?: boolean;
}
