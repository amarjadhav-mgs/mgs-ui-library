import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AutoComplete, Button, WarningIcon } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const cities = ['Ahmedabad', 'Mumbai', 'Nagpur', 'Nashik', 'Pune', 'Surat', 'Thane'];
const domains = ['gmail.com', 'outlook.com', 'yahoo.com'];

const meta = {
  title: 'Components/AutoComplete',
  component: AutoComplete,
  // Docs come from AutoComplete.mdx.
  tags: ['!autodocs'],
  args: { suggestions: cities, onChange: fn(), onSelect: fn() },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: {
      include: [
        'suggestions',
        'value',
        'defaultValue',
        'filter',
        'size',
        'placeholder',
        'disabled',
        'readOnly',
      ],
    },
  },
  argTypes: {
    suggestions: {
      control: 'object',
      description: 'The texts to suggest.',
      table: { type: { summary: 'string[]' } },
    },
    value: { control: 'text', description: 'The text (controlled). Use with `onChange`.' },
    defaultValue: { control: 'text', description: 'The starting text (uncontrolled).' },
    filter: {
      control: 'boolean',
      description: 'Shows only the suggestions that contain the typed text.',
      table: { defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input and Button.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    placeholder: { control: 'text', description: 'An example value. Not a label.' },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or edited; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and copyable, not editable; no suggestions.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(value: string, event) => void`: the text comes first.',
      table: { category: 'Events' },
    },
    onSelect: {
      description: '`(value: string, event) => void`: the user chose a suggestion.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    placeholder: 'e.g. Pune',
    filter: true,
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={column}>
      <Field label="City">{(id) => <AutoComplete {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`const cities = ['Ahmedabad', 'Mumbai', 'Nagpur', 'Nashik', 'Pune'];

<label htmlFor="city">City</label>
<AutoComplete id="city" name="city" suggestions={cities} />`),
  render: () => (
    <div style={column}>
      <Field label="City">
        {(id) => <AutoComplete id={id} name="city" suggestions={cities} />}
      </Field>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<AutoComplete id="city" suggestions={cities} defaultValue="Pune" />
<AutoComplete id="branch" suggestions={cities} readOnly defaultValue="Nashik" />
<AutoComplete id="region" suggestions={cities} disabled defaultValue="Mumbai" />
<AutoComplete id="ship-to" suggestions={cities} aria-invalid="true" aria-describedby="ship-to-error" />`),
  render: () => (
    <div style={column}>
      <Field label="Default">
        {(id) => <AutoComplete id={id} suggestions={cities} defaultValue="Pune" />}
      </Field>
      <Field label="Read-only">
        {(id) => <AutoComplete id={id} suggestions={cities} readOnly defaultValue="Nashik" />}
      </Field>
      <Field label="Disabled">
        {(id) => <AutoComplete id={id} suggestions={cities} disabled defaultValue="Mumbai" />}
      </Field>
      <Field label="Invalid">
        {(id) => (
          <>
            <AutoComplete
              id={id}
              suggestions={cities}
              aria-invalid="true"
              aria-describedby={`${id}-error`}
            />
            <p id={`${id}-error`} style={errorText}>
              <WarningIcon /> Enter the city to ship to
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

/** The same heights as Input and Button. */
export const Sizes: Story = {
  parameters: source(`<AutoComplete size="sm" aria-label="Small" suggestions={cities} />
<AutoComplete size="md" aria-label="Medium" suggestions={cities} />
<AutoComplete size="lg" aria-label="Large" suggestions={cities} />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <AutoComplete
              size={size}
              aria-label={`City, ${size}`}
              suggestions={cities}
              placeholder={`size="${size}"`}
            />
          </div>
          <Button size={size}>Search</Button>
        </div>
      ))}
    </div>
  ),
};

/** `onChange` receives the text first: `onChange={setCity}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [city, setCity] = useState('');

<label htmlFor="city">City</label>
<AutoComplete id="city" suggestions={cities} value={city} onChange={setCity} />`),
  render: function Render() {
    const [city, setCity] = useState('');
    return (
      <div style={column}>
        <Field label="City">
          {(id) => <AutoComplete id={id} suggestions={cities} value={city} onChange={setCity} />}
        </Field>
        <output style={{ fontSize: 14 }}>City: {city || '…'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('City'), 'Kolhapur');
    await expect(canvas.getByText('City: Kolhapur')).toBeInTheDocument();
  },
};

/**
 * Suggestions made from what the user types: an email address with the usual domains. `filter={false}`, because the
 * app already gives the right suggestions for the text. The same goes for suggestions from the server.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [email, setEmail] = useState('');
const name = email.split('@')[0];
const suggestions = name ? domains.map((domain) => \`\${name}@\${domain}\`) : [];

<label htmlFor="email">Email</label>
<AutoComplete
  id="email"
  name="email"
  autoComplete="off"
  inputMode="email"
  suggestions={suggestions}
  filter={false}
  value={email}
  onChange={setEmail}
/>`),
  render: function Render() {
    const [email, setEmail] = useState('');
    const name = email.split('@')[0];
    const suggestions = name ? domains.map((domain) => `${name}@${domain}`) : [];
    return (
      <div style={column}>
        <Field label="Email">
          {(id) => (
            <AutoComplete
              id={id}
              name="email"
              inputMode="email"
              suggestions={suggestions}
              filter={false}
              value={email}
              onChange={setEmail}
            />
          )}
        </Field>
        <output style={{ fontSize: 14 }}>Email: {email || '…'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(canvas.getByLabelText('Email'), 'asha');
    const options = await page.findAllByRole('option');
    await expect(options.map((option) => option.textContent)).toEqual([
      'asha@gmail.com',
      'asha@outlook.com',
      'asha@yahoo.com',
    ]);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(canvas.getByText('Email: asha@outlook.com')).toBeInTheDocument();
  },
};

/**
 * The label names the field. Typing shows the suggestions, ↓ ↑ move through them, Enter chooses, and Esc closes the
 * list and keeps the typed text.
 */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="city">City</label>
<AutoComplete id="city" suggestions={cities} />`),
  render: () => (
    <div style={column}>
      <Field label="City">{(id) => <AutoComplete id={id} suggestions={cities} />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const field = canvas.getByRole('combobox', { name: 'City' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('na');
    const options = await page.findAllByRole('option');
    await expect(options.map((option) => option.textContent)).toEqual(['Nagpur', 'Nashik']);
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(field).toHaveValue('Nashik');
    await expect(field).toHaveFocus();
  },
};
