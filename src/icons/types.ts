import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

/**
 * Props of every MGS icon: SVG attributes (`className`, `style`, `width`, `data-*`, …). Icons are decorative: they
 * are hidden from screen readers, sized `1em` and coloured with `currentColor`, so they follow the text around them.
 * Change the size with `font-size` and the colour with `color`. The button or text next to an icon carries its
 * meaning, so icons take no `aria-label` or `role`.
 */
export interface MgsIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  // rotate and viewBox are SVG attributes, but RSuite reads them to rotate or re-frame its artwork.
  'ref' | 'children' | 'aria-hidden' | 'aria-label' | 'role' | 'rotate' | 'viewBox'
> {
  // TypeScript accepts any hyphenated JSX attribute that a type doesn't declare, so leaving these out isn't enough.
  'aria-label'?: never;
  'aria-hidden'?: never;
}

/** An MGS icon component, such as `PlusIcon`. `ref` points at the `<svg>`. */
export type MgsIcon = ForwardRefExoticComponent<MgsIconProps & RefAttributes<SVGSVGElement>>;
