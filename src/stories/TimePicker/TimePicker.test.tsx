import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimePicker } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './TimePicker.stories';

const allStories = composeStories(stories);

describe('TimePicker stories', () => {
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
describe('RSuite TimePicker behaviour documented in TimePicker.mdx', () => {
  it('<label htmlFor> and the label prop both name the input', () => {
    render(
      <>
        <label htmlFor="start">Start time</label>
        <TimePicker id="start" />
        <TimePicker label="End time" />
      </>,
    );
    expect(screen.getByLabelText('Start time').tagName).toBe('INPUT');
    expect(screen.getByLabelText('End time').tagName).toBe('INPUT');
  });

  it('default format is HH:mm (from the locale)', () => {
    render(<TimePicker label="Time" />);
    expect(screen.getByLabelText('Time')).toHaveAttribute('placeholder', 'HH:mm');
  });

  it('shows the time in the given format', () => {
    render(
      <TimePicker
        label="Time"
        format="hh:mm aa"
        showMeridiem
        value={new Date(2026, 8, 24, 14, 5)}
      />,
    );
    expect(screen.getByLabelText('Time')).toHaveValue('02:05 PM');
  });
});
