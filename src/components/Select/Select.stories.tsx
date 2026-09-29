import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Input, Select, type SelectOption, WarningIcon } from '@mgs/ui';
import { column, labelStyle, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const statuses: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const channels: SelectOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS (add a phone number first)', disabled: true },
  { value: 'post', label: 'Post' },
];

const cities: SelectOption[] = [
  { value: 'pune', label: 'Pune', group: 'Maharashtra' },
  { value: 'mumbai', label: 'Mumbai', group: 'Maharashtra' },
  { value: 'nashik', label: 'Nashik', group: 'Maharashtra' },
  { value: 'ahmedabad', label: 'Ahmedabad', group: 'Gujarat' },
  { value: 'surat', label: 'Surat', group: 'Gujarat' },
];

const customers: SelectOption[] = [
  'Acme Traders',
  'Blue Hill Stores',
  'Coastal Supplies',
  'Deccan Foods',
  'Eastern Mills',
  'Five Rivers Agro',
  'Green Valley Farms',
  'Harbour Logistics',
].map((name) => ({ value: name.toLowerCase().replace(/\s+/g, '-'), label: name }));

/** A visible label connected to the field through its `id` and `aria-labelledby`. */
function Labelled({
  label,
  children,
}: {
  label: string;
  children: (labelId: string) => React.ReactNode;
}) {
  const id = `${label.toLowerCase().replace(/[^a-z]+/g, '-')}-label`;
  return (
    <div>
      <span id={id} style={labelStyle}>
        {label}
      </span>
      {children(id)}
    </div>
  );
}

const meta = {
  title: 'Components/Select',
  component: Select,
  // Docs come from Select.mdx.
  tags: ['!autodocs'],
  args: { options: statuses, onChange: fn() },
  parameters: {
    // Only the MGS API; native attributes also work but would flood the table.
    controls: {
      include: [
        'options',
        'value',
        'defaultValue',
        'placeholder',
        'size',
        'searchable',
        'emptyText',
        'clearable',
        'loading',
        'disabled',
        'readOnly',
        'name',
      ],
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'The options: `{ value, label, disabled?, group? }`.',
      table: { type: { summary: 'SelectOption[]' } },
    },
    value: {
      control: 'text',
      description: 'The chosen value (controlled); `null` when none. Use with `onChange`.',
      table: { type: { summary: 'string | null' } },
    },
    defaultValue: { control: 'text', description: 'The value chosen at the start (uncontrolled).' },
    placeholder: { control: 'text', description: 'Shown while nothing is chosen. Not a label.' },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input and Button.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    searchable: {
      control: 'boolean',
      description: 'A search box above the list.',
      table: { defaultValue: { summary: 'false' } },
    },
    emptyText: {
      control: 'text',
      description: 'Shown in the list when there are no options, or none match the search.',
    },
    clearable: {
      control: 'boolean',
      description: 'A button in the field that removes the chosen value.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Busy: the options are being loaded.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or opened; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and readable, not changeable; submitted with a form.',
      table: { defaultValue: { summary: 'false' } },
    },
    name: { control: 'text', description: 'The `name` a form submits the value with.' },
    onChange: {
      description: '`(value: string | null, event) => void`: the value comes first.',
      table: { category: 'Events' },
    },
    onSearch: {
      description: '`(text: string) => void`: load matching options from the server.',
      table: { category: 'Events' },
    },
    onOpenChange: {
      description: '`(open: boolean) => void`',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    placeholder: 'Choose a status',
    size: 'md',
    searchable: false,
    clearable: false,
    loading: false,
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={column}>
      <Labelled label="Status">
        {(labelId) => <Select {...args} aria-labelledby={labelId} />}
      </Labelled>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paid', label: 'Paid' },
];

<span id="status-label">Status</span>
<Select aria-labelledby="status-label" name="status" options={statuses} placeholder="Choose a status" />`),
  render: () => (
    <div style={column}>
      <Labelled label="Status">
        {(labelId) => (
          <Select
            aria-labelledby={labelId}
            name="status"
            options={statuses}
            placeholder="Choose a status"
          />
        )}
      </Labelled>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<Select aria-label="Default" options={statuses} defaultValue="open" />
<Select aria-label="Read-only" options={statuses} defaultValue="paid" readOnly />
<Select aria-label="Disabled" options={statuses} defaultValue="draft" disabled />
<Select aria-label="Loading" options={[]} loading placeholder="Loading customers…" />
<Select aria-label="Invalid" options={statuses} aria-invalid="true" aria-describedby="status-error" />
<p id="status-error">Choose a status</p>`),
  render: () => (
    <div style={column}>
      <Labelled label="Default">
        {(labelId) => <Select aria-labelledby={labelId} options={statuses} defaultValue="open" />}
      </Labelled>
      <Labelled label="Read-only">
        {(labelId) => (
          <Select aria-labelledby={labelId} options={statuses} defaultValue="paid" readOnly />
        )}
      </Labelled>
      <Labelled label="Disabled">
        {(labelId) => (
          <Select aria-labelledby={labelId} options={statuses} defaultValue="draft" disabled />
        )}
      </Labelled>
      <Labelled label="Loading">
        {(labelId) => (
          <Select aria-labelledby={labelId} options={[]} loading placeholder="Loading customers…" />
        )}
      </Labelled>
      <Labelled label="Invalid">
        {(labelId) => (
          <>
            <Select
              aria-labelledby={labelId}
              options={statuses}
              placeholder="Choose a status"
              aria-invalid="true"
              aria-describedby="states-status-error"
            />
            <p id="states-status-error" style={errorText}>
              <WarningIcon /> Choose a status
            </p>
          </>
        )}
      </Labelled>
    </div>
  ),
};

/** The same heights as Input and Button: a row of the same size lines up. */
export const Sizes: Story = {
  parameters: source(`<Select size="sm" aria-label="Small" options={statuses} />
<Select size="md" aria-label="Medium" options={statuses} />
<Select size="lg" aria-label="Large" options={statuses} />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Select
              size={size}
              aria-label={`Status, ${size}`}
              options={statuses}
              placeholder={`size="${size}"`}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input size={size} aria-label={`Reference, ${size}`} placeholder="Reference" />
          </div>
          <Button size={size}>Filter</Button>
        </div>
      ))}
    </div>
  ),
};

/** A search box above the list, for lists too long to scan. `emptyText` says what wasn't found. */
export const Searchable: Story = {
  parameters: source(`<Select
  aria-labelledby="customer-label"
  options={customers}
  searchable
  emptyText="No customers found"
  placeholder="Choose a customer"
/>`),
  render: () => (
    <div style={column}>
      <Labelled label="Customer">
        {(labelId) => (
          <Select
            aria-labelledby={labelId}
            options={customers}
            searchable
            emptyText="No customers found"
            placeholder="Choose a customer"
          />
        )}
      </Labelled>
    </div>
  ),
};

/** For a value that may be empty: a filter, an optional field. Clearing gives `null`. */
export const Clearable: Story = {
  parameters: source(
    `<Select aria-labelledby="status-label" options={statuses} defaultValue="open" clearable />`,
  ),
  render: () => (
    <div style={column}>
      <Labelled label="Status filter">
        {(labelId) => (
          <Select aria-labelledby={labelId} options={statuses} defaultValue="open" clearable />
        )}
      </Labelled>
    </div>
  ),
};

/** Options with the same `group` are listed under that heading. */
export const Groups: Story = {
  parameters: source(`const cities = [
  { value: 'pune', label: 'Pune', group: 'Maharashtra' },
  { value: 'mumbai', label: 'Mumbai', group: 'Maharashtra' },
  { value: 'surat', label: 'Surat', group: 'Gujarat' },
];

<Select aria-labelledby="city-label" options={cities} placeholder="Choose a city" />`),
  render: () => (
    <div style={column}>
      <Labelled label="City">
        {(labelId) => (
          <Select aria-labelledby={labelId} options={cities} placeholder="Choose a city" />
        )}
      </Labelled>
    </div>
  ),
};

/** An option with `disabled` is shown but can't be chosen. Say why in its label. */
export const DisabledOptions: Story = {
  name: 'Disabled options',
  parameters: source(`const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS (add a phone number first)', disabled: true },
  { value: 'post', label: 'Post' },
];

<Select aria-labelledby="channel-label" options={channels} defaultValue="email" />`),
  render: () => (
    <div style={column}>
      <Labelled label="Send by">
        {(labelId) => <Select aria-labelledby={labelId} options={channels} defaultValue="email" />}
      </Labelled>
    </div>
  ),
};

/** `onChange` receives the value first: `onChange={setStatus}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [status, setStatus] = useState<string | null>('open');

<Select aria-labelledby="status-label" options={statuses} value={status} onChange={setStatus} clearable />`),
  render: function Render() {
    const [status, setStatus] = useState<string | null>('open');
    return (
      <div style={column}>
        <Labelled label="Status">
          {(labelId) => (
            <Select
              aria-labelledby={labelId}
              options={statuses}
              value={status}
              onChange={setStatus}
              clearable
            />
          )}
        </Labelled>
        <output style={{ fontSize: 14 }}>Value: {status ?? 'null'}</output>
        <div>
          <Button size="sm" onClick={() => setStatus('paid')}>
            Set to Paid
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Set to Paid' }));
    await expect(canvas.getByText('Value: paid')).toBeInTheDocument();
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Paid');
  },
};

/**
 * A form with two selects that depend on each other, a required choice validated on submit, and options loaded on
 * search. Changing the state clears the city; the city is disabled until a state is chosen.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [state, setState] = useState<string | null>(null);
const [city, setCity] = useState<string | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(city === null ? 'Choose a city' : '');
}}>
  <span id="state-label">State</span>
  <Select
    aria-labelledby="state-label"
    name="state"
    options={states}
    value={state}
    onChange={(next) => {
      setState(next);
      setCity(null);
    }}
  />

  <span id="city-label">City</span>
  <Select
    aria-labelledby="city-label"
    name="city"
    options={cities.filter((option) => option.group === state)}
    value={city}
    onChange={setCity}
    disabled={state === null}
    searchable
    emptyText="No cities found"
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'city-error' : undefined}
  />
  {error && <p id="city-error">{error}</p>}

  <Button type="submit" variant="primary">Save address</Button>
</form>`),
  render: function Render() {
    const [state, setState] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [error, setError] = useState('');
    const states = [...new Set(cities.map((option) => option.group as string))].map((name) => ({
      value: name,
      label: name,
    }));
    return (
      <form
        noValidate
        aria-label="Address"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(city === null ? 'Choose a city' : '');
        }}
      >
        <Labelled label="State">
          {(labelId) => (
            <Select
              aria-labelledby={labelId}
              name="state"
              options={states}
              value={state}
              placeholder="Choose a state"
              onChange={(next) => {
                setState(next);
                setCity(null);
              }}
            />
          )}
        </Labelled>
        <Labelled label="City">
          {(labelId) => (
            <>
              <Select
                aria-labelledby={labelId}
                name="city"
                options={cities
                  .filter((option) => option.group === state)
                  .map(({ value, label }) => ({ value, label }))}
                value={city}
                onChange={setCity}
                disabled={state === null}
                searchable
                emptyText="No cities found"
                placeholder={state === null ? 'Choose a state first' : 'Choose a city'}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'advanced-city-error' : undefined}
              />
              {error && (
                <p id="advanced-city-error" style={errorText}>
                  <WarningIcon /> {error}
                </p>
              )}
            </>
          )}
        </Labelled>
        <div>
          <Button type="submit" variant="primary">
            Save address
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const city = canvas.getByRole('combobox', { name: 'City' });
    await expect(city).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Save address' }));
    await expect(city).toHaveAttribute('aria-invalid', 'true');
    await expect(city).toHaveAccessibleDescription(/Choose a city/);
  },
};

/**
 * The label names the field. Enter or ↓ opens the list, ↑ ↓ move through the options, Enter chooses, and Esc closes
 * the list and keeps the value.
 */
export const Accessibility: Story = {
  parameters: source(`<span id="status-label">Status</span>
<Select aria-labelledby="status-label" options={statuses} defaultValue="open" />`),
  render: () => (
    <div style={column}>
      <Labelled label="Status">
        {(labelId) => <Select aria-labelledby={labelId} options={statuses} defaultValue="open" />}
      </Labelled>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Status' });
    await expect(field).toHaveTextContent('Open');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    // The list is rendered at the end of the page, outside the story's element.
    const page = within(canvasElement.ownerDocument.body);
    const list = await page.findByRole('listbox');
    await expect(within(list).getByRole('option', { name: 'Open' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(field).toHaveTextContent('Paid');
    await expect(field).toHaveFocus();
  },
};
