import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Input, MultiSelect, type SelectOption, WarningIcon } from '@mgs/ui';
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

const modules: SelectOption[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'reports', label: 'Reports' },
  { value: 'settings', label: 'Settings (administrators only)', disabled: true },
];

const cities: SelectOption[] = [
  { value: 'pune', label: 'Pune', group: 'Maharashtra' },
  { value: 'mumbai', label: 'Mumbai', group: 'Maharashtra' },
  { value: 'nashik', label: 'Nashik', group: 'Maharashtra' },
  { value: 'ahmedabad', label: 'Ahmedabad', group: 'Gujarat' },
  { value: 'surat', label: 'Surat', group: 'Gujarat' },
];

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
  title: 'Components/MultiSelect',
  component: MultiSelect,
  // Docs come from MultiSelect.mdx.
  tags: ['!autodocs'],
  args: { options: modules, onChange: fn() },
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
      control: 'object',
      description: 'The chosen values (controlled); `[]` when none. Use with `onChange`.',
      table: { type: { summary: 'string[]' } },
    },
    defaultValue: {
      control: 'object',
      description: 'The values chosen at the start (uncontrolled).',
      table: { type: { summary: 'string[]' }, defaultValue: { summary: '[]' } },
    },
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
      description: 'A button in the field that removes every chosen value.',
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
    name: { control: 'text', description: 'The `name` a form submits the values with.' },
    onChange: {
      description: '`(value: string[], event) => void`: the values come first.',
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
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    placeholder: 'Choose modules',
    size: 'md',
    searchable: false,
    clearable: false,
    loading: false,
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={column}>
      <Labelled label="Modules">
        {(labelId) => <MultiSelect {...args} aria-labelledby={labelId} />}
      </Labelled>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`const modules = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'reports', label: 'Reports' },
];

<span id="modules-label">Modules</span>
<MultiSelect
  aria-labelledby="modules-label"
  name="modules"
  options={modules}
  defaultValue={['orders', 'invoices']}
  placeholder="Choose modules"
/>`),
  render: () => (
    <div style={column}>
      <Labelled label="Modules">
        {(labelId) => (
          <MultiSelect
            aria-labelledby={labelId}
            name="modules"
            options={modules}
            defaultValue={['orders', 'invoices']}
            placeholder="Choose modules"
          />
        )}
      </Labelled>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters:
    source(`<MultiSelect aria-label="Default" options={modules} defaultValue={['orders']} />
<MultiSelect aria-label="Read-only" options={modules} defaultValue={['orders', 'reports']} readOnly />
<MultiSelect aria-label="Disabled" options={modules} defaultValue={['invoices']} disabled />
<MultiSelect aria-label="Loading" options={[]} loading placeholder="Loading modules…" />
<MultiSelect aria-label="Invalid" options={modules} aria-invalid="true" aria-describedby="modules-error" />
<p id="modules-error">Choose at least one module</p>`),
  render: () => (
    <div style={column}>
      <Labelled label="Default">
        {(labelId) => (
          <MultiSelect aria-labelledby={labelId} options={modules} defaultValue={['orders']} />
        )}
      </Labelled>
      <Labelled label="Read-only">
        {(labelId) => (
          <MultiSelect
            aria-labelledby={labelId}
            options={modules}
            defaultValue={['orders', 'reports']}
            readOnly
          />
        )}
      </Labelled>
      <Labelled label="Disabled">
        {(labelId) => (
          <MultiSelect
            aria-labelledby={labelId}
            options={modules}
            defaultValue={['invoices']}
            disabled
          />
        )}
      </Labelled>
      <Labelled label="Loading">
        {(labelId) => (
          <MultiSelect
            aria-labelledby={labelId}
            options={[]}
            loading
            placeholder="Loading modules…"
          />
        )}
      </Labelled>
      <Labelled label="Invalid">
        {(labelId) => (
          <>
            <MultiSelect
              aria-labelledby={labelId}
              options={modules}
              placeholder="Choose modules"
              aria-invalid="true"
              aria-describedby="states-modules-error"
            />
            <p id="states-modules-error" style={errorText}>
              <WarningIcon /> Choose at least one module
            </p>
          </>
        )}
      </Labelled>
    </div>
  ),
};

/** The same heights as Input and Button. The field keeps its height however many options are chosen. */
export const Sizes: Story = {
  parameters: source(`<MultiSelect size="sm" aria-label="Small" options={modules} />
<MultiSelect size="md" aria-label="Medium" options={modules} />
<MultiSelect size="lg" aria-label="Large" options={modules} />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              size={size}
              aria-label={`Modules, ${size}`}
              options={modules}
              defaultValue={['orders', 'invoices', 'payments', 'reports']}
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

/** A search box above the list, and a button that removes every chosen value. */
export const SearchableAndClearable: Story = {
  name: 'Searchable and clearable',
  parameters: source(`<MultiSelect
  aria-labelledby="cities-label"
  options={cities}
  defaultValue={['pune']}
  searchable
  clearable
  emptyText="No cities found"
/>`),
  render: () => (
    <div style={column}>
      <Labelled label="Cities">
        {(labelId) => (
          <MultiSelect
            aria-labelledby={labelId}
            options={cities}
            defaultValue={['pune']}
            searchable
            clearable
            emptyText="No cities found"
          />
        )}
      </Labelled>
    </div>
  ),
};

/** `onChange` receives the values first: `onChange={setChosen}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [chosen, setChosen] = useState(['orders']);

<MultiSelect aria-labelledby="modules-label" options={modules} value={chosen} onChange={setChosen} />`),
  render: function Render() {
    const [chosen, setChosen] = useState(['orders']);
    return (
      <div style={column}>
        <Labelled label="Modules">
          {(labelId) => (
            <MultiSelect
              aria-labelledby={labelId}
              options={modules}
              value={chosen}
              onChange={setChosen}
            />
          )}
        </Labelled>
        <output style={{ fontSize: 14 }}>Value: {chosen.join(', ') || 'none'}</output>
        <div>
          <Button size="sm" onClick={() => setChosen(['orders', 'reports'])}>
            Set to Orders and Reports
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Set to Orders and Reports' }));
    await expect(canvas.getByText('Value: orders, reports')).toBeInTheDocument();
    await expect(canvas.getByRole('combobox', { name: 'Modules' })).toHaveTextContent(
      'Orders,Reports',
    );
  },
};

/**
 * A form that needs at least one value: validation on submit, the error linked with `aria-describedby`, and
 * `aria-invalid` for the red border.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [access, setAccess] = useState<string[]>([]);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(access.length === 0 ? 'Choose at least one module' : '');
}}>
  <span id="access-label">Modules this role can open</span>
  <MultiSelect
    aria-labelledby="access-label"
    name="access"
    options={modules}
    value={access}
    onChange={setAccess}
    clearable
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'access-error' : undefined}
  />
  {error && <p id="access-error">{error}</p>}

  <Button type="submit" variant="primary">Save role</Button>
</form>`),
  render: function Render() {
    const [access, setAccess] = useState<string[]>([]);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Role"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(access.length === 0 ? 'Choose at least one module' : '');
        }}
      >
        <Labelled label="Modules this role can open">
          {(labelId) => (
            <>
              <MultiSelect
                aria-labelledby={labelId}
                name="access"
                options={modules}
                value={access}
                onChange={setAccess}
                clearable
                placeholder="Choose modules"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'advanced-access-error' : undefined}
              />
              {error && (
                <p id="advanced-access-error" style={errorText}>
                  <WarningIcon /> {error}
                </p>
              )}
            </>
          )}
        </Labelled>
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
    const field = canvas.getByRole('combobox', { name: 'Modules this role can open' });
    await userEvent.click(canvas.getByRole('button', { name: 'Save role' }));
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription(/Choose at least one module/);
  },
};

/**
 * The label names the field. Enter or ↓ opens the list, ↑ ↓ move through the options, Enter or Space checks and
 * unchecks, and Esc closes the list. The list stays open while choosing.
 */
export const Accessibility: Story = {
  parameters: source(`<span id="modules-label">Modules</span>
<MultiSelect aria-labelledby="modules-label" options={modules} defaultValue={['orders']} />`),
  render: () => (
    <div style={column}>
      <Labelled label="Modules">
        {(labelId) => (
          <MultiSelect aria-labelledby={labelId} options={modules} defaultValue={['orders']} />
        )}
      </Labelled>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Modules' });
    await expect(field).toHaveTextContent('Orders');
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    // The list is rendered at the end of the page, outside the story's element.
    const page = within(canvasElement.ownerDocument.body);
    const list = await page.findByRole('listbox');
    await expect(list).toHaveAttribute('aria-multiselectable', 'true');
    await expect(within(list).getByRole('option', { name: 'Orders' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(field).toHaveTextContent('Orders,Invoices');
    // Still open: more options can be chosen.
    await expect(field).toHaveAttribute('aria-expanded', 'true');
  },
};
