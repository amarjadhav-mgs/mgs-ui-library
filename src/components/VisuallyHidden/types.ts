import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** Every native `<span>` attribute, plus the text for screen readers. */
export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<'span'> {
  /** Text for screen readers only: hidden on screen, still read aloud and part of the accessible name. */
  children?: ReactNode;
}
