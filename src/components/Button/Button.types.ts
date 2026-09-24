import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant;
  /** Control size. @default 'md' */
  size?: ButtonSize;
  /**
   * Shows a centered spinner over the content and blocks clicks. The width stays the same,
   * and the button stays focusable (uses `aria-disabled`, not `disabled`) so keyboard users
   * don't lose their place. @default false
   */
  loading?: boolean;
  /** Stretches the button to its container width. @default false */
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  leftIcon?: ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: ReactNode;
}

export interface ButtonClassNameOptions {
  /** @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** @default false */
  fullWidth?: boolean;
  /** Extra classes appended after the button classes. */
  className?: string;
}
