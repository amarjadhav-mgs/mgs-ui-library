import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './PasswordInput.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error the type is always password (or text while shown) */}
    <PasswordInput type="text" />
    {/* @ts-expect-error RSuite's visible is hidden */}
    <PasswordInput visible />
    {/* @ts-expect-error RSuite's renderVisibilityIcon is hidden */}
    <PasswordInput renderVisibilityIcon={() => null} />
    {/* @ts-expect-error RSuite's endIcon is hidden */}
    <PasswordInput endIcon={null} />
  </>
);

describe('PasswordInput stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('PasswordInput', () => {
  it('renders a password <input> with autoComplete="current-password" by default', () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText('Password');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(input).toHaveClass('mgs-input');
  });

  it('autoComplete can be new-password', () => {
    render(<PasswordInput aria-label="New password" autoComplete="new-password" />);
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('aria-*, required, name and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <PasswordInput
        ref={ref}
        aria-label="Password"
        aria-describedby="rule"
        aria-invalid="true"
        required
        name="password"
      />,
    );
    const input = screen.getByLabelText('Password');
    expect(ref.current).toBe(input);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('aria-describedby', 'rule');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('className and style go to the outer wrapper', () => {
    const { container } = render(
      <PasswordInput aria-label="Password" className="custom" style={{ maxWidth: 200 }} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('mgs-password-input', 'custom');
    expect(wrapper).toHaveStyle({ maxWidth: '200px' });
    expect(screen.getByLabelText('Password')).not.toHaveClass('custom');
  });

  it('the Show password button is in the Tab order and toggles with the mouse', async () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).not.toHaveAttribute('tabindex', '-1');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    // The name doesn't change; aria-pressed carries the state.
    expect(toggle).toHaveAccessibleName('Show password');
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange with the value first', async () => {
    const onChange = vi.fn();
    render(<PasswordInput aria-label="Password" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Password'), 'a');
    expect(onChange).toHaveBeenCalledWith('a', expect.objectContaining({ type: 'change' }));
  });

  it('disabled: the input and the Show password button are both disabled', () => {
    render(<PasswordInput aria-label="Password" disabled />);
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });

  it('does not accept a type or RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
