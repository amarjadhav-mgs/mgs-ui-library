import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Input, InputGroup, PasswordInput, Textarea } from '@mgs/ui';
import CloseIcon from '@rsuite/icons/Close';
import SearchIcon from '@rsuite/icons/Search';

// Values verified against rsuite 6.2.4. `xl` is in the Size type but has no input styles, so it's not offered.
const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const column: CSSProperties = { display: 'grid', gap: 16, maxWidth: 360 };
const labelStyle: CSSProperties = { display: 'block', marginBottom: 4, fontSize: 14 };

/** Story-only helper: a visible label connected to the control through `htmlFor` / `id`. */
function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      {children(id)}
    </div>
  );
}

/** Short, copyable snippet for "Show code" instead of the full story source. */
function source(code: string) {
  return { docs: { source: { code, language: 'tsx' } } };
}

const meta = {
  title: 'Components/Input',
  component: Input,
  // Docs come from Input.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: {
    onChange: fn(),
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Input size. Match the buttons next to it.',
      table: { defaultValue: { summary: 'md' } },
    },
    placeholder: { control: 'text', description: 'Example value. Not a replacement for a label.' },
    disabled: {
      control: 'boolean',
      description: 'Not focusable or editable; not submitted with forms.',
    },
    readOnly: { control: 'boolean', description: 'Focusable and submitted, but not editable.' },
    plaintext: {
      control: 'boolean',
      description: 'Renders the value as plain text (no input). For read-only views.',
    },
    type: { control: 'select', options: ['text', 'email', 'tel', 'url', 'number', 'search'] },
    onChange: { table: { category: 'Events' }, description: '`(value: string, event) => void`' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<label htmlFor="name">Name</label>
<Input id="name" placeholder="e.g. Asha Patel" />`),
  args: {
    size: 'md',
    placeholder: 'e.g. Asha Patel',
    disabled: false,
    readOnly: false,
    plaintext: false,
    type: 'text',
  },
  render: (args) => (
    <div style={column}>
      <Field label="Name">{(id) => <Input {...args} id={id} defaultValue="" />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="email">Email</label>
<Input id="email" type="email" name="email" placeholder="name@company.com" />`),
  render: () => (
    <div style={column}>
      <Field label="Email">
        {(id) => <Input id={id} type="email" name="email" placeholder="name@company.com" />}
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Input size="lg" aria-label="Large" />
<Input size="md" aria-label="Medium" />
<Input size="sm" aria-label="Small" />
<Input size="xs" aria-label="Extra small" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <Input key={size} size={size} aria-label={`Size ${size}`} placeholder={`size="${size}"`} />
      ))}
    </div>
  ),
};

/** `disabled`, `readOnly` and `plaintext` look similar but behave differently; see the docs. */
export const States: Story = {
  name: 'Disabled / Read-only / Plaintext',
  parameters: source(`<Input disabled defaultValue="Disabled" />
<Input readOnly defaultValue="Read-only" />
<Input plaintext defaultValue="Plaintext" />`),
  render: () => (
    <div style={column}>
      <Field label="Disabled">
        {(id) => <Input id={id} disabled defaultValue="Can't focus or edit" />}
      </Field>
      <Field label="Read-only">
        {(id) => <Input id={id} readOnly defaultValue="Can focus and copy, not edit" />}
      </Field>
      <div>
        <span style={labelStyle}>Plaintext</span>
        <Input plaintext defaultValue="Shown as text, no input" />
      </div>
    </div>
  ),
};

/** `onChange` receives the **value first**, then the event (unlike a native input). */
export const Controlled: Story = {
  parameters: source(`const [name, setName] = useState('');

<Input id="name" value={name} onChange={(value) => setName(value)} />`),
  render: function Render() {
    const [name, setName] = useState('');
    return (
      <div style={column}>
        <Field label="Name">{(id) => <Input id={id} value={name} onChange={setName} />}</Field>
        <span style={{ fontSize: 14 }}>Hello, {name || '…'}</span>
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
 * Add text, icons or buttons to an input. `InputGroup.Addon` holds text or an icon,
 * `InputGroup.Button` a button, and `inside` puts them inside the border.
 */
export const InputGroups: Story = {
  name: 'InputGroup',
  parameters: source(`<InputGroup>
  <InputGroup.Addon>https://</InputGroup.Addon>
  <Input id="site" />
  <InputGroup.Addon>.com</InputGroup.Addon>
</InputGroup>

<InputGroup inside>
  <Input aria-label="Search" placeholder="Search" />
  <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
</InputGroup>

<InputGroup>
  <Input aria-label="Search projects" />
  <InputGroup.Button>Search</InputGroup.Button>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <Field label="Website">
        {(id) => (
          <InputGroup>
            <InputGroup.Addon>https://</InputGroup.Addon>
            <Input id={id} />
            <InputGroup.Addon>.com</InputGroup.Addon>
          </InputGroup>
        )}
      </Field>
      <InputGroup inside>
        <Input aria-label="Search" placeholder="Search" />
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup>
      <InputGroup>
        <Input aria-label="Search projects" placeholder="Project name" />
        <InputGroup.Button>Search</InputGroup.Button>
      </InputGroup>
      <InputGroup size="sm">
        <InputGroup.Addon>₹</InputGroup.Addon>
        <Input aria-label="Amount" placeholder="0.00" />
      </InputGroup>
    </div>
  ),
};

/** Multi-line text. `autosize` grows the field with its content between `minRows` and `maxRows`. */
/**
 * RSuite's Input has no built-in clear button. For search and filter fields, add one with
 * `InputGroup`: give it an `aria-label`, show it only when there's text, and move focus back to the input.
 */
export const Clearable: Story = {
  parameters: source(`const [query, setQuery] = useState('');
const inputRef = useRef<HTMLInputElement>(null);

<InputGroup inside>
  <Input ref={inputRef} aria-label="Search projects" value={query} onChange={setQuery} />
  {query && (
    <InputGroup.Button
      aria-label="Clear search"
      onClick={() => {
        setQuery('');
        inputRef.current?.focus();
      }}
    >
      <CloseIcon />
    </InputGroup.Button>
  )}
</InputGroup>`),
  render: function Render() {
    const [query, setQuery] = useState('Design system');
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div style={column}>
        <InputGroup inside>
          <Input ref={inputRef} aria-label="Search projects" value={query} onChange={setQuery} />
          {query && (
            <InputGroup.Button
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <CloseIcon />
            </InputGroup.Button>
          )}
        </InputGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search projects');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  },
};

export const TextareaStory: Story = {
  name: 'Textarea',
  parameters: source(`<Textarea id="notes" rows={3} />

<Textarea id="comment" autosize minRows={2} maxRows={6} />`),
  render: () => (
    <div style={column}>
      <Field label="Notes">{(id) => <Textarea id={id} rows={3} />}</Field>
      <Field label="Comment (grows as you type)">
        {(id) => <Textarea id={id} autosize minRows={2} maxRows={6} />}
      </Field>
    </div>
  ),
};

/**
 * Password field with a show/hide button. Label it with `<label htmlFor>` + `id`:
 * `aria-label` and `aria-describedby` go to the wrapper, not the input. See the docs for its limitations.
 */
export const Password: Story = {
  name: 'PasswordInput',
  parameters: source(`<label htmlFor="password">Password</label>
<PasswordInput id="password" name="password" />`),
  render: () => (
    <div style={column}>
      <Field label="Password">{(id) => <PasswordInput id={id} name="password" />}</Field>
    </div>
  ),
};

/**
 * Show errors in text next to the field, linked with `aria-describedby`, and mark the field with
 * `aria-invalid`. Colour alone isn't enough.
 */
export const Validation: Story = {
  parameters: source(`<label htmlFor="email">Email</label>
<Input
  id="email"
  type="email"
  aria-invalid={Boolean(error)}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <p id="email-error">{error}</p>}`),
  render: function Render() {
    const [email, setEmail] = useState('asha@');
    const error = /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter an email like name@company.com';
    return (
      <div style={column}>
        <Field label="Email">
          {(id) => (
            <>
              <Input
                id={id}
                type="email"
                value={email}
                onChange={setEmail}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                style={error ? { borderColor: 'var(--rs-red-500)' } : undefined}
              />
              {error && (
                <p
                  id={`${id}-error`}
                  style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--rs-red-500)' }}
                >
                  {error}
                </p>
              )}
            </>
          )}
        </Field>
      </div>
    );
  },
};

/** Every input has a label; Tab moves between fields; Enter can submit via `onPressEnter`. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="first">First name</label>
<Input id="first" onPressEnter={handleSubmit} />`),
  args: { onPressEnter: fn() },
  render: (args) => (
    <div style={column}>
      <Field label="First name">{(id) => <Input id={id} onPressEnter={args.onPressEnter} />}</Field>
      <Field label="Last name">{(id) => <Input id={id} />}</Field>
      <Button appearance="primary">Continue</Button>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText('First name');

    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard('Asha{Enter}');
    await expect(first).toHaveValue('Asha');
    await expect(args.onPressEnter).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    await expect(canvas.getByLabelText('Last name')).toHaveFocus();
  },
};
