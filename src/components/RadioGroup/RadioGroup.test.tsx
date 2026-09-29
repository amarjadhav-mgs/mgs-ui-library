import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './RadioGroup.stories';

const allStories = composeStories(stories);

/** A Radio wrapped in a component and an element, so it isn't a direct child of the group. */
function NestedRadio() {
  return (
    <div>
      <Radio value="pickup">Pick up</Radio>
    </div>
  );
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's inline is hidden; use orientation="horizontal" */}
    <RadioGroup aria-label="Group" inline />
    {/* @ts-expect-error RSuite's appearance is hidden (picker is deprecated) */}
    <RadioGroup aria-label="Group" appearance="picker" />
    {/* @ts-expect-error RSuite's plaintext is hidden */}
    <RadioGroup aria-label="Group" plaintext />
    {/* @ts-expect-error a radio group has no read-only state; use disabled */}
    <RadioGroup aria-label="Group" readOnly />
    {/* @ts-expect-error RSuite's as is hidden */}
    <RadioGroup aria-label="Group" as="ul" />
    {/* @ts-expect-error values are strings */}
    <RadioGroup aria-label="Group" value={1} />
    {/* @ts-expect-error one value, not a list */}
    <RadioGroup aria-label="Group" value={['a']} />
    {/* @ts-expect-error null is for a controlled group; the default is a string or nothing */}
    <RadioGroup aria-label="Group" defaultValue={null} />
    {/* @ts-expect-error vertical or horizontal */}
    <RadioGroup aria-label="Group" orientation="inline" />
    {/* @ts-expect-error always a radio group */}
    <RadioGroup aria-label="Group" role="toolbar" />
  </>
);

/** The group follows a reset a moment after the event, once it is known that nothing cancelled it. */
const afterReset = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('RadioGroup stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('RadioGroup', () => {
  it('renders a vertical radio group with a name, and nothing selected by default', () => {
    render(
      <RadioGroup aria-label="Delivery">
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Delivery' });
    expect(group).toHaveClass('mgs-radio-group');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).not.toHaveAttribute('aria-required');
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });

  it('orientation="horizontal" is marked for the layout', () => {
    render(
      <RadioGroup aria-label="Priority" orientation="horizontal">
        <Radio value="low">Low</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('gives its radios one shared name when the app sets none, different for each group', () => {
    render(
      <>
        <RadioGroup aria-label="Delivery">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
        <RadioGroup aria-label="Priority">
          <Radio value="low">Low</Radio>
        </RadioGroup>
      </>,
    );
    const [standard, express, low] = screen.getAllByRole<HTMLInputElement>('radio');
    expect(standard.name).not.toBe('');
    expect(express.name).toBe(standard.name);
    expect(low.name).not.toBe(standard.name);
  });

  it('defaultValue: selects that radio at the start and changes on its own', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Delivery" defaultValue="standard" onChange={onChange}>
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );
    const standard = screen.getByRole('radio', { name: 'Standard' });
    const express = screen.getByRole('radio', { name: 'Express' });
    expect(standard).toBeChecked();
    await userEvent.click(express);
    expect(express).toBeChecked();
    expect(standard).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('express', expect.objectContaining({ type: 'change' }));
    // Selecting the selected radio again is not a change.
    await userEvent.click(express);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('value: stays what the app sets, and null selects nothing', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RadioGroup aria-label="Delivery" value="standard" onChange={onChange}>
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );
    const standard = screen.getByRole('radio', { name: 'Standard' });
    const express = screen.getByRole('radio', { name: 'Express' });
    await userEvent.click(express);
    expect(onChange).toHaveBeenCalledWith('express', expect.anything());
    expect(standard).toBeChecked();
    expect(express).not.toBeChecked();
    rerender(
      <RadioGroup aria-label="Delivery" value={null} onChange={onChange}>
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );
    expect(standard).not.toBeChecked();
    expect(express).not.toBeChecked();
  });

  it('arrow keys move between the radios and select them; Tab enters at the selected radio', async () => {
    const onChange = vi.fn();
    render(
      <>
        <RadioGroup aria-label="Delivery" defaultValue="express" onChange={onChange}>
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
          <NestedRadio />
        </RadioGroup>
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Pick up' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('pickup', expect.anything());
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    // The group is one Tab stop.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('disabled disables every radio, however deeply nested', () => {
    render(
      <RadioGroup aria-label="Delivery" disabled defaultValue="standard">
        <Radio value="standard">Standard</Radio>
        <NestedRadio />
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', 'true');
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('required: marked on the group and on the radios', () => {
    render(
      <RadioGroup aria-label="Delivery" required>
        <Radio value="standard">Standard</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('radio')).toBeRequired();
  });

  it('a form submits name=value of the selected radio, and nothing when none is selected', async () => {
    render(
      <form data-testid="form">
        <RadioGroup aria-label="Delivery" name="delivery">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect([...new FormData(form).entries()]).toEqual([]);
    await userEvent.click(screen.getByRole('radio', { name: 'Express' }));
    expect([...new FormData(form).entries()]).toEqual([['delivery', 'express']]);
  });

  it('warns in development when it is inside a form without a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <form>
        <RadioGroup aria-label="Delivery" name="delivery">
          <Radio value="standard">Standard</Radio>
        </RadioGroup>
      </form>,
    );
    expect(warn).not.toHaveBeenCalled();
    rerender(
      <form>
        <RadioGroup aria-label="Delivery">
          <Radio value="standard">Standard</Radio>
        </RadioGroup>
      </form>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('inside a <form> needs a name'));
  });

  it("a cancelled Reset (preventDefault) leaves the group's value alone", async () => {
    const onChange = vi.fn();
    render(
      <form onReset={(event) => event.preventDefault()}>
        <RadioGroup
          aria-label="Delivery"
          name="delivery"
          defaultValue="standard"
          onChange={onChange}
        >
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    );
    const express = screen.getByRole('radio', { name: 'Express' });
    await userEvent.click(express);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await afterReset();
    expect(express).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
  });

  it("a form's Reset puts an uncontrolled group back to its starting value", async () => {
    const onChange = vi.fn();
    render(
      <form>
        <RadioGroup
          aria-label="Delivery"
          name="delivery"
          defaultValue="standard"
          onChange={onChange}
        >
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    );
    const standard = screen.getByRole('radio', { name: 'Standard' });
    const express = screen.getByRole('radio', { name: 'Express' });
    await userEvent.click(express);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await afterReset();
    expect(standard).toBeChecked();
    expect(express).not.toBeChecked();
    // The group's value is "standard" again: selecting Express is a change, and it stays selected.
    await userEvent.click(express);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(express).toBeChecked();
    expect(standard).not.toBeChecked();
  });

  it('forwards ref, native attributes, className and style to the group', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup
        ref={ref}
        id="delivery"
        aria-label="Delivery"
        aria-invalid="true"
        aria-describedby="delivery-error"
        data-testid="group"
        className="custom"
        style={{ marginTop: 4 }}
      >
        <Radio value="standard">Standard</Radio>
      </RadioGroup>,
    );
    const group = screen.getByTestId('group');
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute('id', 'delivery');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-describedby', 'delivery-error');
    expect(group).toHaveClass('mgs-radio-group', 'custom');
    expect(group).toHaveStyle({ marginTop: '4px' });
  });

  it('warns in development when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup>
        <Radio value="standard">Standard</Radio>
      </RadioGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
