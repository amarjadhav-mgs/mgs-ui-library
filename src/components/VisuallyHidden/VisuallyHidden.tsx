import { forwardRef } from 'react';
import { VisuallyHidden as RSuiteVisuallyHidden } from 'rsuite';
import type { VisuallyHiddenProps } from './types';

/**
 * Text that screen readers read but the screen doesn't show, for context that sighted users get from the layout.
 *
 * @example
 * <Button leftIcon={<TrashIcon />}>
 *   Delete <VisuallyHidden>order 1042</VisuallyHidden>
 * </Button>
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, ...rest }, ref) {
    return (
      <RSuiteVisuallyHidden
        ref={ref}
        {...rest}
        className={className ? `mgs-visually-hidden ${className}` : 'mgs-visually-hidden'}
      />
    );
  },
);
