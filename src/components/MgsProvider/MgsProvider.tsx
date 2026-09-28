import { useEffect } from 'react';
import { CustomProvider } from 'rsuite';
import { enGB, enUS } from 'rsuite/locales';
import type { MgsLocale, MgsProviderProps } from './types';

// RSuite's locale for each MGS locale. It holds the texts and the date and time formats the pickers use by default
// (shortDateFormat, shortTimeFormat), so choosing a locale also chooses the formats.
const rsuiteLocales = { 'en-GB': enGB, 'en-US': enUS } as const satisfies Record<MgsLocale, object>;

// The theme class lives on <body>, shared by every mounted provider. Only the last one to unmount removes it, so nested
// providers (and React StrictMode's remount) keep the page themed.
const themeClasses = ['rs-theme-light', 'rs-theme-dark', 'rs-theme-high-contrast'];
let mountedProviders = 0;

/**
 * Sets the theme and the locale for every MGS component. Render one, at the root of the app.
 *
 * @example
 * <MgsProvider theme="light" locale="en-GB">
 *   <App />
 * </MgsProvider>
 */
export function MgsProvider({ theme = 'light', locale = 'en-GB', children }: MgsProviderProps) {
  useEffect(() => {
    mountedProviders += 1;
    return () => {
      mountedProviders -= 1;
      if (mountedProviders === 0) document.body.classList.remove(...themeClasses);
    };
  }, []);

  return (
    <CustomProvider
      // Puts the theme class (rs-theme-dark, …) on <body>, which switches the MGS semantic tokens (themes.scss).
      theme={theme}
      locale={rsuiteLocales[locale]}
      // The click ripple (Pagination, Nav items, …) is motion that ignores "reduce motion"; MGS doesn't use it.
      disableRipple
      // @rsuite/icons would inject a <style> tag at runtime, which strict CSPs block; the same rules ship in styles.css
      // (src/styles/rsuite-icons.scss).
      disableInlineStyles
    >
      {children}
    </CustomProvider>
  );
}
