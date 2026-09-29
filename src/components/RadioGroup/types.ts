import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';

/** How the radios of a group are laid out. */
export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** Every native `<div>` attribute except the ones MGS defines below, and `role` (always a radio group). */
type NativeGroupProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'defaultValue' | 'onChange' | 'children'
>;

export interface RadioGroupProps extends NativeGroupProps {
  /** The radios, each with a `value`. They can be nested in other elements. */
  children?: ReactNode;
  /** The value of the selected radio, for a controlled group; `null` when none is selected. Use with `onChange`. */
  value?: string | null;
  /** The value selected at the start, for an uncontrolled group. Without it, none is selected. */
  defaultValue?: string;
  /** Called when the user selects a radio, with its value first. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Radios under each other, or next to each other (wrapping when the row is full). @default 'vertical' */
  orientation?: RadioGroupOrientation;
  /** Disables every radio in the group. @default false */
  disabled?: boolean;
  /**
   * The `name` a form submits the selected value with. Without it, the group still gives its radios one generated
   * name, which the keyboard needs, and a form submits it under that name: set `name` in forms.
   */
  name?: string;
  /** One of the radios must be selected before the form can be submitted. @default false */
  required?: boolean;
}
