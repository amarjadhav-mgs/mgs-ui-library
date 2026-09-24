import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../test/axe';
import * as stories from './Button.stories';

const allStories = composeStories(stories);
const { Basic, Active, ButtonGroups, ButtonToolbars, LinkButton, Accessibility } = allStories;

describe('Button stories', () => {
  // Every documented example must be accessible; this also catches icon-only buttons without a label.
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite Button behaviour documented in Button.mdx', () => {
  it('defaults to type="button"', () => {
    render(<Basic />);
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('type', 'button');
  });

  it('renders href as a real link, and a disabled link leaves the tab order', () => {
    render(<LinkButton />);
    expect(screen.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '#docs');
    const disabled = screen.getByRole('link', { name: 'Disabled link' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(disabled).toHaveAttribute('tabindex', '-1');
  });

  it('toggle button exposes aria-pressed when passed, as the docs recommend', async () => {
    render(<Active />);
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(bold);
    expect(bold).toHaveAttribute('aria-pressed', 'true');
  });

  it('ButtonGroup has role="group" and ButtonToolbar has role="toolbar"', () => {
    render(<ButtonGroups />);
    expect(screen.getByRole('group', { name: 'Text alignment' })).toBeInTheDocument();
    render(<ButtonToolbars />);
    expect(screen.getByRole('toolbar', { name: 'Document actions' })).toBeInTheDocument();
  });

  it('is keyboard operable and skips disabled buttons', async () => {
    render(<Accessibility />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Press me' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });
});
