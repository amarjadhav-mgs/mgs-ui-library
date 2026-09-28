import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input, InputGroup } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './InputGroup.stories';

const allStories = composeStories(stories);

describe('InputGroup stories', () => {
  // Every documented example must be accessible; this also catches inputs without a label.
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite InputGroup behaviour documented in InputGroup.mdx', () => {
  it('renders add-ons around the MGS Input', () => {
    render(<allStories.Basic />);
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Website').tagName).toBe('INPUT');
  });

  it("an MGS Input without its own size takes the group's size", () => {
    render(
      <InputGroup size="lg">
        <Input aria-label="Amount" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Amount')).toHaveAttribute('data-size', 'lg');
  });

  it('disabled on the group disables the input', () => {
    render(
      <InputGroup disabled>
        <Input aria-label="Amount" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Amount')).toBeDisabled();
  });
});
