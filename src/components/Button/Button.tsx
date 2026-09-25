import { forwardRef, type MouseEvent } from 'react';
import { Button as RSuiteButton } from 'rsuite';
import type { ButtonBaseProps, ButtonProps, ButtonVariant } from './types';
import './Button.scss';

// How RSuite draws each MGS variant. Only these combinations are used, because they are the ones the MGS theme
// makes meet WCAG AA contrast in every theme (see src/styles/rsuite-bridge.scss).
const rsuiteVariant = {
  primary: { appearance: 'primary' },
  secondary: { appearance: 'default' },
  danger: { appearance: 'primary', color: 'red' },
  ghost: { appearance: 'ghost' },
  link: { appearance: 'link' },
} as const satisfies Record<ButtonVariant, object>;

/**
 * Translates the MGS props shared by Button and IconButton into RSuite Button props.
 * Internal: used by Button and IconButton only, not exported from '@mgs/ui'.
 */
export function toRSuiteButtonProps(
  {
    variant,
    size,
    disabled,
    loading = false,
    className,
    onClick,
    ...rest
  }: ButtonBaseProps & { variant: ButtonVariant },
  baseClassName: string,
) {
  return {
    ...rest,
    ...rsuiteVariant[variant],
    // `size` and `disabled` stay undefined unless set, so RSuite's ButtonGroup can apply the group's values.
    size,
    disabled,
    loading: loading || undefined,
    // The click ripple is motion that ignores "reduce motion"; MGS buttons don't use it.
    ripple: false,
    className: className ? `${baseClassName} ${className}` : baseClassName,
    'data-variant': variant,
    // RSuite shows the spinner and blocks the mouse; MGS adds the busy state and blocks Enter/Space too.
    // The button isn't `disabled` while loading, so it keeps keyboard focus.
    ...(loading && { 'aria-busy': true, 'aria-disabled': true }),
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        event.preventDefault(); // also stops a type="submit" button from submitting its form
        return;
      }
      onClick?.(event);
    },
  };
}

/**
 * Triggers an action (save, submit, delete). For navigation, use a link.
 *
 * @example
 * <Button variant="primary" leftIcon={<PlusIcon />}>Add</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', fullWidth = false, leftIcon, rightIcon, children, ...rest },
  ref,
) {
  return (
    <RSuiteButton
      ref={ref}
      {...toRSuiteButtonProps({ ...rest, variant }, 'mgs-button')}
      block={fullWidth || undefined}
      startIcon={
        leftIcon ? (
          <span className="mgs-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        ) : undefined
      }
      endIcon={
        rightIcon ? (
          <span className="mgs-button__icon" aria-hidden="true">
            {rightIcon}
          </span>
        ) : undefined
      }
    >
      {children}
    </RSuiteButton>
  );
});
