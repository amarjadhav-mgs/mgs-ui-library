import { forwardRef } from 'react';
import type { StackProps } from './types';
import './Stack.scss';

/**
 * Lays out its children in a column or a row, with the same space between them: the fields of a form, the buttons
 * under it, the actions of a toolbar. It has no look of its own.
 *
 * Built by MGS: a `<div>` with flexbox and the MGS spacing scale.
 *
 * @example
 * <Stack direction="row" gap="sm" justify="end">
 *   <Button>Cancel</Button>
 *   <Button variant="primary">Save</Button>
 * </Stack>
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={className ? `mgs-stack ${className}` : 'mgs-stack'}
      data-direction={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
    />
  );
});
