import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
// The raw source: vite.config.ts → test.css lets this stylesheet through (other CSS imports are empty in tests).
import styles from './Checkbox.scss?raw';
import * as stories from './Checkbox.stories';

const allStories = composeStories(stories);

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error HTML has no read-only checkbox; use disabled */}
    <Checkbox readOnly>Label</Checkbox>
    {/* @ts-expect-error RSuite's color is hidden; the colour comes from the theme */}
    <Checkbox color="red">Label</Checkbox>
    {/* @ts-expect-error RSuite's plaintext is hidden */}
    <Checkbox plaintext>Label</Checkbox>
    {/* @ts-expect-error RSuite's inline is hidden; CheckboxGroup has orientation */}
    <Checkbox inline>Label</Checkbox>
    {/* @ts-expect-error RSuite's inputRef is hidden; ref points at the <input> */}
    <Checkbox inputRef={createRef()}>Label</Checkbox>
    {/* @ts-expect-error RSuite's inputProps is hidden; attributes go to the <input> directly */}
    <Checkbox inputProps={{}}>Label</Checkbox>
    {/* @ts-expect-error RSuite's as is hidden */}
    <Checkbox as="span">Label</Checkbox>
    {/* @ts-expect-error one size */}
    <Checkbox size="lg">Label</Checkbox>
    {/* @ts-expect-error values are strings */}
    <Checkbox value={1}>Label</Checkbox>
    {/* @ts-expect-error onChange receives (checked, event), not RSuite's (value, checked, event) */}
    <Checkbox onChange={(_value: string, _checked: boolean, _event: unknown) => {}}>Label</Checkbox>
  </>
);

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('Checkbox stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Checkbox', () => {
  it('renders a native checkbox, unchecked, named by its label', () => {
    const { container } = render(<Checkbox>Send me updates</Checkbox>);
    const checkbox = screen.getByRole('checkbox', { name: 'Send me updates' });
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox).not.toBeChecked();
    expect(container.firstElementChild?.tagName).toBe('LABEL');
    expect(container.firstElementChild).toHaveClass('mgs-checkbox');
    // The native state is what screen readers hear: no ARIA repeats it.
    expect(checkbox).not.toHaveAttribute('aria-checked');
    expect(checkbox).not.toHaveAttribute('aria-disabled');
  });

  it('clicking the label toggles it, and onChange gets the new state first, then the event', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Send me updates</Checkbox>);
    await userEvent.click(screen.getByText('Send me updates'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ type: 'change' }));
    await userEvent.click(screen.getByText('Send me updates'));
    expect(onChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ type: 'change' }));
  });

  it('defaultChecked: starts checked and changes on its own', async () => {
    render(<Checkbox defaultChecked>Updates</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('checked: stays what the app sets', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange}>
        Updates
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(checkbox).not.toBeChecked();
  });

  it('indeterminate: announced as mixed, follows the prop, and leaves checked alone', () => {
    const { rerender } = render(
      <Checkbox indeterminate checked={false} onChange={() => {}}>
        All
      </Checkbox>,
    );
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
    expect(checkbox).toBePartiallyChecked();
    expect(checkbox.checked).toBe(false);
    rerender(
      <Checkbox checked onChange={() => {}}>
        All
      </Checkbox>,
    );
    expect(checkbox).not.toBePartiallyChecked();
    expect(checkbox).toBeChecked();
  });

  it('indeterminate stays after a click until the app changes it', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox indeterminate checked={false} onChange={onChange}>
        All
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(checkbox).toBePartiallyChecked();
  });

  it('disabled: not focusable, not changeable, and marked on the root for styling', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Checkbox disabled onChange={onChange}>
        Printed copy
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('Printed copy'));
    await userEvent.tab();
    expect(checkbox).not.toHaveFocus();
    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a form submits name=value when checked, "on" without a value, and nothing when unchecked', () => {
    render(
      <form data-testid="form">
        <Checkbox name="updates" value="yes" defaultChecked>
          Updates
        </Checkbox>
        <Checkbox name="terms" defaultChecked>
          Terms
        </Checkbox>
        <Checkbox name="offers" value="yes">
          Offers
        </Checkbox>
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect([...data.entries()]).toEqual([
      ['updates', 'yes'],
      ['terms', 'on'],
    ]);
  });

  it('without a label: named by aria-label, or by other text through aria-labelledby', () => {
    render(
      <>
        <Checkbox aria-label="Select invoice INV-1041" />
        <span id="customer">Acme Traders</span>
        <Checkbox aria-labelledby="customer" />
      </>,
    );
    expect(screen.getByRole('checkbox', { name: 'Select invoice INV-1041' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Acme Traders' })).toBeInTheDocument();
  });

  it('className and style go to the root; other attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    const { container } = render(
      <Checkbox
        ref={ref}
        id="terms"
        name="terms"
        required
        aria-invalid="true"
        aria-describedby="terms-error"
        data-testid="terms"
        onFocus={onFocus}
        className="custom"
        style={{ marginTop: 4 }}
      >
        Terms
      </Checkbox>,
    );
    const checkbox = screen.getByTestId('terms');
    const root = container.firstElementChild;
    expect(ref.current).toBe(checkbox);
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('id', 'terms');
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
    checkbox.focus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('mgs-checkbox', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(checkbox).not.toHaveClass('custom');
  });

  it('warns in development when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Checkbox />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('warns once, however many checkboxes have no name, and an empty label is no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Checkbox />
        <Checkbox />
        <Checkbox>{''}</Checkbox>
      </>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when it has a label, aria-label, aria-labelledby, a title or an id for a <label htmlFor>', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Checkbox>Label</Checkbox>
        <Checkbox aria-label="Label" />
        <Checkbox aria-labelledby="other" />
        <Checkbox title="Select row" />
        <label htmlFor="outside">Outside label</label>
        <Checkbox id="outside" />
      </>,
    );
    expect(warn).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Outside label' })).toBeInTheDocument();
    // Browsers name it by its title when the label is empty; Testing Library's name calculation stops at the empty
    // <label>, so only the attribute is checked here.
    expect(screen.getByTitle('Select row')).toHaveAttribute('type', 'checkbox');
  });

  it('warns in development when checked is set without onChange, unless it is disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <Checkbox checked disabled>
        Shown only
      </Checkbox>,
    );
    expect(warn).not.toHaveBeenCalled();
    rerender(<Checkbox checked>Stuck</Checkbox>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('can never change'));
  });

  it('hover does not replace the error border of an invalid checkbox (read from the styles)', () => {
    const hoverRule = styles.slice(styles.indexOf('.mgs-checkbox:hover'));
    expect(hoverRule.slice(0, hoverRule.indexOf('{'))).toContain("[aria-invalid='true']");
  });

  it('a long word in the label wraps (read from the styles)', () => {
    const labelRule = styles.slice(styles.indexOf('.mgs-checkbox__label {'));
    expect(labelRule.slice(0, labelRule.indexOf('}'))).toContain('overflow-wrap: anywhere');
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
