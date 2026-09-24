import { forwardRef } from 'react';
import { Button } from '../Button/Button';
import { cx } from '../../utils/cx';
import type { IconButtonProps } from './IconButton.types';

/** A square button that shows only an icon. Same variants, sizes and loading as Button. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, className, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      className={cx('mgs-button--icon-only', className)}
      leftIcon={icon}
      {...rest}
    />
  );
});
