import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { InputSize } from '../Input/types';

/** Every native `<div>` attribute (without `color`, which RSuite reads as a CSS style prop). */
export interface InputGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'color'> {
  /** An `Input` (or `PasswordInput`), with `InputGroupAddon`s and `InputGroupButton`s around it. */
  children?: ReactNode;
  /** Size of everything in the group, including the input. @default 'md' */
  size?: InputSize;
  /** Disables the input, the add-ons and the buttons together. @default false */
  disabled?: boolean;
  /**
   * Add-ons inside the input's border (search icons, clear buttons) instead of attached boxes (currency, units,
   * prefixes). @default false
   */
  inside?: boolean;
}

/** Text or an icon next to the input. Every native `<span>` attribute (without `color`). */
export interface InputGroupAddonProps extends Omit<ComponentPropsWithoutRef<'span'>, 'color'> {
  /** Text (`₹`, `kg`, `https://`) or an icon. Icons are decorative. */
  children?: ReactNode;
}

/**
 * A button attached to the input. Every native `<button>` attribute; `type` is `"button"` by default. Give an
 * icon-only button an `aria-label`. `color` and `onToggle` are left out: RSuite would read them as its own props.
 */
export interface InputGroupButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'color' | 'onToggle'
> {
  /** The label, or an icon with an `aria-label` on the button. */
  children?: ReactNode;
}
