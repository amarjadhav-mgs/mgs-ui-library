import { composeStories } from '@storybook/react-vite';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, ButtonGroup, IconButton, TrashIcon } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './ButtonGroup.stories';

const allStories = composeStories(stories);

describe('ButtonGroup stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  // Runs each story's play function, as Storybook's Interactions panel does.
  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

// ButtonGroup and ButtonToolbar are RSuite components; these check they still drive the MGS Button and IconButton.
describe('RSuite ButtonGroup with MGS buttons', () => {
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

  it('disables every button in a disabled group', () => {
    render(
      <ButtonGroup aria-label="Actions" disabled>
        <Button>Save</Button>
        <IconButton aria-label="Delete">
          <TrashIcon />
        </IconButton>
      </ButtonGroup>,
    );
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it('has role="group" and the toolbar has role="toolbar"', () => {
    render(<allStories.Toolbar />);
    const toolbar = screen.getByRole('toolbar', { name: 'Order actions' });
    const group = within(toolbar).getByRole('group', { name: 'Clipboard' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
  });
});
