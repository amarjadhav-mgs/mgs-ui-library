import type { ReactNode } from 'react';

/**
 * Colour theme.
 * - `light`, `dark`: the MGS brand themes
 * - `high-contrast`: an accessibility theme (yellow on black) for users with low vision
 */
export type MgsTheme = 'light' | 'dark' | 'high-contrast';

/**
 * Language of built-in texts ("Today", "OK", month and day names) and the date and time formats:
 * - `en-GB`: `dd/MM/yyyy`, 24-hour time (`HH:mm`), weeks start on Monday
 * - `en-US`: `MM/dd/yyyy`, 12-hour time (`hh:mm aa`), weeks start on Sunday
 */
export type MgsLocale = 'en-GB' | 'en-US';

export interface MgsProviderProps {
  /** Colour theme for every component. Set it once, at the root of the app. @default 'light' */
  theme?: MgsTheme;
  /** Language and date/time formats for every component. @default 'en-GB' */
  locale?: MgsLocale;
  /** The application. */
  children?: ReactNode;
}
