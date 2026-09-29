import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * Every native `<input>` attribute except the ones MGS defines below, `type` (always a checkbox), and the ones that
 * mean nothing on a checkbox: `readOnly` (HTML has no read-only checkbox; use `disabled`), `size`, `color` and
 * `defaultValue`.
 */
type NativeCheckboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
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

export interface CheckboxProps extends NativeCheckboxProps {
  /**
   * The visible label; clicking it toggles the checkbox. Without one (a table row), name the checkbox with
   * `aria-label` or `aria-labelledby`.
   */
  children?: ReactNode;
  /** Whether it is checked, for a controlled checkbox. Use with `onChange`. Inside a `CheckboxGroup`, the group decides. */
  checked?: boolean;
  /** Whether it starts checked, for an uncontrolled checkbox. @default false */
  defaultChecked?: boolean;
  /** Called when the user checks or unchecks it, with the new state first. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Shows a dash instead of a check mark: some, but not all, of the items it stands for are selected ("Select all").
   * Only the look and what screen readers announce ("mixed"); `checked` stays what you set. @default false
   */
  indeterminate?: boolean;
  /**
   * What the checkbox stands for: its value in a `CheckboxGroup`, and what a form submits with `name` when it is
   * checked (`on` when not set).
   */
  value?: string;
  /** Can't be focused or changed, and isn't submitted with a form. @default false */
  disabled?: boolean;
}
