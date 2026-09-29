import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ButtonSize } from '../Button/types';

/** How the buttons of a group are laid out. */
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * Every native `<div>` attribute except the ones MGS defines below, `role` (always a group), and `color`, which RSuite
 * would read as its own prop.
 */
type NativeGroupProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'children' | 'color'>;

export interface ButtonGroupProps extends NativeGroupProps {
  /** The buttons: `Button` and `IconButton`. */
  children?: ReactNode;
  /** Size of every button in the group that doesn't set its own. @default 'md' */
  size?: ButtonSize;
  /** Disables every button in the group. @default false */
  disabled?: boolean;
  /** Buttons next to each other, or under each other. @default 'horizontal' */
  orientation?: ButtonGroupOrientation;
  /** Fills the width of the container, with buttons of equal width. @default false */
  fullWidth?: boolean;
}
