import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './CheckboxGroup.stories';

const allStories = composeStories(stories);

/** A Checkbox wrapped in a component and an element, so it isn't a direct child of the group. */
function NestedCheckbox() {
  return (
    <div>
      <Checkbox value="sms">SMS</Checkbox>
    </div>
  );
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's inline is hidden; use orientation="horizontal" */}
    <CheckboxGroup aria-label="Group" inline />
    {/* @ts-expect-error RSuite's plaintext is hidden */}
    <CheckboxGroup aria-label="Group" plaintext />
    {/* @ts-expect-error a checkbox group has no read-only state; use disabled */}
    <CheckboxGroup aria-label="Group" readOnly />
    {/* @ts-expect-error RSuite's as is hidden */}
    <CheckboxGroup aria-label="Group" as="ul" />
    {/* @ts-expect-error values are strings */}
    <CheckboxGroup aria-label="Group" value={[1, 2]} />
    {/* @ts-expect-error the value is a list */}
    <CheckboxGroup aria-label="Group" value="email" />
    {/* @ts-expect-error vertical or horizontal */}
    <CheckboxGroup aria-label="Group" orientation="inline" />
    {/* @ts-expect-error always a group */}
    <CheckboxGroup aria-label="Group" role="radiogroup" />
  </>
);

/** The group follows a reset a moment after the event, once it is known that nothing cancelled it. */
const afterReset = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('CheckboxGroup stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('CheckboxGroup', () => {
  it('renders a vertical group with a name, around its checkboxes', () => {
    render(
      <CheckboxGroup aria-label="Notify me by">
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Notify me by' });
    expect(group).toHaveClass('mgs-checkbox-group');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('orientation="horizontal" is marked for the layout', () => {
    render(
      <CheckboxGroup aria-label="Days" orientation="horizontal">
        <Checkbox value="mon">Mon</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('defaultValue: checks those at the start and changes on its own, in the order checked', async () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup aria-label="Notify me by" defaultValue={['sms']} onChange={onChange}>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>,
    );
    const email = screen.getByRole('checkbox', { name: 'Email' });
    const sms = screen.getByRole('checkbox', { name: 'SMS' });
    expect(email).not.toBeChecked();
    expect(sms).toBeChecked();
    await userEvent.click(email);
    expect(email).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(
      ['sms', 'email'],
      expect.objectContaining({ type: 'change' }),
    );
    await userEvent.click(sms);
    expect(sms).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(['email'], expect.anything());
  });

  it('value: stays what the app sets, and onChange does not change the array it was given', async () => {
    const onChange = vi.fn();
    const value = ['email'];
    render(
      <CheckboxGroup aria-label="Notify me by" value={value} onChange={onChange}>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'SMS' }));
    expect(onChange).toHaveBeenCalledWith(['email', 'sms'], expect.anything());
    expect(screen.getByRole('checkbox', { name: 'SMS' })).not.toBeChecked();
    expect(value).toEqual(['email']);
  });

  it("a checkbox's own onChange is called too, before the group's", async () => {
    const calls: string[] = [];
    render(
      <CheckboxGroup aria-label="Notify me by" onChange={() => calls.push('group')}>
        <Checkbox value="email" onChange={() => calls.push('checkbox')}>
          Email
        </Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(calls).toEqual(['checkbox', 'group']);
  });

  it('reaches checkboxes however deeply they are nested', async () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup aria-label="Notify me by" disabled={false} onChange={onChange}>
        <NestedCheckbox />
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'SMS' }));
    expect(onChange).toHaveBeenCalledWith(['sms'], expect.anything());
  });

  it('disabled disables every checkbox; a single checkbox can be disabled on its own', () => {
    const { rerender } = render(
      <CheckboxGroup aria-label="Notify me by" disabled>
        <Checkbox value="email">Email</Checkbox>
        <NestedCheckbox />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled', 'true');
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled();
    rerender(
      <CheckboxGroup aria-label="Notify me by">
        <Checkbox value="email" disabled>
          Email
        </Checkbox>
        <NestedCheckbox />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox', { name: 'Email' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'SMS' })).toBeEnabled();
  });

  it('a form submits one name=value for each checked checkbox', () => {
    render(
      <form data-testid="form">
        <CheckboxGroup aria-label="Notify me by" name="channels" defaultValue={['email', 'push']}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
          <Checkbox value="push">Push</Checkbox>
        </CheckboxGroup>
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data.getAll('channels')).toEqual(['email', 'push']);
  });

  it("a form's Reset puts an uncontrolled group back to its starting value", async () => {
    const onChange = vi.fn();
    render(
      <form data-testid="form">
        <CheckboxGroup aria-label="Notify me by" defaultValue={['email']} onChange={onChange}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </CheckboxGroup>
        <button type="reset">Reset</button>
      </form>,
    );
    const email = screen.getByRole('checkbox', { name: 'Email' });
    const sms = screen.getByRole('checkbox', { name: 'SMS' });
    await userEvent.click(sms);
    expect(onChange).toHaveBeenLastCalledWith(['email', 'sms'], expect.anything());
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await afterReset();
    expect(email).toBeChecked();
    expect(sms).not.toBeChecked();
    // The next change starts from what the screen shows, not from the value before the reset.
    await userEvent.click(email);
    expect(onChange).toHaveBeenLastCalledWith([], expect.anything());
    expect(sms).not.toBeChecked();
  });

  it("a cancelled Reset (preventDefault) leaves the group's value alone", async () => {
    const onChange = vi.fn();
    render(
      <form onReset={(event) => event.preventDefault()}>
        <CheckboxGroup aria-label="Notify me by" defaultValue={['email']} onChange={onChange}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </CheckboxGroup>
        <button type="reset">Reset</button>
      </form>,
    );
    const sms = screen.getByRole('checkbox', { name: 'SMS' });
    await userEvent.click(sms);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await afterReset();
    expect(sms).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(onChange).toHaveBeenLastCalledWith(['sms'], expect.anything());
  });

  it('keeps values that no checkbox has: the group does not know which values its checkboxes have', async () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup aria-label="Notify me by" defaultValue={['fax']} onChange={onChange}>
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(onChange).toHaveBeenCalledWith(['fax', 'email'], expect.anything());
  });

  it('a checkbox without a value (Select all) is not part of the value or the name, but is disabled with the group', async () => {
    const onChange = vi.fn();
    const onSelectAll = vi.fn();
    const { rerender } = render(
      <CheckboxGroup aria-label="Modules" name="modules" onChange={onChange}>
        <Checkbox onChange={onSelectAll}>All modules</Checkbox>
        <Checkbox value="orders">Orders</Checkbox>
      </CheckboxGroup>,
    );
    const all = screen.getByRole('checkbox', { name: 'All modules' });
    await userEvent.click(all);
    expect(onSelectAll).toHaveBeenCalledWith(true, expect.anything());
    expect(onChange).not.toHaveBeenCalled();
    expect(all).not.toHaveAttribute('name');
    rerender(
      <CheckboxGroup aria-label="Modules" name="modules" disabled>
        <Checkbox>All modules</Checkbox>
        <Checkbox value="orders">Orders</Checkbox>
      </CheckboxGroup>,
    );
    expect(all).toBeDisabled();
  });

  it('forwards ref, native attributes, className and style to the group', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CheckboxGroup
        ref={ref}
        id="channels"
        aria-label="Notify me by"
        aria-describedby="channels-help"
        data-testid="group"
        className="custom"
        style={{ marginTop: 4 }}
      >
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByTestId('group');
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute('id', 'channels');
    expect(group).toHaveAttribute('aria-describedby', 'channels-help');
    expect(group).toHaveClass('mgs-checkbox-group', 'custom');
    expect(group).toHaveStyle({ marginTop: '4px' });
  });

  it('warns in development when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <CheckboxGroup>
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
