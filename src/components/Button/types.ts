import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * Visual style. Every variant meets WCAG AA contrast in the light, dark and high-contrast themes.
 * - `primary`: the single most important action in a view (Save, Create)
 * - `secondary`: normal actions (Cancel, Export, Edit)
 * - `danger`: destructive actions (Delete)
 * - `ghost`: outlined, for secondary actions on busy backgrounds
 * - `link`: looks like a text link, for low-emphasis actions
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';

/** Control size, shared by every MGS control. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props shared by `Button` and `IconButton`: every native `<button>` attribute plus the MGS props.
 * `color` and `onToggle` are left out: they are no-ops on a button, and RSuite would read them as its own props.
 */
export interface ButtonBaseProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'color' | 'onToggle'
> {
  /** Size. Inside a `ButtonGroup`, the group's `size` is used when this is not set. @default 'md' */
  size?: ButtonSize;
  /** Not interactive: can't be focused or clicked. Prefer an enabled button that explains what's missing. @default false */
  disabled?: boolean;
  /**
   * Busy: shows a spinner in place of the content, sets `aria-busy`, and ignores clicks and Enter/Space.
   * The button keeps its width, its accessible name and keyboard focus. @default false
   */
  loading?: boolean;
}

export interface ButtonProps extends ButtonBaseProps {
  /** Visual style. @default 'secondary' */
  variant?: ButtonVariant;
  /** Stretches the button to the full width of its container. @default false */
  fullWidth?: boolean;
  /** Decorative icon before the label, e.g. `<PlusIcon />`. Hidden from screen readers. */
  leftIcon?: ReactNode;
  /** Decorative icon after the label, e.g. `<ChevronRightIcon />`. Hidden from screen readers. */
  rightIcon?: ReactNode;
  /** The label. It is the button's accessible name. */
  children?: ReactNode;
}
