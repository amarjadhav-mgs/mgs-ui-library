import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton, type IconButtonVariant, TrashIcon } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './IconButton.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error aria-label is required */}
    <IconButton>
      <TrashIcon />
    </IconButton>
    {/* @ts-expect-error the icon is required */}
    <IconButton aria-label="Delete" />
    {/* @ts-expect-error link has no meaning without a label */}
    <IconButton aria-label="Delete" variant="link">
      <TrashIcon />
    </IconButton>
    {/* @ts-expect-error RSuite's icon prop is hidden; pass the icon as children */}
    <IconButton aria-label="Delete" icon={<TrashIcon />}>
      <TrashIcon />
    </IconButton>
    {/* @ts-expect-error RSuite's circle shape is not part of the MGS API */}
    <IconButton aria-label="Delete" circle>
      <TrashIcon />
    </IconButton>
  </>
);

describe('IconButton stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  // Runs each story's play function (Advanced, Accessibility), as the Interactions panel does.
  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('IconButton', () => {
  it('is named by aria-label, and the icon is hidden from screen readers', () => {
    render(
      <IconButton aria-label="Delete row">
        <TrashIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete row' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveClass('mgs-icon-button');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides custom (non-MGS) icons from screen readers too', () => {
    render(
      <IconButton aria-label="Close">
        <span>×</span>
      </IconButton>,
    );
    expect(screen.getByText('×')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it.each<IconButtonVariant>(['primary', 'secondary', 'danger', 'ghost'])(
    'renders the %s variant',
    (variant) => {
      render(
        <IconButton aria-label="Delete" variant={variant}>
          <TrashIcon />
        </IconButton>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('renders the %s size', (size) => {
    render(
      <IconButton aria-label="Delete" size={size}>
        <TrashIcon />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it('disabled: not clickable', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Delete" disabled onClick={onClick}>
        <TrashIcon />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading: busy, keeps its name and focus, ignores clicks and Enter', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Delete" loading onClick={onClick}>
        <TrashIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    button.focus();
    expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('passes native attributes and forwards ref to the <button>', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        aria-label="Delete"
        id="delete"
        className="custom"
        data-testid="delete"
        title="Delete"
      >
        <TrashIcon />
      </IconButton>,
    );
    const button = screen.getByTestId('delete');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('id', 'delete');
    expect(button).toHaveAttribute('title', 'Delete');
    expect(button).toHaveClass('mgs-icon-button', 'custom');
  });

  it('requires aria-label and an icon, and hides RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
