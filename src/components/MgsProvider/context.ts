import { createContext, useContext } from 'react';
import type { MgsLocale } from './types';

/**
 * The MgsProvider's locale, for MGS components that format values themselves (NumberInput). RSuite components get it
 * through RSuite's own provider. Without an MgsProvider, the default locale applies.
 * Internal: not exported from '@mgs/ui'.
 */
export const MgsLocaleContext = createContext<MgsLocale>('en-GB');

/** The current MGS locale code, e.g. 'en-IN'; a valid BCP 47 tag for `Intl`. */
export const useMgsLocale = () => useContext(MgsLocaleContext);
