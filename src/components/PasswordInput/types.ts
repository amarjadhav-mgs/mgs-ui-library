import type { InputProps } from '../Input/types';

/**
 * Input's props, without `type`. Every attribute goes to the `<input>` (labels, `aria-*`, `required`, `ref`), except
 * `className` and `style`, which go to the field's outer wrapper for layout.
 */
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * Tells password managers what to fill: `current-password` on sign-in, `new-password` on sign-up and password change.
   * @default 'current-password'
   */
  autoComplete?: string;
}
