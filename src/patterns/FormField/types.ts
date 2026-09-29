import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

/** Every native `<div>` attribute except the ones MGS defines below. */
type NativeFieldProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export interface FormFieldProps extends NativeFieldProps {
  /** The visible label. It names the control for screen readers. */
  label: ReactNode;
  /**
   * The control: one MGS component (`Input`, `Select`, `RadioGroup`, …). The FormField gives it its `id` and its
   * ARIA attributes; don't set those on the control.
   */
  children: ReactElement;
  /** A hint under the control: the format, where the value is used. Screen readers read it after the label. */
  help?: ReactNode;
  /**
   * The error message. While it is set, the control is marked invalid and gets the error border, and the message
   * replaces nothing: the help stays.
   */
  error?: ReactNode;
  /** Marks the field as required, for the eye (`*`) and for screen readers. @default false */
  required?: boolean;
  /** The `id` of the control. Without it, one is generated. */
  controlId?: string;
}
