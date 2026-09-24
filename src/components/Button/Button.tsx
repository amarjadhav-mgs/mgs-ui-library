import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import './Button.scss';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  const classes = [
    'mgs-button',
    `mgs-button--${variant}`,
    `mgs-button--${size}`,
    fullWidth && 'mgs-button--full-width',
    loading && 'mgs-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="mgs-button__spinner" aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className="mgs-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children != null && <span className="mgs-button__label">{children}</span>}
      {rightIcon && (
        <span className="mgs-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
