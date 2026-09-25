// Enforces ARCHITECTURE.md → Documentation for every MGS component and pattern, current and future:
// each has ComponentName.stories.tsx with the required stories and ComponentName.mdx with the required sections.
import { describe, expect, it } from 'vitest';

const componentIndexes = import.meta.glob('../{components,patterns}/*/index.ts');
const storyModules = import.meta.glob<Record<string, unknown>>(
  '../{components,patterns}/*/*.stories.tsx',
  {
    eager: true,
  },
);
const mdxSources = import.meta.glob<string>('../{components,patterns}/*/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Required story exports; "Variants" may be "Types" for a component with types instead of visual variants. */
const requiredStories = [
  'Playground',
  'Basic',
  ['Variants', 'Types'],
  'States',
  'Sizes',
  'Advanced',
  'Accessibility',
];
const requiredSections = [
  '## When to use',
  '## Import',
  '## Usage',
  '## Examples',
  "## Do and don't",
  '## ERP usage',
  '## Accessibility',
  '## API',
];

const components = Object.keys(componentIndexes).map((path) => {
  const dir = path.slice(0, path.lastIndexOf('/'));
  return { name: dir.slice(dir.lastIndexOf('/') + 1), dir };
});

describe('MGS component documentation', () => {
  it('finds the MGS components', () => {
    expect(components.map((c) => c.name)).toEqual(expect.arrayContaining(['Button', 'IconButton']));
  });

  describe.each(components)('$name', ({ name, dir }) => {
    const stories = storyModules[`${dir}/${name}.stories.tsx`];
    const mdx = mdxSources[`${dir}/${name}.mdx`];

    it(`has ${name}.stories.tsx with the required stories`, () => {
      expect(stories, `${dir}/${name}.stories.tsx is missing`).toBeDefined();
      for (const required of requiredStories) {
        const options = Array.isArray(required) ? required : [required];
        expect(
          options.some((story) => story in stories),
          `missing story: ${options.join(' or ')}`,
        ).toBe(true);
      }
    });

    it('has an Accessibility story with a play function, and Docs come from the MDX (no autodocs)', () => {
      const { Accessibility, default: meta } = stories as {
        Accessibility: { play?: unknown };
        default: { tags?: string[] };
      };
      expect(Accessibility.play).toBeTypeOf('function');
      expect(meta.tags).toContain('!autodocs');
    });

    it(`has ${name}.mdx with the required sections, in order`, () => {
      expect(mdx, `${dir}/${name}.mdx is missing`).toBeDefined();
      expect(mdx).toContain(`<Meta of={${name}Stories} />`);
      expect(mdx).toMatch(new RegExp(`^# ${name}$`, 'm'));
      const positions = requiredSections.map((section) => mdx.indexOf(`\n${section}\n`));
      requiredSections.forEach((section, i) =>
        expect(positions[i], `missing section: ${section}`).toBeGreaterThan(0),
      );
      expect(
        positions.every((position, i) => i === 0 || position > positions[i - 1]),
        'sections are out of order',
      ).toBe(true);
      expect(mdx, 'API shows the generated Controls table').toContain(
        `<Controls of={${name}Stories.Playground} />`,
      );
    });
  });
});
