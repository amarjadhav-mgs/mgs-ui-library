import type { ReactNode } from 'react';

/**
 * Colour theme.
 * - `light`, `dark`: the MGS brand themes
 * - `high-contrast`: an accessibility theme (yellow on black) for users with low vision
 */
export type MgsTheme = 'light' | 'dark' | 'high-contrast';

/**
 * Language of built-in texts ("Today", "OK", month and day names), the date and time formats, and number formatting:
 * - `en-GB`: `dd/MM/yyyy`, 24-hour time (`HH:mm`), weeks start on Monday, numbers `1,234,567.50`
 * - `en-US`: `MM/dd/yyyy`, 12-hour time (`hh:mm aa`), weeks start on Sunday, numbers `1,234,567.50`
 * - `en-IN`: as `en-GB`, with Indian number grouping `12,34,567.50`
 */
export type MgsLocale = 'en-GB' | 'en-US' | 'en-IN';

export interface MgsProviderProps {
  /** Colour theme for every component. Set it once, at the root of the app. @default 'light' */
  theme?: MgsTheme;
  /** Language, date/time formats and number formatting for every component. @default 'en-GB' */
  locale?: MgsLocale;
  /** The application. */
  children?: ReactNode;
}
