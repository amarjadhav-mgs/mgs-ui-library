import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Checkbox, CheckboxGroup, WarningIcon } from '@mgs/ui';
import { column, labelStyle, source } from '../../stories/shared';

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const heading = { ...labelStyle, margin: '0 0 4px' } as const;

const modules = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'reports', label: 'Reports' },
];

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  // Docs come from CheckboxGroup.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native <div> attributes also work but would flood the table.
    controls: { include: ['value', 'defaultValue', 'orientation', 'disabled', 'name'] },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'The values of the checked checkboxes (controlled). Use with `onChange`.',
      table: { type: { summary: 'string[]' } },
    },
    defaultValue: {
      control: 'object',
      description: 'The values checked at the start (uncontrolled).',
      table: { type: { summary: 'string[]' }, defaultValue: { summary: '[]' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Checkboxes under each other, or next to each other.',
      table: {
        type: { summary: "'vertical' | 'horizontal'" },
        defaultValue: { summary: "'vertical'" },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every checkbox in the group.',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'The `name` of every checkbox: a form submits one `name=value` per checked one.',
    },
    onChange: {
      description: '`(value: string[], event) => void`: the new values come first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    defaultValue: ['email'],
    orientation: 'vertical',
    disabled: false,
  },
  render: (args) => (
    <div>
      <p id="playground-channels" style={heading}>
        Notify me by
      </p>
      <CheckboxGroup {...args} aria-labelledby="playground-channels">
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
        <Checkbox value="push">Push notification</Checkbox>
      </CheckboxGroup>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<p id="channels">Notify me by</p>
<CheckboxGroup aria-labelledby="channels" name="channels" defaultValue={['email']}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
  <Checkbox value="push">Push notification</Checkbox>
</CheckboxGroup>`),
  render: () => (
    <div>
      <p id="basic-channels" style={heading}>
        Notify me by
      </p>
      <CheckboxGroup aria-labelledby="basic-channels" name="channels" defaultValue={['email']}>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
        <Checkbox value="push">Push notification</Checkbox>
      </CheckboxGroup>
    </div>
  ),
};

/** Disable the whole group, or single checkboxes in it. */
export const States: Story = {
  parameters: source(`<CheckboxGroup aria-labelledby="all" disabled defaultValue={['email']}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
</CheckboxGroup>

<CheckboxGroup aria-labelledby="one" defaultValue={['email']}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms" disabled>SMS (add a phone number first)</Checkbox>
</CheckboxGroup>`),
  render: () => (
    <div style={column}>
      <div>
        <p id="states-all" style={heading}>
          Disabled group
        </p>
        <CheckboxGroup aria-labelledby="states-all" disabled defaultValue={['email']}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </CheckboxGroup>
      </div>
      <div>
        <p id="states-one" style={heading}>
          One disabled checkbox
        </p>
        <CheckboxGroup aria-labelledby="states-one" defaultValue={['email']}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms" disabled>
            SMS (add a phone number first)
          </Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  ),
};

/** Next to each other, for a few short options. A row that is full wraps onto the next line. */
export const Horizontal: Story = {
  parameters:
    source(`<CheckboxGroup aria-labelledby="days" orientation="horizontal" defaultValue={['mon', 'wed']}>
  <Checkbox value="mon">Mon</Checkbox>
  <Checkbox value="tue">Tue</Checkbox>
  <Checkbox value="wed">Wed</Checkbox>
  <Checkbox value="thu">Thu</Checkbox>
  <Checkbox value="fri">Fri</Checkbox>
</CheckboxGroup>`),
  render: () => (
    <div>
      <p id="horizontal-days" style={heading}>
        Delivery days
      </p>
      <CheckboxGroup
        aria-labelledby="horizontal-days"
        orientation="horizontal"
        defaultValue={['mon', 'wed']}
      >
        <Checkbox value="mon">Mon</Checkbox>
        <Checkbox value="tue">Tue</Checkbox>
        <Checkbox value="wed">Wed</Checkbox>
        <Checkbox value="thu">Thu</Checkbox>
        <Checkbox value="fri">Fri</Checkbox>
      </CheckboxGroup>
    </div>
  ),
};

/** `onChange` receives the new values first: `onChange={setChannels}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [channels, setChannels] = useState(['email']);

<CheckboxGroup aria-labelledby="channels" value={channels} onChange={setChannels}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
  <Checkbox value="push">Push notification</Checkbox>
</CheckboxGroup>`),
  render: function Render() {
    const [channels, setChannels] = useState(['email']);
    return (
      <div style={column}>
        <div>
          <p id="controlled-channels" style={heading}>
            Notify me by
          </p>
          <CheckboxGroup
            aria-labelledby="controlled-channels"
            value={channels}
            onChange={setChannels}
          >
            <Checkbox value="email">Email</Checkbox>
            <Checkbox value="sms">SMS</Checkbox>
            <Checkbox value="push">Push notification</Checkbox>
          </CheckboxGroup>
        </div>
        <output style={{ fontSize: 14 }}>Selected: {channels.join(', ') || 'none'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'SMS' }));
    await expect(canvas.getByText('Selected: email, sms')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Email' }));
    await expect(canvas.getByText('Selected: sms')).toBeInTheDocument();
  },
};

/**
 * A form that needs at least one option: options from an array, a "Select all" checkbox (no `value`, so it isn't part
 * of the group's value), and validation on submit with the error linked to the group.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [access, setAccess] = useState<string[]>([]);
const [error, setError] = useState('');
const all = access.length === modules.length;

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(access.length > 0 ? '' : 'Choose at least one module');
}}>
  <p id="access">Modules this role can open</p>
  <CheckboxGroup
    aria-labelledby="access"
    aria-describedby={error ? 'access-error' : undefined}
    name="access"
    value={access}
    onChange={setAccess}
  >
    <Checkbox
      checked={all}
      indeterminate={access.length > 0 && !all}
      onChange={(checked) => setAccess(checked ? modules.map((module) => module.value) : [])}
    >
      All modules
    </Checkbox>
    {modules.map((module) => (
      <Checkbox key={module.value} value={module.value} aria-invalid={error ? true : undefined}>
        {module.label}
      </Checkbox>
    ))}
  </CheckboxGroup>
  {error && <p id="access-error">{error}</p>}

  <Button type="submit" variant="primary">Save role</Button>
</form>`),
  render: function Render() {
    const [access, setAccess] = useState<string[]>([]);
    const [error, setError] = useState('');
    const all = access.length === modules.length;
    return (
      <form
        noValidate
        aria-label="Role"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(access.length > 0 ? '' : 'Choose at least one module');
        }}
      >
        <div>
          <p id="advanced-access" style={heading}>
            Modules this role can open
          </p>
          <CheckboxGroup
            aria-labelledby="advanced-access"
            aria-describedby={error ? 'advanced-access-error' : undefined}
            name="access"
            value={access}
            onChange={setAccess}
          >
            <Checkbox
              checked={all}
              indeterminate={access.length > 0 && !all}
              onChange={(checked) =>
                setAccess(checked ? modules.map((module) => module.value) : [])
              }
            >
              All modules
            </Checkbox>
            {modules.map((module) => (
              <Checkbox
                key={module.value}
                value={module.value}
                aria-invalid={error ? true : undefined}
              >
                {module.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
          {error && (
            <p id="advanced-access-error" style={errorText}>
              <WarningIcon /> {error}
            </p>
          )}
        </div>
        <div>
          <Button type="submit" variant="primary">
            Save role
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Modules this role can open' });
    const all = canvas.getByRole('checkbox', { name: 'All modules' });
    const submit = canvas.getByRole('button', { name: 'Save role' });
    await userEvent.click(submit);
    await expect(group).toHaveAccessibleDescription('Choose at least one module');
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Orders' }));
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Reports' })).toBeChecked();
    await userEvent.click(submit);
    await expect(group).not.toHaveAttribute('aria-describedby');
  },
};

/** The group has a name; Tab moves through its checkboxes one by one, and Space checks them. */
export const Accessibility: Story = {
  parameters: source(`<p id="channels">Notify me by</p>
<CheckboxGroup aria-labelledby="channels">
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
</CheckboxGroup>`),
  render: () => (
    <div>
      <p id="accessibility-channels" style={heading}>
        Notify me by
      </p>
      <CheckboxGroup aria-labelledby="accessibility-channels">
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Notify me by' });
    const email = within(group).getByRole('checkbox', { name: 'Email' });
    const sms = within(group).getByRole('checkbox', { name: 'SMS' });
    await userEvent.tab();
    await expect(email).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(email).toBeChecked();
    await userEvent.tab();
    await expect(sms).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(sms).toBeChecked();
  },
};
