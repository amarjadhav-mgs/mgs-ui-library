import { forwardRef } from 'react';
import { ButtonGroup as RSuiteButtonGroup } from 'rsuite';
import { useDevWarning } from '../../internal/devWarning';
import type { ButtonGroupProps } from './types';
import './ButtonGroup.scss';

/**
 * Joins buttons that belong together into one block: a view switcher, a set of related actions. Name the group with
 * `aria-label` or `aria-labelledby`. For buttons in a row with space between them, use `Stack`.
 *
 * Built on RSuite's ButtonGroup, which passes `size` and `disabled` to the buttons and joins their corners.
 *
 * @example
 * <ButtonGroup aria-label="View">
 *   <Button>List</Button>
 *   <Button>Board</Button>
 * </ButtonGroup>
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { size, disabled = false, orientation = 'horizontal', fullWidth = false, className, ...rest },
  ref,
) {
  useDevWarning(
    rest['aria-label'] === undefined && rest['aria-labelledby'] === undefined,
    'a ButtonGroup needs an accessible name: add aria-label or aria-labelledby.',
  );

  return (
    <RSuiteButtonGroup
      ref={ref}
      {...rest}
      className={className ? `mgs-button-group ${className}` : 'mgs-button-group'}
      size={size}
      disabled={disabled || undefined}
      vertical={orientation === 'vertical' || undefined}
      justified={fullWidth || undefined}
      data-orientation={orientation}
    />
  );
});
