import { compile } from 'sass';

/** One rule of a compiled stylesheet. */
export interface StyleRule {
  selector: string;
  declarations: string;
  /** Inside an `@supports` or `@media` block, its condition; otherwise ''. */
  condition: string;
}

/**
 * The rules of a stylesheet, compiled by Sass: mixins included and nested selectors written out, as browsers get
 * them. For tests that guard how CSS rules compete (hover against invalid), which jsdom can't show.
 *
 * @param path from the repository root: 'src/components/RadioCard/RadioCard.scss'
 */
export function compiledRules(path: string): StyleRule[] {
  const css = compile(path).css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: StyleRule[] = [];
  let condition = '';
  let depth = 0;
  // Walks the blocks: `@supports … {` and `@media … {` open a condition; every other `selector { … }` is a rule.
  for (const match of css.matchAll(/(@[^{}]+)\{|([^{}]+)\{([^{}]*)\}|\}/g)) {
    const [, atRule, selector, declarations] = match;
    if (atRule !== undefined) {
      condition = atRule.trim();
      depth += 1;
    } else if (selector !== undefined) {
      for (const one of selector.split(',')) {
        rules.push({
          selector: one.replace(/\s+/g, ' ').trim(),
          declarations: declarations.replace(/\s+/g, ' ').trim(),
          condition,
        });
      }
    } else {
      depth -= 1;
      if (depth === 0) condition = '';
    }
  }
  return rules;
}

/**
 * How many classes, attribute selectors and pseudo-classes a selector has: the number that decides which of two
 * rules wins, for selectors without ids. `:not()`, `:has()` and `:is()` count as what is inside them; `:where()`
 * counts as nothing.
 */
export function specificity(selector: string) {
  const flat = selector
    .replace(/:where\([^()]*\)/g, '')
    .replace(/:(not|has|is)\(/g, ' ')
    .replace(/\)/g, ' ');
  return (flat.match(/\.[\w-]+|\[[^\]]+\]|(?<!:):(?!:)[\w-]+/g) ?? []).length;
}
