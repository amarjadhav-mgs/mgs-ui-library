// jsdom doesn't compute CSS, so these tests read the theme source. They guard rules that browsers would only show as
// a wrong colour, in one theme, after an app customizes the tokens.
import { describe, expect, it } from 'vitest';
// The raw source: vite.config.ts → test.css lets this one stylesheet through (other CSS imports are empty in tests).
import themes from './themes.scss?raw';

/** The declarations of the first rule whose selector contains `selector`. */
function block(selector: string) {
  const start = themes.indexOf(`${selector}) {`);
  expect(start, `no block for ${selector}`).toBeGreaterThan(-1);
  return themes.slice(start, themes.indexOf('\n}', start));
}

describe('themes.scss', () => {
  it('dark mode does not re-declare the brand tokens, so :root overrides from apps reach it', () => {
    const dark = block(":is([data-theme='dark'], .rs-theme-dark");
    for (const token of [
      '--mgs-color-primary',
      '--mgs-color-on-primary',
      '--mgs-color-danger',
      '--mgs-color-on-danger',
    ]) {
      expect(dark, `${token} in the dark block`).not.toMatch(new RegExp(`${token}(-\\w+)?:`));
    }
  });

  it.each(['--mgs-color-border-error', '--mgs-color-surface-readonly'])(
    'every theme declares %s (it points at theme-dependent colours)',
    (token) => {
      expect(themes.match(new RegExp(`${token}:`, 'g'))).toHaveLength(3);
    },
  );
});
