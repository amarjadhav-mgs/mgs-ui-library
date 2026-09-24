import type { ReactNode } from 'react';
import type { ButtonProps } from '../Button/Button.types';

export interface IconButtonProps extends Omit<
  ButtonProps,
  'leftIcon' | 'rightIcon' | 'fullWidth' | 'children'
> {
  /** The icon to show. It is hidden from screen readers; `aria-label` names the button. */
  icon: ReactNode;
  /** Required: describes the action for screen readers, e.g. "Close" or "Delete row". */
  'aria-label': string;
}
