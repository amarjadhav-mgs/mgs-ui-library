import { forwardRef, useEffect, type MouseEvent } from 'react';
import { cx } from '../../utils/cx';
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
    onClick,
    ...rest
  },
  ref,
) {
  const hasLabel = children != null && children !== false && children !== '';

  const ariaLabel = rest['aria-label'];
  const ariaLabelledBy = rest['aria-labelledby'];

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasLabel && !ariaLabel && !ariaLabelledBy) {
      console.warn(
        '[@mgs/ui] Button: icon-only buttons need an `aria-label` (or `aria-labelledby`) so screen readers can announce them.',
      );
    }
  }, [hasLabel, ariaLabel, ariaLabelledBy]);

  // While loading we use aria-disabled instead of `disabled`, so the button keeps
  // keyboard focus and stays discoverable to screen readers; clicks are blocked here.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'mgs-button',
        `mgs-button--${variant}`,
        `mgs-button--${size}`,
        fullWidth && 'mgs-button--full-width',
        loading && 'mgs-button--loading',
        className,
      )}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
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
      {hasLabel && <span className="mgs-button__label">{children}</span>}
      {rightIcon && (
        <span className="mgs-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
