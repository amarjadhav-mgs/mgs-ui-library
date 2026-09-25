import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Avatar.stories';

const allStories = composeStories(stories);

const sizeOf = (el: Element) => (el as HTMLElement).style.getPropertyValue('--rs-avatar-size');

describe('Avatar stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  // Runs each story's play function, as Storybook's Interactions panel does.
  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
// Note: jsdom never loads images, so these cover the fallback shown while loading or on error.
describe('RSuite Avatar behaviour documented in Avatar.mdx', () => {
  it('shows children (initials) while the image is not loaded', () => {
    render(
      <Avatar src="/photo.png" alt="Asha Patel">
        AP
      </Avatar>,
    );
    expect(screen.getByText('AP')).toBeInTheDocument();
  });

  it('without children, falls back to the full alt text as a named image', () => {
    render(<Avatar src="/photo.png" alt="Asha Patel" />);
    expect(screen.getByRole('img', { name: 'Asha Patel' })).toHaveTextContent('Asha Patel');
  });

  it('with nothing to show, renders a default icon named "Avatar"', () => {
    render(<Avatar />);
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument();
  });

  it('role="img" + aria-label names an initials avatar', () => {
    render(
      <Avatar role="img" aria-label="Asha Patel">
        AP
      </Avatar>,
    );
    expect(screen.getByRole('img', { name: 'Asha Patel' })).toBeInTheDocument();
  });

  it('AvatarGroup is a named group and its size applies to every avatar', () => {
    const { container } = render(
      <AvatarGroup size="sm" aria-label="Project members">
        <Avatar>A</Avatar>
        <Avatar size="lg">B</Avatar>
        <Avatar size={52}>C</Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByRole('group', { name: 'Project members' })).toBeInTheDocument();
    const [a, b, c] = Array.from(container.querySelectorAll('.rs-avatar'));
    expect(sizeOf(a)).toBe('var(--rs-avatar-size-sm)');
    // An explicit size on the avatar wins over the group; numbers are pixels.
    expect(sizeOf(b)).toBe('var(--rs-avatar-size-lg)');
    expect(sizeOf(c)).toBe('52px');
  });
});
