import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';

/** How the checkboxes of a group are laid out. */
export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

/** Every native `<div>` attribute except the ones MGS defines below, and `role` (always a group). */
type NativeGroupProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'defaultValue' | 'onChange' | 'children'
>;

export interface CheckboxGroupProps extends NativeGroupProps {
  /** The checkboxes, each with a `value`. They can be nested in other elements. */
  children?: ReactNode;
  /** The values of the checked checkboxes, for a controlled group. Use with `onChange`. */
  value?: string[];
  /** The values checked at the start, for an uncontrolled group. @default [] */
  defaultValue?: string[];
  /** Called when the user checks or unchecks a checkbox, with the new values first, in the order they were checked. */
  onChange?: (value: string[], event: ChangeEvent<HTMLInputElement>) => void;
  /** Checkboxes under each other, or next to each other (wrapping when the row is full). @default 'vertical' */
  orientation?: CheckboxGroupOrientation;
  /** Disables every checkbox in the group. @default false */
  disabled?: boolean;
  /** The `name` of every checkbox in the group: a form submits one `name=value` for each checked one. */
  name?: string;
}
