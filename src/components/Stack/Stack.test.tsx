import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stack } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { compiledRules } from '../../test/compiledStyle';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Stack.stories';

const allStories = composeStories(stories);
const rules = compiledRules('src/components/Stack/Stack.scss');

/** The declarations of the compiled rule with exactly this selector. */
const declarations = (selector: string) =>
  rules.find((rule) => rule.selector === selector)?.declarations ?? '';

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's spacing is hidden; use gap, a step of the MGS scale */}
    <Stack spacing={8} />
    {/* @ts-expect-error gap is a step of the scale, not a number */}
    <Stack gap={8} />
    {/* @ts-expect-error gap is a step of the scale */}
    <Stack gap="xxl" />
    {/* @ts-expect-error RSuite's alignItems is hidden; use align */}
    <Stack alignItems="center" />
    {/* @ts-expect-error RSuite's justifyContent is hidden; use justify */}
    <Stack justifyContent="center" />
    {/* @ts-expect-error column or row */}
    <Stack direction="row-reverse" />
    {/* @ts-expect-error RSuite's divider is hidden */}
    <Stack divider="|" />
    {/* @ts-expect-error RSuite's as is hidden */}
    <Stack as="ul" />
  </>
);

describe('Stack stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Stack', () => {
  it('renders a <div> with its children, as a column with the md gap by default', () => {
    render(
      <Stack data-testid="stack">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    const stack = screen.getByTestId('stack');
    expect(stack.tagName).toBe('DIV');
    expect(stack).toHaveClass('mgs-stack');
    expect(stack).toHaveAttribute('data-direction', 'column');
    expect(stack).toHaveAttribute('data-gap', 'md');
    expect(stack).toHaveAttribute('data-align', 'stretch');
    expect(stack).toHaveAttribute('data-justify', 'start');
    expect(stack).not.toHaveAttribute('data-wrap');
    expect(stack).not.toHaveAttribute('role');
    expect(stack).toHaveTextContent('OneTwo');
  });

  it('marks direction, gap, align, justify and wrap for the styles', () => {
    render(
      <Stack data-testid="stack" direction="row" gap="xl" align="center" justify="between" wrap />,
    );
    const stack = screen.getByTestId('stack');
    expect(stack).toHaveAttribute('data-direction', 'row');
    expect(stack).toHaveAttribute('data-gap', 'xl');
    expect(stack).toHaveAttribute('data-align', 'center');
    expect(stack).toHaveAttribute('data-justify', 'between');
    expect(stack).toHaveAttribute('data-wrap', 'true');
  });

  it('forwards ref, native attributes, className and style', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack
        ref={ref}
        id="actions"
        role="toolbar"
        aria-label="Actions"
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const stack = screen.getByRole('toolbar', { name: 'Actions' });
    expect(ref.current).toBe(stack);
    expect(stack).toHaveAttribute('id', 'actions');
    expect(stack).toHaveClass('mgs-stack', 'custom');
    expect(stack).toHaveStyle({ marginTop: '4px' });
  });

  describe('styles, as compiled', () => {
    it('is a flex column that becomes a row', () => {
      expect(declarations('.mgs-stack')).toContain('display: flex');
      expect(declarations('.mgs-stack')).toContain('flex-direction: column');
      expect(declarations('.mgs-stack[data-direction=row]')).toContain('flex-direction: row');
      expect(declarations('.mgs-stack[data-wrap]')).toContain('flex-wrap: wrap');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl'])('gap %s is that step of the MGS scale', (step) => {
      expect(declarations(`.mgs-stack[data-gap=${step}]`)).toBe(`gap: var(--mgs-space-${step});`);
    });

    it('gap none is no space', () => {
      expect(declarations('.mgs-stack[data-gap=none]')).toBe('gap: 0;');
    });

    it.each([
      ['align', 'start', 'align-items: flex-start;'],
      ['align', 'center', 'align-items: center;'],
      ['align', 'end', 'align-items: flex-end;'],
      ['align', 'stretch', 'align-items: stretch;'],
      ['align', 'baseline', 'align-items: baseline;'],
      ['justify', 'start', 'justify-content: flex-start;'],
      ['justify', 'center', 'justify-content: center;'],
      ['justify', 'end', 'justify-content: flex-end;'],
      ['justify', 'between', 'justify-content: space-between;'],
    ])('%s %s', (prop, value, css) => {
      expect(declarations(`.mgs-stack[data-${prop}=${value}]`)).toBe(css);
    });

    it('uses no colours and no fixed sizes', () => {
      const all = rules.map((rule) => rule.declarations).join(' ');
      expect(all).not.toMatch(/#[0-9a-f]{3,8}\b|rgb|\d+px/i);
    });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
