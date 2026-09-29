import { useEffect } from 'react';

// Bundlers replace `process.env.NODE_ENV` with a string when they build an app, so production builds log nothing.
// The library build leaves it in place for the app's bundler. Not guarded with `typeof process`: bundlers replace only
// the full expression, and `typeof process` is 'undefined' in the browser, which would silence every warning.
declare const process: { env: { NODE_ENV?: string } };

/** Each message is logged once, not once per component: a table of 100 rows gives one warning. */
const warned = new Set<string>();

/**
 * Warns in the console, in development only, while `problem` is true: for mistakes TypeScript can't catch, like a
 * control without an accessible name.
 * Internal: not exported from '@mgs/ui'.
 */
export function useDevWarning(problem: boolean, message: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && problem && !warned.has(message)) {
      warned.add(message);
      console.warn(`@mgs/ui: ${message}`);
    }
  }, [problem, message]);
}

/** Forgets which messages were logged, so each test starts clean. Internal: for the library's own tests. */
export function resetDevWarnings() {
  warned.clear();
}
