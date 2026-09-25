// Enforces ARCHITECTURE.md → Documentation for every MGS component and pattern, current and future:
// each has ComponentName.stories.tsx with the stories its concepts call for, and ComponentName.mdx with the standard
// sections, in order, and no others.
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

/** Stories every component has. */
const foundationalStories = ['Playground', 'Basic', 'Accessibility'];

/**
 * Stories required only when the component has the concept, read from the props its stories document in `argTypes`.
 * A component without the concept must not invent the story.
 */
const conceptStories = [
  { stories: ['Variants', 'Types'], props: ['variant', 'type'] },
  {
    stories: ['States'],
    props: ['disabled', 'loading', 'readOnly', 'invalid', 'selected', 'checked', 'open'],
  },
  { stories: ['Sizes'], props: ['size'] },
];

/**
 * Every component has an `Advanced` story ("Advanced examples") unless it is listed here, with the reason it has no
 * realistic composed usage to show.
 */
const withoutAdvancedExamples: Record<string, string> = {};

/** MDX `##` sections, in this order; `## Customizing` may follow, only when useful. */
const requiredSections = [
  'When to use',
  'Import',
  'Usage',
  'Examples',
  "Do and don't",
  'Accessibility',
  'API',
];
const optionalLastSection = 'Customizing';

const components = Object.keys(componentIndexes).map((path) => {
  const dir = path.slice(0, path.lastIndexOf('/'));
  return { name: dir.slice(dir.lastIndexOf('/') + 1), dir };
});

/** The `##` headings of an MDX file, ignoring fenced code blocks. */
function sectionsOf(mdx: string) {
  return mdx
    .replace(/^```[\s\S]*?^```/gm, '')
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim());
}

describe('MGS component documentation', () => {
  it('finds the MGS components', () => {
    expect(components.map((c) => c.name)).toEqual(expect.arrayContaining(['Button', 'IconButton']));
  });

  describe.each(components)('$name', ({ name, dir }) => {
    const stories = storyModules[`${dir}/${name}.stories.tsx`];
    const mdx = mdxSources[`${dir}/${name}.mdx`];

    it(`has ${name}.stories.tsx with the foundational stories`, () => {
      expect(stories, `${dir}/${name}.stories.tsx is missing`).toBeDefined();
      for (const story of foundationalStories) {
        expect(story in stories, `missing story: ${story}`).toBe(true);
      }
    });

    it('has a story for each concept the component has, and none for concepts it lacks', () => {
      const meta = stories.default as { argTypes?: Record<string, unknown> };
      const props = Object.keys(meta.argTypes ?? {});
      for (const concept of conceptStories) {
        const hasConcept = concept.props.some((prop) => props.includes(prop));
        const hasStory = concept.stories.some((story) => story in stories);
        const storyNames = concept.stories.join(' / ');
        const propNames = concept.props.join(', ');
        expect(
          hasStory,
          `${storyNames}: ${hasConcept ? 'missing' : 'present'}, but the component ${hasConcept ? 'has one of' : 'has none of'} ${propNames}`,
        ).toBe(hasConcept);
      }
    });

    it('has Advanced examples, or a listed reason why not', () => {
      const exemption = withoutAdvancedExamples[name];
      expect(
        'Advanced' in stories,
        `Advanced examples: ${exemption ? `exempt (${exemption}) but present` : 'missing'}`,
      ).toBe(!exemption);
    });

    it('has an Accessibility story with a play function, and Docs come from the MDX (no autodocs)', () => {
      const { Accessibility, default: meta } = stories as {
        Accessibility: { play?: unknown };
        default: { tags?: string[] };
      };
      expect(Accessibility.play).toBeTypeOf('function');
      expect(meta.tags).toContain('!autodocs');
    });

    it(`has ${name}.mdx with exactly the standard sections, in order`, () => {
      expect(mdx, `${dir}/${name}.mdx is missing`).toBeDefined();
      expect(mdx).toContain(`<Meta of={${name}Stories} />`);
      expect(mdx).toMatch(new RegExp(`^# ${name}$`, 'm'));
      const sections = sectionsOf(mdx);
      const expected =
        sections[sections.length - 1] === optionalLastSection
          ? [...requiredSections, optionalLastSection]
          : requiredSections;
      expect(sections).toEqual(expected);
      expect(mdx, 'API shows the generated Controls table').toContain(
        `<Controls of={${name}Stories.Playground} />`,
      );
    });
  });
});
