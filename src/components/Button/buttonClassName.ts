import { cx } from '../../utils/cx';
import type { ButtonClassNameOptions } from './Button.types';

/**
 * Button classes for elements that must not be a `<button>`, such as links:
 * `<a href="/docs" className={buttonClassName({ variant: 'secondary' })}>Docs</a>`
 */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonClassNameOptions = {}): string {
  return cx(
    'mgs-button',
    `mgs-button--${variant}`,
    `mgs-button--${size}`,
    fullWidth && 'mgs-button--full-width',
    className,
  );
}
