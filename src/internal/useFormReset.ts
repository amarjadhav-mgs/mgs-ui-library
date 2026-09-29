import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onReset` after the form around `ref` was reset (a Reset button, or `form.reset()`). A reset puts native
 * controls back to how they started without telling React, so a component that keeps its own value must follow.
 *
 * Not called when the reset was cancelled (`onReset` with `preventDefault()`). That is only known after every
 * listener has run, so `onReset` is called a moment later, not during the event.
 * Internal: not exported from '@mgs/ui'.
 *
 * @param enabled `false` for a controlled component: its value belongs to the app.
 */
export function useFormReset(
  ref: RefObject<HTMLElement | null>,
  onReset: () => void,
  enabled: boolean,
) {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });

  useEffect(() => {
    const form = ref.current?.closest('form');
    if (!form || !enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const listener = (event: Event) => {
      timer = setTimeout(() => {
        if (!event.defaultPrevented) latest.current();
      });
    };
    form.addEventListener('reset', listener);
    return () => {
      form.removeEventListener('reset', listener);
      clearTimeout(timer);
    };
  }, [ref, enabled]);
}
