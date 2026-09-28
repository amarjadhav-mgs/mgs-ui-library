import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Input.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error passwords use PasswordInput */}
    <Input type="password" />
    {/* @ts-expect-error numbers will use NumberInput */}
    <Input type="number" />
    {/* @ts-expect-error dates use DatePicker */}
    <Input type="date" />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <Input size="xs" />
    {/* @ts-expect-error RSuite's plaintext is hidden; use readOnly */}
    <Input plaintext />
    {/* @ts-expect-error RSuite's onPressEnter is hidden; use onKeyDown or a form */}
    <Input onPressEnter={() => {}} />
    {/* @ts-expect-error RSuite's inputRef is hidden; ref points at the <input> */}
    <Input inputRef={createRef()} />
    {/* @ts-expect-error RSuite's htmlSize is hidden; width comes from the layout */}
    <Input htmlSize={10} />
    {/* @ts-expect-error RSuite reads width as a CSS style prop; width comes from the layout */}
    <Input width={200} />
    {/* @ts-expect-error RSuite reads height as a CSS style prop */}
    <Input height={40} />
  </>
);

describe('Input stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Input', () => {
  it('renders a text <input> of size md by default, named by its label', () => {
    render(
      <>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-size', 'md');
    expect(input).toHaveClass('mgs-input');
  });

  it.each(['email', 'tel', 'url', 'search'] as const)('sets type="%s"', (type) => {
    render(<Input aria-label="Field" type={type} />);
    expect(screen.getByLabelText('Field')).toHaveAttribute('type', type);
  });

  it('calls onChange with the value first, then the change event', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'A');
    expect(onChange).toHaveBeenCalledWith('A', expect.objectContaining({ type: 'change' }));
  });

  it('disabled: not focusable or editable', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Region" disabled defaultValue="West" onChange={onChange} />);
    const input = screen.getByLabelText('Region');
    expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    expect(input).toHaveValue('West');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('readOnly: focusable, not editable, and still calls onFocus, onBlur and onKeyDown', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Input
        aria-label="Code"
        readOnly
        defaultValue="CUST-1042"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />,
    );
    const input = screen.getByLabelText('Code');
    await userEvent.tab();
    expect(input).toHaveFocus();
    await userEvent.keyboard('x');
    expect(input).toHaveValue('CUST-1042');
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('passes native attributes, className and style to the <input>, and forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        maxLength={80}
        aria-invalid="true"
        aria-describedby="email-error"
        className="custom"
        style={{ marginTop: 4 }}
        data-testid="email"
      />,
    );
    const input = screen.getByTestId('email');
    expect(ref.current).toBe(input);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('maxlength', '80');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(input).toHaveClass('mgs-input', 'custom');
    expect(input).toHaveStyle({ marginTop: '4px' });
  });

  it('does not accept RSuite props or other types (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
