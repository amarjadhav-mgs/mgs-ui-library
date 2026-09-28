import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, VisuallyHidden } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './VisuallyHidden.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if this becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's as is hidden; VisuallyHidden is always a <span> */}
    <VisuallyHidden as="h2">A</VisuallyHidden>
    {/* @ts-expect-error RSuite reads color as a CSS style prop */}
    <VisuallyHidden color="red">B</VisuallyHidden>
  </>
);

describe('VisuallyHidden stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('VisuallyHidden', () => {
  it('renders a <span> whose text screen readers can read', () => {
    render(<VisuallyHidden>Overdue</VisuallyHidden>);
    const span = screen.getByText('Overdue');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass('mgs-visually-hidden');
    expect(span).not.toHaveAttribute('aria-hidden');
  });

  it("uses RSuite's visually-hidden styles (1px, clipped, absolutely positioned)", () => {
    // jsdom doesn't load CSS; this pins the RSuite class whose rule in rsuite.css does the hiding.
    render(<VisuallyHidden>Overdue</VisuallyHidden>);
    expect(screen.getByText('Overdue')).toHaveClass('rs-visually-hidden');
  });

  it('joins the accessible name of the control it is in', () => {
    render(
      <Button>
        Delete <VisuallyHidden>order 1042</VisuallyHidden>
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Delete order 1042' })).toBeInTheDocument();
  });

  it('passes native attributes and className, and forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <VisuallyHidden ref={ref} id="filters-heading" className="custom" data-testid="hidden">
        Filters
      </VisuallyHidden>,
    );
    const span = screen.getByTestId('hidden');
    expect(ref.current).toBe(span);
    expect(span).toHaveAttribute('id', 'filters-heading');
    expect(span).toHaveClass('mgs-visually-hidden', 'custom');
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
