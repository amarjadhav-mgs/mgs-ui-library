import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, type ButtonVariant, PlusIcon } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Button.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these props becomes accepted.
const rejectedRSuiteProps = () => (
  <>
    {/* @ts-expect-error RSuite's appearance is hidden; use variant */}
    <Button appearance="primary">A</Button>
    {/* @ts-expect-error RSuite's color is hidden; use variant="danger" */}
    <Button color="red">B</Button>
    {/* @ts-expect-error RSuite's startIcon is hidden; use leftIcon */}
    <Button startIcon={<PlusIcon />}>C</Button>
    {/* @ts-expect-error RSuite's block is hidden; use fullWidth */}
    <Button block>D</Button>
    {/* @ts-expect-error RSuite's xs size is not part of the MGS size scale */}
    <Button size="xs">E</Button>
    {/* @ts-expect-error Button always renders a <button>; use a link for navigation */}
    <Button href="/orders">F</Button>
    {/* @ts-expect-error RSuite's toggle behaviour is hidden; pass aria-pressed and handle onClick */}
    <Button toggleable>G</Button>
  </>
);

describe('Button stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  // Runs each story's play function (Advanced, Accessibility), as the Interactions panel does.
  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Button', () => {
  it('renders a native button with type="button", secondary variant and md size by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveClass('mgs-button');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'danger', 'ghost', 'link'])(
    'renders the %s variant',
    (variant) => {
      render(<Button variant={variant}>Label</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('renders the %s size', (size) => {
    render(<Button size={size}>Label</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it('calls onClick with the click event, from mouse, Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onClick.mock.calls[0][0]).toHaveProperty('type', 'click');
  });

  it('disabled: native disabled, not clickable and not in the tab order', async () => {
    const onClick = vi.fn();
    render(
      <>
        <Button disabled onClick={onClick}>
          Save
        </Button>
        <Button>Next</Button>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });

  describe('loading', () => {
    it('is busy, keeps its accessible name, and stays focusable (not disabled)', () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).not.toBeDisabled();
      button.focus();
      expect(button).toHaveFocus();
    });

    it('ignores clicks, Enter and Space', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');
      fireEvent.click(button); // pointer-events: none blocks real mouse clicks; the handler must block the rest
      button.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not submit its form', async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      render(
        <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
          <Button type="submit" loading>
            Save
          </Button>
        </form>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps focus when loading starts and ends', () => {
      const { rerender } = render(<Button>Save</Button>);
      const button = screen.getByRole('button');
      button.focus();
      rerender(<Button loading>Save</Button>);
      expect(button).toHaveFocus();
      rerender(<Button>Save</Button>);
      expect(button).toHaveFocus();
      expect(button).not.toHaveAttribute('aria-busy');
    });
  });

  it('fullWidth switches on full-width layout', () => {
    render(<Button fullWidth>Continue</Button>);
    // RSuite's full-width switch; the CSS behind it is RSuite's.
    expect(screen.getByRole('button')).toHaveAttribute('data-block', 'true');
  });

  it('icons are hidden from screen readers; the label alone names the button', () => {
    render(
      <Button leftIcon={<PlusIcon />} rightIcon={<span>→</span>}>
        Add
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Add' });
    const icons = button.querySelectorAll('.mgs-button__icon');
    expect(icons).toHaveLength(2);
    icons.forEach((icon) => expect(icon).toHaveAttribute('aria-hidden', 'true'));
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('passes native attributes, className and style to the <button>', () => {
    render(
      <Button
        id="save"
        name="action"
        value="save"
        type="submit"
        className="custom"
        style={{ marginTop: 4 }}
        aria-describedby="hint"
        data-testid="save-button"
      >
        Save
      </Button>,
    );
    const button = screen.getByTestId('save-button');
    expect(button).toHaveAttribute('id', 'save');
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'save');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-describedby', 'hint');
    expect(button).toHaveClass('mgs-button', 'custom');
    expect(button).toHaveStyle({ marginTop: '4px' });
  });

  it('calls onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Button onFocus={onFocus} onBlur={onBlur}>
        Save
      </Button>,
    );
    await userEvent.tab();
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the <button> element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedRSuiteProps).toBeTypeOf('function');
  });
});
