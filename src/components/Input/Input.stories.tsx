import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Input, type InputType, WarningIcon } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const types: InputType[] = ['text', 'email', 'tel', 'url', 'search'];
const sizes = ['sm', 'md', 'lg'] as const;

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const meta = {
  title: 'Components/Input',
  component: Input,
  // Docs come from Input.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: {
      include: ['type', 'size', 'value', 'defaultValue', 'placeholder', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: types,
      description: 'Input type: sets the mobile keyboard and autofill.',
      table: {
        type: { summary: types.map((t) => `'${t}'`).join(' | ') },
        defaultValue: { summary: "'text'" },
      },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size. Inside an `InputGroup`, the group size applies when this is not set.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    value: { control: 'text', description: 'The value (controlled). Use with `onChange`.' },
    defaultValue: { control: 'text', description: 'The starting value (uncontrolled).' },
    placeholder: { control: 'text', description: 'An example value. Not a label.' },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or edited; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and copyable, not editable; submitted with a form.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(value: string, event) => void`: the value comes first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    type: 'text',
    size: 'md',
    placeholder: 'e.g. Asha Patel',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={column}>
      <Field label="Name">{(id) => <Input {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="email">Email</label>
<Input id="email" type="email" name="email" autoComplete="email" />`),
  render: () => (
    <div style={column}>
      <Field label="Email">
        {(id) => <Input id={id} type="email" name="email" autoComplete="email" />}
      </Field>
    </div>
  ),
};

/** Each type sets the right mobile keyboard and lets the browser autofill the field. */
export const Types: Story = {
  parameters: source(`<Input id="email" type="email" autoComplete="email" />
<Input id="phone" type="tel" autoComplete="tel" />
<Input id="website" type="url" autoComplete="url" />
<Input id="search" type="search" />`),
  render: () => (
    <div style={column}>
      <Field label="Name (text)">{(id) => <Input id={id} autoComplete="name" />}</Field>
      <Field label="Email (email)">
        {(id) => <Input id={id} type="email" autoComplete="email" />}
      </Field>
      <Field label="Phone (tel)">{(id) => <Input id={id} type="tel" autoComplete="tel" />}</Field>
      <Field label="Website (url)">{(id) => <Input id={id} type="url" autoComplete="url" />}</Field>
      <Field label="Search (search)">{(id) => <Input id={id} type="search" />}</Field>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<Input id="name" defaultValue="Asha Patel" />
<Input id="code" readOnly defaultValue="CUST-1042" />
<Input id="region" disabled defaultValue="West" />
<Input id="email" aria-invalid="true" aria-describedby="email-error" defaultValue="asha@" />`),
  render: () => (
    <div style={column}>
      <Field label="Default">{(id) => <Input id={id} defaultValue="Asha Patel" />}</Field>
      <Field label="Read-only">{(id) => <Input id={id} readOnly defaultValue="CUST-1042" />}</Field>
      <Field label="Disabled">{(id) => <Input id={id} disabled defaultValue="West" />}</Field>
      <Field label="Invalid">
        {(id) => (
          <>
            <Input
              id={id}
              type="email"
              defaultValue="asha@"
              aria-invalid="true"
              aria-describedby={`${id}-error`}
            />
            <p id={`${id}-error`} style={errorText}>
              <WarningIcon /> Enter an email like name@company.com
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

/** The same heights as Button: an input and a button of the same size line up. */
export const Sizes: Story = {
  parameters: source(`<Input size="sm" aria-label="Small" />
<Input size="md" aria-label="Medium" />
<Input size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <Input size={size} aria-label={`Size ${size}`} placeholder={`size="${size}"`} />
          <Button size={size}>Search</Button>
        </div>
      ))}
    </div>
  ),
};

/** `onChange` receives the value first: `onChange={setName}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [name, setName] = useState('');

<Input id="name" value={name} onChange={setName} />`),
  render: function Render() {
    const [name, setName] = useState('');
    return (
      <div style={column}>
        <Field label="Name">{(id) => <Input id={id} value={name} onChange={setName} />}</Field>
        <output style={{ fontSize: 14 }}>Hello, {name || '…'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'Asha');
    await expect(canvas.getByText('Hello, Asha')).toBeInTheDocument();
  },
};

/**
 * A customer form: validation on submit, the error shown as text and linked with `aria-describedby`, and
 * `aria-invalid` for the red border. Edge case: a read-only customer code, focusable and copyable.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [email, setEmail] = useState('');
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(/^\\S+@\\S+\\.\\S+$/.test(email) ? '' : 'Enter an email like name@company.com');
}}>
  <label htmlFor="code">Customer code</label>
  <Input id="code" readOnly defaultValue="CUST-1042" />

  <label htmlFor="email">Email</label>
  <Input
    id="email"
    type="email"
    required
    value={email}
    onChange={setEmail}
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && <p id="email-error">{error}</p>}

  <Button type="submit" variant="primary">Save customer</Button>
</form>`),
  render: function Render() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Customer"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(/^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter an email like name@company.com');
        }}
      >
        <Field label="Customer code">
          {(id) => <Input id={id} readOnly defaultValue="CUST-1042" />}
        </Field>
        <Field label="Email">
          {(id) => (
            <>
              <Input
                id={id}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={setEmail}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              {error && (
                <p id={`${id}-error`} style={errorText}>
                  <WarningIcon /> {error}
                </p>
              )}
            </>
          )}
        </Field>
        <div>
          <Button type="submit" variant="primary">
            Save customer
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText('Email');
    await userEvent.type(email, 'asha@');
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Enter an email like name@company.com');
    await userEvent.type(email, 'acme.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await expect(email).not.toHaveAttribute('aria-invalid');
  },
};

/** Tab moves between fields, including the read-only one; the label names each field. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="first">First name</label>
<Input id="first" autoComplete="given-name" />
<label htmlFor="code">Customer code</label>
<Input id="code" readOnly defaultValue="CUST-1042" />`),
  render: () => (
    <div style={column}>
      <Field label="First name">{(id) => <Input id={id} autoComplete="given-name" />}</Field>
      <Field label="Customer code">
        {(id) => <Input id={id} readOnly defaultValue="CUST-1042" />}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const first = canvas.getByRole('textbox', { name: 'First name' });
    await expect(first).toHaveFocus();
    await userEvent.keyboard('Asha');
    await expect(first).toHaveValue('Asha');
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Customer code' })).toHaveFocus();
  },
};
