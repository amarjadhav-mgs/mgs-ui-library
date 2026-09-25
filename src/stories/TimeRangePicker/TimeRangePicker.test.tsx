import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimeRangePicker } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './TimeRangePicker.stories';

const allStories = composeStories(stories);

describe('TimeRangePicker stories', () => {
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
describe('RSuite TimeRangePicker behaviour documented in TimeRangePicker.mdx', () => {
  it('the label prop names the input', () => {
    render(<TimeRangePicker label="Opening hours" />);
    expect(screen.getByLabelText('Opening hours').tagName).toBe('INPUT');
  });

  it('shows both times with the default HH:mm format and " ~ "', () => {
    render(
      <TimeRangePicker
        label="Hours"
        value={[new Date(2026, 8, 24, 9, 0), new Date(2026, 8, 24, 17, 30)]}
      />,
    );
    expect(screen.getByLabelText('Hours')).toHaveValue('09:00 ~ 17:30');
  });
});
