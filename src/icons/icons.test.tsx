import { createRef, type ComponentType } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as publicApi from '@mgs/ui';
import { FilterIcon, PlusIcon } from '@mgs/ui';
import * as mgsIcons from './index';
import { axeViolations } from '../test/axe';
import * as stories from './Icons.stories';

const icons = Object.entries(mgsIcons) as [string, ComponentType][];
const publicExports = new Map<string, unknown>(Object.entries(publicApi));

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's size is hidden; set font-size */}
    <PlusIcon size="2em" />
    {/* @ts-expect-error RSuite's spin is hidden */}
    <PlusIcon spin />
    {/* @ts-expect-error RSuite's rotate is hidden; use a CSS transform */}
    <PlusIcon rotate={90} />
    {/* @ts-expect-error RSuite's as would swap the artwork */}
    <PlusIcon as="span" />
    {/* @ts-expect-error RSuite's viewBox would re-frame the artwork */}
    <PlusIcon viewBox="0 0 8 8" />
    {/* @ts-expect-error icons are decorative; name the button or text next to them */}
    <PlusIcon aria-label="Add" />
    {/* @ts-expect-error icons are always hidden from screen readers */}
    <PlusIcon aria-hidden={false} />
    {/* @ts-expect-error icons take no role; they are always hidden */}
    <PlusIcon role="presentation" />
  </>
);

describe('MGS icons', () => {
  it('are all exported from @mgs/ui with an ...Icon name', () => {
    expect(icons).toHaveLength(34);
    for (const [name, Icon] of icons) {
      expect(name).toMatch(/^[A-Z]\w*Icon$/);
      expect(publicExports.get(name)).toBe(Icon);
      expect((Icon as { displayName?: string }).displayName).toBe(name);
    }
  });

  it.each(icons)(
    '%s renders a decorative 1em svg in currentColor, without a label',
    (_name, Icon) => {
      const { container } = render(<Icon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
      expect(svg).toHaveAttribute('width', '1em');
      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg).not.toHaveAttribute('aria-label');
    },
  );

  it('passes SVG attributes, className and style to the <svg>, and forwards ref', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(
      <FilterIcon ref={ref} className="custom" style={{ color: 'red' }} data-testid="filter" />,
    );
    const svg = container.querySelector('svg');
    expect(ref.current).toBe(svg);
    expect(svg).toHaveClass('custom');
    expect(svg).toHaveAttribute('data-testid', 'filter');
    expect(svg).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('do not accept RSuite props or a label (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });

  it('gallery has no axe violations', async () => {
    const { Gallery } = composeStories(stories);
    const { container } = render(<Gallery />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
