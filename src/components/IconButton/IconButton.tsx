import { forwardRef } from 'react';
import { IconButton as RSuiteIconButton } from 'rsuite';
import { toRSuiteButtonProps } from '../Button/Button';
import type { IconButtonProps } from './types';
import './IconButton.scss';

/**
 * A square button showing only an icon. It needs an accessible name: `aria-label`, or `aria-labelledby` pointing at
 * visible text.
 *
 * @example
 * <IconButton aria-label="Delete row" variant="danger"><TrashIcon /></IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'secondary', children, ...rest },
  ref,
) {
  return (
    <RSuiteIconButton
      ref={ref}
      {...toRSuiteButtonProps({ ...rest, variant }, 'mgs-icon-button')}
      // The icon is decorative; the button's name comes from aria-label or aria-labelledby. The wrapper hides any icon,
      // including custom ones that don't accept aria-hidden, as Button does.
      icon={
        <span className="mgs-icon-button__icon" aria-hidden="true">
          {children}
        </span>
      }
    />
  );
});
