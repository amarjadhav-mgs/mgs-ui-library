import { cloneElement, forwardRef, type ReactElement } from 'react';
import { IconButton as RSuiteIconButton } from 'rsuite';
import { toRSuiteButtonProps } from '../Button/Button';
import type { IconButtonProps } from './types';
import './IconButton.scss';

/**
 * A square button showing only an icon. `aria-label` is required: it is the button's accessible name.
 *
 * @example
 * <IconButton aria-label="Delete row" variant="danger"><TrashIcon /></IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'secondary', children, ...rest },
  ref,
) {
  // The icon is decorative; the button's aria-label names it. MGS icons are already hidden, custom ones may not be.
  const icon = cloneElement(children as ReactElement<{ 'aria-hidden'?: boolean }>, {
    'aria-hidden': true,
  });

  return (
    <RSuiteIconButton
      ref={ref}
      {...toRSuiteButtonProps({ ...rest, variant }, 'mgs-icon-button')}
      icon={icon}
    />
  );
});
