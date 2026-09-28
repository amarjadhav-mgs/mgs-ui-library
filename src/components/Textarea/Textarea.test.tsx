import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './Textarea.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's resize is hidden; vertical by default, use style otherwise */}
    <Textarea resize="both" />
    {/* @ts-expect-error RSuite's plaintext is hidden; use readOnly */}
    <Textarea plaintext />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <Textarea size="xs" />
    {/* @ts-expect-error RSuite's onPressEnter is hidden */}
    <Textarea onPressEnter={() => {}} />
  </>
);

describe('Textarea stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Textarea', () => {
  it('renders a <textarea> of 3 rows and size md, resizable vertically', () => {
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '3');
    expect(textarea).toHaveAttribute('data-size', 'md');
    expect(textarea).toHaveClass('mgs-textarea');
    expect(textarea.style.getPropertyValue('--rs-textarea-resize')).toBe('vertical');
  });

  it('autosize: no manual resizing', () => {
    render(<Textarea aria-label="Comment" autosize minRows={2} maxRows={6} />);
    expect(screen.getByLabelText('Comment').style.getPropertyValue('--rs-textarea-resize')).toBe(
      'none',
    );
  });

  it('calls onChange with the value first; Enter adds a new line', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Notes'), 'A{Enter}B');
    expect(onChange).toHaveBeenLastCalledWith('A\nB', expect.objectContaining({ type: 'change' }));
  });

  it('readOnly: focusable, not editable, and still calls onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Textarea
        aria-label="Terms"
        readOnly
        defaultValue="Net 30"
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    const textarea = screen.getByLabelText('Terms');
    await userEvent.tab();
    expect(textarea).toHaveFocus();
    await userEvent.keyboard('x');
    expect(textarea).toHaveValue('Net 30');
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('disabled: not editable', () => {
    render(<Textarea aria-label="Reason" disabled />);
    expect(screen.getByLabelText('Reason')).toBeDisabled();
  });

  it('passes native attributes and className to the <textarea>, and forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        id="comment"
        name="comment"
        maxLength={500}
        required
        aria-describedby="count"
        className="custom"
        data-testid="comment"
      />,
    );
    const textarea = screen.getByTestId('comment');
    expect(ref.current).toBe(textarea);
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute('maxlength', '500');
    expect(textarea).toHaveAttribute('aria-describedby', 'count');
    expect(textarea).toHaveClass('mgs-textarea', 'custom');
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
