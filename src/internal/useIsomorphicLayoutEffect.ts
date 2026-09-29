import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, so a DOM change is made before the screen is painted; `useEffect` on the server,
 * where React 18 warns about layout effects.
 * Internal: not exported from '@mgs/ui'.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
