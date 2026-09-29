import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Checkbox, WarningIcon } from '@mgs/ui';
import { column, source } from '../../stories/shared';

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const cell = { padding: '4px 12px', textAlign: 'start' } as const;

const invoices = [
  { id: 'INV-1041', customer: 'Acme Traders' },
  { id: 'INV-1042', customer: 'Blue Hill Stores' },
  { id: 'INV-1043', customer: 'Coastal Supplies' },
];

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // Docs come from Checkbox.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: {
      include: ['children', 'checked', 'defaultChecked', 'indeterminate', 'value', 'disabled'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The visible label. Without one, set `aria-label` or `aria-labelledby`.',
    },
    checked: {
      control: 'boolean',
      description: 'Whether it is checked (controlled). Use with `onChange`.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Whether it starts checked (uncontrolled).',
      table: { defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Shows a dash: some, but not all, of the items it stands for are selected.',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'Its value in a `CheckboxGroup`, and what a form submits with `name`.',
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or changed; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(checked: boolean, event) => void`: the new state comes first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    children: 'Send me product updates',
    indeterminate: false,
    disabled: false,
  },
};

export const Basic: Story = {
  parameters: source(`<Checkbox name="updates" defaultChecked>
  Send me product updates
</Checkbox>`),
  render: () => (
    <Checkbox name="updates" defaultChecked>
      Send me product updates
    </Checkbox>
  ),
};

/** Invalid isn't a prop: set `aria-invalid="true"`, and link the error text with `aria-describedby`. */
export const States: Story = {
  parameters: source(`<Checkbox>Unchecked</Checkbox>
<Checkbox defaultChecked>Checked</Checkbox>
<Checkbox indeterminate>Indeterminate</Checkbox>
<Checkbox disabled>Disabled</Checkbox>
<Checkbox disabled defaultChecked>Disabled, checked</Checkbox>
<Checkbox aria-invalid="true" aria-describedby="terms-error">I accept the terms</Checkbox>
<p id="terms-error">Accept the terms to continue</p>`),
  render: () => (
    <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled, checked
      </Checkbox>
      <Checkbox disabled indeterminate>
        Disabled, indeterminate
      </Checkbox>
      <div>
        <Checkbox aria-invalid="true" aria-describedby="states-terms-error">
          I accept the terms
        </Checkbox>
        <p id="states-terms-error" style={errorText}>
          <WarningIcon /> Accept the terms to continue
        </p>
      </div>
    </div>
  ),
};

/** `onChange` receives the new state first: `onChange={setSubscribed}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [subscribed, setSubscribed] = useState(false);

<Checkbox checked={subscribed} onChange={setSubscribed}>
  Send me product updates
</Checkbox>`),
  render: function Render() {
    const [subscribed, setSubscribed] = useState(false);
    return (
      <div style={column}>
        <Checkbox checked={subscribed} onChange={setSubscribed}>
          Send me product updates
        </Checkbox>
        <output style={{ fontSize: 14 }}>Updates: {subscribed ? 'on' : 'off'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Send me product updates' }));
    await expect(canvas.getByText('Updates: on')).toBeInTheDocument();
  },
};

/**
 * The label can be long, and can contain links: the box stays next to the first line. Underline a link inside text,
 * so it isn't told apart by colour alone.
 */
export const LongLabel: Story = {
  name: 'Long label',
  parameters: source(`<Checkbox name="terms">
  I have read and accept the{' '}
  <a href="/terms" style={{ textDecoration: 'underline' }}>terms of service</a>{' '}
  and the privacy policy, including how my data is stored and shared
</Checkbox>`),
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Checkbox name="terms">
        I have read and accept the{' '}
        <a href="#terms" style={{ textDecoration: 'underline' }}>
          terms of service
        </a>{' '}
        and the privacy policy, including how my data is stored and shared
      </Checkbox>
    </div>
  ),
};

/**
 * Rows of a table have no visible label: name each checkbox with `aria-label`. "Select all" is checked when every row
 * is selected, and `indeterminate` when only some are.
 */
export const SelectAll: Story = {
  name: 'Select all',
  parameters: source(`const [selected, setSelected] = useState<string[]>(['INV-1042']);
const all = selected.length === invoices.length;

<Checkbox
  aria-label="Select all invoices"
  checked={all}
  indeterminate={selected.length > 0 && !all}
  onChange={(checked) => setSelected(checked ? invoices.map((invoice) => invoice.id) : [])}
/>

{invoices.map((invoice) => (
  <Checkbox
    key={invoice.id}
    aria-label={\`Select invoice \${invoice.id}\`}
    checked={selected.includes(invoice.id)}
    onChange={(checked) =>
      setSelected(checked ? [...selected, invoice.id] : selected.filter((id) => id !== invoice.id))
    }
  />
))}`),
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['INV-1042']);
    const all = selected.length === invoices.length;
    return (
      <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
        <caption style={{ ...cell, captionSide: 'top' }}>
          Invoices ({selected.length} selected)
        </caption>
        <thead>
          <tr>
            <th style={cell}>
              <Checkbox
                aria-label="Select all invoices"
                checked={all}
                indeterminate={selected.length > 0 && !all}
                onChange={(checked) =>
                  setSelected(checked ? invoices.map((invoice) => invoice.id) : [])
                }
              />
            </th>
            <th style={cell}>Invoice</th>
            <th style={cell}>Customer</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td style={cell}>
                <Checkbox
                  aria-label={`Select invoice ${invoice.id}`}
                  checked={selected.includes(invoice.id)}
                  onChange={(checked) =>
                    setSelected(
                      checked
                        ? [...selected, invoice.id]
                        : selected.filter((id) => id !== invoice.id),
                    )
                  }
                />
              </td>
              <td style={cell}>{invoice.id}</td>
              <td style={cell}>{invoice.customer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole<HTMLInputElement>('checkbox', { name: 'Select all invoices' });
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(all).not.toBePartiallyChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Select invoice INV-1043' })).toBeChecked();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select invoice INV-1041' }));
    await expect(all).toBePartiallyChecked();
    await expect(canvas.getByText('Invoices (2 selected)')).toBeInTheDocument();
  },
};

/**
 * A sign-up form that must have the terms accepted: validation on submit, the error shown as text and linked with
 * `aria-describedby`, and `aria-invalid` for the red border. The form submits `updates=yes` only when that box is
 * checked.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [accepted, setAccepted] = useState(false);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(accepted ? '' : 'Accept the terms to create the account');
}}>
  <Checkbox name="updates" value="yes">Send me product updates</Checkbox>

  <Checkbox
    name="terms"
    required
    checked={accepted}
    onChange={setAccepted}
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'terms-error' : undefined}
  >
    I accept the terms of service
  </Checkbox>
  {error && <p id="terms-error">{error}</p>}

  <Button type="submit" variant="primary">Create account</Button>
</form>`),
  render: function Render() {
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Create account"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(accepted ? '' : 'Accept the terms to create the account');
        }}
      >
        <div>
          <Checkbox name="updates" value="yes">
            Send me product updates
          </Checkbox>
        </div>
        <div>
          <Checkbox
            name="terms"
            required
            checked={accepted}
            onChange={setAccepted}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'advanced-terms-error' : undefined}
          >
            I accept the terms of service
          </Checkbox>
          {error && (
            <p id="advanced-terms-error" style={errorText}>
              <WarningIcon /> {error}
            </p>
          )}
        </div>
        <div>
          <Button type="submit" variant="primary">
            Create account
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const terms = canvas.getByRole('checkbox', { name: 'I accept the terms of service' });
    const submit = canvas.getByRole('button', { name: 'Create account' });
    await userEvent.click(submit);
    await expect(terms).toHaveAttribute('aria-invalid', 'true');
    await expect(terms).toHaveAccessibleDescription('Accept the terms to create the account');
    await userEvent.click(terms);
    await userEvent.click(submit);
    await expect(terms).not.toHaveAttribute('aria-invalid');
  },
};

/** Tab moves to each checkbox and skips disabled ones; Space checks and unchecks. */
export const Accessibility: Story = {
  parameters: source(`<Checkbox>Email me the invoice</Checkbox>
<Checkbox disabled>Send a printed copy</Checkbox>
<Checkbox aria-label="Select invoice INV-1041" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
      <Checkbox>Email me the invoice</Checkbox>
      <Checkbox disabled>Send a printed copy</Checkbox>
      <Checkbox aria-label="Select invoice INV-1041" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole('checkbox', { name: 'Email me the invoice' });
    await userEvent.tab();
    await expect(email).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(email).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(email).not.toBeChecked();
    // The disabled checkbox is skipped; the one without a visible label has a name.
    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: 'Select invoice INV-1041' })).toHaveFocus();
  },
};
