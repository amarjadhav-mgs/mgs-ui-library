import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';

/** Switch size, the MGS scale. */
export type SwitchSize = 'sm' | 'md' | 'lg';

/**
 * Every native `<input>` attribute except the ones MGS defines below, `type` and `role` (always a switch), and the
 * ones that mean nothing on a switch: `readOnly` (HTML has no read-only checkbox; use `disabled`), `color` and
 * `defaultValue`.
 */
type NativeSwitchProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'role'
  | 'checked'
  | 'defaultChecked'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'readOnly'
  | 'size'
  | 'color'
  | 'children'
>;

export interface SwitchProps extends NativeSwitchProps {
  /**
   * The visible label; clicking it turns the switch on or off. Without one (a table row), name the switch with
   * `aria-label` or `aria-labelledby`. The name says what is switched ("Email notifications"), not the state.
   */
  children?: ReactNode;
  /** Whether it is on, for a controlled switch. Use with `onChange`. */
  checked?: boolean;
  /** Whether it starts on, for an uncontrolled switch. @default false */
  defaultChecked?: boolean;
  /** Called when the user turns it on or off, with the new state first. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Size, the same scale as Button and Input. @default 'md' */
  size?: SwitchSize;
  /**
   * Busy: the change is being saved. Shows a spinner, sets `aria-busy`, and ignores clicks and keys, but keeps
   * keyboard focus. @default false
   */
  loading?: boolean;
  /** Can't be focused or changed, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** What a form submits with `name` when the switch is on (`on` when not set). */
  value?: string;
}
