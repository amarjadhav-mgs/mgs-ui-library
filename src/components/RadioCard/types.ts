import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * Every native `<input>` attribute except the ones MGS defines below, `type` (always a radio), the ones the
 * `RadioGroup` owns (`checked`, `defaultChecked`, `onChange`, `name`, `required`), and the ones that mean nothing on a
 * radio (`readOnly`, `size`, `color`, `defaultValue`).
 */
type NativeRadioProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'checked'
  | 'defaultChecked'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'name'
  | 'required'
  | 'readOnly'
  | 'size'
  | 'color'
  | 'children'
>;

export interface RadioCardProps extends NativeRadioProps {
  /** What the card stands for: the `RadioGroup`'s value when it is selected. */
  value: string;
  /** The title of the card. It names the radio for screen readers. */
  children?: ReactNode;
  /** More about the option, under the title: a price, what is included. Screen readers read it after the title. */
  description?: ReactNode;
  /** A decorative icon before the title (hidden from screen readers). */
  icon?: ReactNode;
  /** Can't be focused or selected. Set it on the `RadioGroup` to disable every card. @default false */
  disabled?: boolean;
}
