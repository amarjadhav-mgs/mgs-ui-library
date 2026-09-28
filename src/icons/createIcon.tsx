import { forwardRef, type ElementType } from 'react';
import type { MgsIcon, MgsIconProps } from './types';

/**
 * Makes an MGS icon from an @rsuite/icons component: RSuite's artwork, MGS's props.
 * Internal: used by src/icons/index.ts only, not exported from '@mgs/ui'.
 */
export function createIcon(RSuiteIcon: ElementType, displayName: string): MgsIcon {
  const Icon = forwardRef<SVGSVGElement, MgsIconProps>(function Icon(props, ref) {
    // RSuite labels each icon with its own name ("funnel" for FilterIcon). MGS icons are decorative, so the label is
    // removed and the icon stays hidden from screen readers.
    return <RSuiteIcon {...props} ref={ref} aria-label={undefined} aria-hidden />;
  });
  Icon.displayName = displayName;
  return Icon;
}
