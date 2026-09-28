import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';

/** Control size, shared with Button: inputs and buttons of the same size line up. */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Text input types. Each sets the right mobile keyboard and autofill. Passwords, numbers and dates have their own
 * components (`PasswordInput`, `NumberInput`, `DatePicker`).
 */
export type InputType = 'text' | 'email' | 'tel' | 'url' | 'search';

/**
 * Every native `<input>` attribute except the ones MGS defines below, and `width`, `height` and `color`: RSuite reads
 * those names as CSS style props instead of passing them to the `<input>`.
 */
type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'color' | 'width' | 'height'
>;

export interface InputProps extends NativeInputProps {
  /** Input type. @default 'text' */
  type?: InputType;
  /** Size. Inside an `InputGroup`, the group's `size` is used when this is not set. @default 'md' */
  size?: InputSize;
  /** The value, for a controlled input. Use with `onChange`. */
  value?: string;
  /** The starting value, for an uncontrolled input. */
  defaultValue?: string;
  /** Called on every change, with the new value first. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Can't be focused or edited, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused, selected and copied, but not edited; submitted with a form. @default false */
  readOnly?: boolean;
}
