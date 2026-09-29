import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** The space between the children: a step of the MGS spacing scale (4, 8, 12, 16, 24px), or none. */
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Every native `<div>` attribute except the ones MGS defines below. */
type NativeStackProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export interface StackProps extends NativeStackProps {
  /** The elements to lay out. */
  children?: ReactNode;
  /** Children under each other (`column`) or next to each other (`row`). @default 'column' */
  direction?: 'column' | 'row';
  /** The space between the children. @default 'md' */
  gap?: StackGap;
  /**
   * Where the children sit across the direction: in a row, their vertical position; in a column, their horizontal
   * position. `stretch` makes them fill it. @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Where the children sit along the direction. `between` pushes the first and last to the ends. @default 'start' */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** In a row: children that don't fit go onto the next line. @default false */
  wrap?: boolean;
}
