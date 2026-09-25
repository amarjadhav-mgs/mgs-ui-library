import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Calendar.stories';

const allStories = composeStories(stories);
const day = new Date(2026, 8, 24);
const firstHeader = () => screen.getAllByRole('columnheader')[0].getAttribute('aria-label');

describe('Calendar stories', () => {
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
describe('RSuite Calendar behaviour documented in Calendar.mdx', () => {
  it('is a grid named by month, with days named by their full date', () => {
    render(<Calendar compact defaultValue={day} />);
    expect(screen.getByRole('grid', { name: 'Sep 2026' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '24 Sep 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('only the selected day is in the Tab order', () => {
    render(<Calendar compact defaultValue={day} />);
    const tabbable = screen.getAllByRole('gridcell').filter((c) => c.tabIndex === 0);
    expect(tabbable.map((c) => c.getAttribute('aria-label'))).toEqual(['24 Sep 2026']);
  });

  it('clicking a day calls onSelect and onChange with that date', async () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    render(<Calendar compact defaultValue={day} onSelect={onSelect} onChange={onChange} />);
    await userEvent.click(screen.getByRole('gridcell', { name: '10 Sep 2026' }));
    expect(onSelect.mock.lastCall?.[0].getDate()).toBe(10);
    expect(onChange.mock.lastCall?.[0].getDate()).toBe(10);
  });

  it('week start: locale default is Monday, weekStart wins over isoWeek', () => {
    const { unmount } = render(<Calendar compact defaultValue={day} />);
    expect(firstHeader()).toBe('Monday');
    unmount();

    render(<Calendar compact defaultValue={day} isoWeek weekStart={0} />);
    expect(firstHeader()).toBe('Sunday');
  });
});
