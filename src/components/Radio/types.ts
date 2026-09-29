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

export interface RadioProps extends NativeRadioProps {
  /** What the radio stands for: the `RadioGroup`'s value when it is selected. */
  value: string;
  /**
   * The visible label; clicking it selects the radio. Without one (a table row), name the radio with `aria-label` or
   * `aria-labelledby`.
   */
  children?: ReactNode;
  /** Can't be focused or selected. Set it on the `RadioGroup` to disable every radio. @default false */
  disabled?: boolean;
}
