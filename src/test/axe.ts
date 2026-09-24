import axe from 'axe-core';

/** Runs axe on a rendered container and returns its violations (empty = accessible). */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    // jsdom has no layout engine, so contrast can't be measured here; Storybook's a11y panel covers it.
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations;
}
