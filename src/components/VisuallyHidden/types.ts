import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * Every native `<span>` attribute, plus the text for screen readers. `color` is left out: RSuite reads it as a CSS
 * style prop, and hidden text has no colour to set.
 */
export interface VisuallyHiddenProps extends Omit<ComponentPropsWithoutRef<'span'>, 'color'> {
  /** Text for screen readers only: hidden on screen, still read aloud and part of the accessible name. */
  children?: ReactNode;
}
