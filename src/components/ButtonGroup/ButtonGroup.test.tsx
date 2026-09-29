import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, ButtonGroup, IconButton, TrashIcon } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './ButtonGroup.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's vertical is hidden; use orientation="vertical" */}
    <ButtonGroup aria-label="View" vertical />
    {/* @ts-expect-error RSuite's justified is hidden; use fullWidth */}
    <ButtonGroup aria-label="View" justified />
    {/* @ts-expect-error RSuite's block is hidden; use fullWidth */}
    <ButtonGroup aria-label="View" block />
    {/* @ts-expect-error RSuite's divided is hidden */}
    <ButtonGroup aria-label="View" divided />
    {/* @ts-expect-error RSuite's as is hidden */}
    <ButtonGroup aria-label="View" as="ul" />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <ButtonGroup aria-label="View" size="xs" />
    {/* @ts-expect-error horizontal or vertical */}
    <ButtonGroup aria-label="View" orientation="row" />
    {/* @ts-expect-error always a group; a toolbar is a Stack with role="toolbar" */}
    <ButtonGroup aria-label="View" role="toolbar" />
  </>
);

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('ButtonGroup stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('ButtonGroup', () => {
  it('renders a horizontal group with a name, around its buttons', () => {
    render(
      <ButtonGroup aria-label="View">
        <Button>List</Button>
        <Button>Board</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'View' });
    expect(group).toHaveClass('mgs-button-group');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group).not.toHaveAttribute('data-vertical');
    expect(group).not.toHaveAttribute('data-justified');
    expect(within(group).getAllByRole('button')).toHaveLength(2);
  });

  it('applies the group size to buttons that do not set their own', () => {
    render(
      <ButtonGroup aria-label="Actions" size="sm">
        <Button>Inherits</Button>
        <IconButton aria-label="Delete">
          <TrashIcon />
        </IconButton>
        <Button size="lg">Own size</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Inherits' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Own size' })).toHaveAttribute('data-size', 'lg');
  });

  it('without a size, the buttons are md', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'md');
  });

  it('disabled disables every button; without it, a button can be disabled on its own', () => {
    const { rerender } = render(
      <ButtonGroup aria-label="Actions" disabled>
        <Button>Save</Button>
        <IconButton aria-label="Delete">
          <TrashIcon />
        </IconButton>
      </ButtonGroup>,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    rerender(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
        <Button disabled>Delete</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('orientation and fullWidth are marked for the layout', () => {
    const { rerender } = render(<ButtonGroup aria-label="View" orientation="vertical" />);
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveAttribute('data-vertical', 'true');
    rerender(<ButtonGroup aria-label="View" fullWidth />);
    expect(group).toHaveAttribute('data-justified', 'true');
  });

  it('forwards ref, native attributes, className and style to the group', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup
        ref={ref}
        id="view"
        aria-label="View"
        data-testid="group"
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const group = screen.getByTestId('group');
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute('id', 'view');
    expect(group).toHaveClass('mgs-button-group', 'custom');
    expect(group).toHaveStyle({ marginTop: '4px' });
  });

  it('warns in development when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ButtonGroup>
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
