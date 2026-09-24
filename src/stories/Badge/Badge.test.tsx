import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import * as stories from './Badge.stories';

const allStories = composeStories(stories);

describe('Badge stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite Badge behaviour documented in Badge.mdx', () => {
  it('shows maxCount+ for numbers above maxCount (default 99)', () => {
    render(
      <>
        <Badge content={150} />
        <Badge content={12} maxCount={9} />
      </>,
    );
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('wraps children and defaults to topEnd placement', () => {
    const { container } = render(
      <Badge content={6}>
        <button type="button">Inbox</button>
      </Badge>,
    );
    const badge = container.firstElementChild!;
    expect(badge).toContainElement(screen.getByRole('button', { name: 'Inbox' }));
    expect(badge).toHaveAttribute('data-placement', 'topEnd');
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('invisible marks the badge hidden', () => {
    const { container } = render(<Badge content={6} invisible />);
    expect(container.firstElementChild).toHaveAttribute('data-hidden', 'true');
  });

  it('accepts preset and custom colours', () => {
    const { container } = render(
      <>
        <Badge color="violet" content="a" />
        <Badge color="#1e3a8a" content="b" />
      </>,
    );
    const [preset, custom] = Array.from(container.children);
    expect(preset).toHaveAttribute('data-color', 'violet');
    expect(custom).not.toHaveAttribute('data-color');
    expect((custom as HTMLElement).style.getPropertyValue('--rs-badge-bg')).toBe('#1e3a8a');
  });
});
