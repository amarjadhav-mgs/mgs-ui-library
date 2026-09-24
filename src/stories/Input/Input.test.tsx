import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input, PasswordInput } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import * as stories from './Input.stories';

const allStories = composeStories(stories);
const { Clearable, Controlled, InputGroups, States } = allStories;

describe('Input stories', () => {
  // Every documented example must be accessible; this also catches inputs without a label.
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

// The docs rely on these RSuite behaviours; if an RSuite upgrade changes them, these fail.
describe('RSuite Input behaviour documented in Input.mdx', () => {
  it('onChange receives the value first, then the event', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'A');
    expect(onChange).toHaveBeenCalledWith('A', expect.objectContaining({ type: 'change' }));
  });

  it('controlled input updates from onChange', async () => {
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Name'), 'Asha');
    expect(screen.getByText('Hello, Asha')).toBeInTheDocument();
  });

  it('disabled is not editable, readOnly is focusable but not editable, plaintext has no input', async () => {
    render(<States />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();

    const readOnly = screen.getByLabelText('Read-only');
    await userEvent.type(readOnly, 'x');
    expect(readOnly).toHaveFocus();
    expect(readOnly).toHaveValue('Can focus and copy, not edit');

    expect(screen.getByText('Shown as text, no input').tagName).not.toBe('INPUT');
  });

  it('InputGroup renders addons around the input', () => {
    render(<InputGroups />);
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByLabelText('Website')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('clear button pattern empties the field, returns focus, and hides itself', async () => {
    render(<Clearable />);
    const input = screen.getByLabelText('Search projects');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  describe('PasswordInput', () => {
    it('toggles between hidden and visible text', async () => {
      render(
        <>
          <label htmlFor="pw">Password</label>
          <PasswordInput id="pw" />
        </>,
      );
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
      await userEvent.click(screen.getByRole('button', { name: 'Toggle password visibility' }));
      expect(input).toHaveAttribute('type', 'text');
    });

    // Known RSuite limitations, documented in Input.mdx. If these start failing, update the docs.
    it('limitation: the toggle button is not reachable with Tab (tabIndex -1)', () => {
      render(<PasswordInput id="pw2" aria-label="unused" />);
      expect(screen.getByRole('button', { name: 'Toggle password visibility' })).toHaveAttribute(
        'tabindex',
        '-1',
      );
    });

    it('limitation: aria-label goes to the wrapper, not the input', () => {
      const { container } = render(<PasswordInput aria-label="Password" />);
      expect(container.querySelector('input')).not.toHaveAttribute('aria-label');
    });
  });
});
