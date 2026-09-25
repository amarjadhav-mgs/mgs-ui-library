import type { ReactElement } from 'react';
import type { ButtonBaseProps, ButtonVariant } from '../Button/types';

/** Button variants that make sense without a label (`link` needs text). */
export type IconButtonVariant = Exclude<ButtonVariant, 'link'>;

export interface IconButtonProps extends Omit<ButtonBaseProps, 'children' | 'aria-label'> {
  /**
   * Required: names the action for screen readers, e.g. "Delete row", not "Trash".
   * An icon-only button has no visible text, so this is its accessible name.
   */
  'aria-label': string;
  /** The icon, e.g. `<TrashIcon />`. It is hidden from screen readers; `aria-label` names the button. */
  children: ReactElement;
  /** Visual style. @default 'secondary' */
  variant?: IconButtonVariant;
}
