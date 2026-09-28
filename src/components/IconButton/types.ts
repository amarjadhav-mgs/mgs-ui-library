import type { ReactElement } from 'react';
import type { ButtonBaseProps, ButtonVariant } from '../Button/types';

/** Button variants that make sense without a label (`link` needs text). */
export type IconButtonVariant = Exclude<ButtonVariant, 'link'>;

interface IconButtonBaseProps extends Omit<
  ButtonBaseProps,
  'children' | 'aria-label' | 'aria-labelledby'
> {
  /** The icon, e.g. `<TrashIcon />`. It is hidden from screen readers; the name comes from `aria-label`. */
  children: ReactElement;
  /** Visual style. @default 'secondary' */
  variant?: IconButtonVariant;
}

/**
 * An icon-only button has no visible text, so one accessible name is required: `aria-label`, or `aria-labelledby`
 * pointing at visible text that already names the action.
 */
type IconButtonName =
  | {
      /** Names the action for screen readers, e.g. "Delete row", not "Trash". */
      'aria-label': string;
      'aria-labelledby'?: never;
    }
  | {
      /** The `id` of visible text that names the action, e.g. a table row's title. */
      'aria-labelledby': string;
      'aria-label'?: never;
    };

export type IconButtonProps = IconButtonBaseProps & IconButtonName;
