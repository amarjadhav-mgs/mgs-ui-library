import { readFileSync } from 'node:fs';

/**
 * The source text of a stylesheet, for tests that guard a CSS rule jsdom can't show (a hover or theme rule).
 * Read from disk, so no CSS is loaded into the test page: with real styles there, `toBeVisible()` fails on every
 * control that hides its native input.
 *
 * @param path from the repository root: 'src/components/Radio/Radio.scss'
 */
export function styleSource(path: string) {
  return readFileSync(path, 'utf8');
}
