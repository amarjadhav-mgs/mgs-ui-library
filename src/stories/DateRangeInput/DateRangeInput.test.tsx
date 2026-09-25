import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateRangeInput } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import * as stories from './DateRangeInput.stories';

const allStories = composeStories(stories);

describe('DateRangeInput stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite DateRangeInput behaviour documented in DateRangeInput.mdx', () => {
  it('default format is dd/MM/yyyy ~ dd/MM/yyyy (from the locale)', () => {
    render(<DateRangeInput aria-label="Period" />);
    expect(screen.getByLabelText('Period')).toHaveAttribute(
      'placeholder',
      'dd/MM/yyyy ~ dd/MM/yyyy',
    );
  });

  it('shows the range with the given format and character', () => {
    render(
      <DateRangeInput
        aria-label="Period"
        format="yyyy-MM-dd"
        character=" to "
        value={[new Date(2026, 8, 24), new Date(2026, 8, 30)]}
      />,
    );
    expect(screen.getByLabelText('Period')).toHaveValue('2026-09-24 to 2026-09-30');
  });
});
