import { CustomProvider } from 'rsuite';
import { enGB, enUS } from 'rsuite/locales';
import type { MgsLocale, MgsProviderProps } from './types';

// RSuite's locale for each MGS locale. It holds the texts and the date and time formats the pickers use by default
// (shortDateFormat, shortTimeFormat), so choosing a locale also chooses the formats.
const rsuiteLocales = { 'en-GB': enGB, 'en-US': enUS } as const satisfies Record<MgsLocale, object>;

/**
 * Sets the theme and the locale for every MGS component. Render one, at the root of the app.
 *
 * @example
 * <MgsProvider theme="light" locale="en-GB">
 *   <App />
 * </MgsProvider>
 */
export function MgsProvider({ theme = 'light', locale = 'en-GB', children }: MgsProviderProps) {
  return (
    <CustomProvider
      // Puts the theme class (rs-theme-dark, …) on <body>, which switches the MGS semantic tokens (themes.scss).
      theme={theme}
      locale={rsuiteLocales[locale]}
      // The click ripple (Pagination, Nav items, …) is motion that ignores "reduce motion"; MGS doesn't use it.
      disableRipple
    >
      {children}
    </CustomProvider>
  );
}
