import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Button,
  CloseIcon,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  SearchIcon,
} from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  // Docs come from InputGroup.mdx.
  tags: ['!autodocs'],
  parameters: {
    controls: { include: ['size', 'inside', 'disabled'] },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size of everything in the group, including the input.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    inside: {
      control: 'boolean',
      description: "Add-ons inside the input's border instead of attached boxes.",
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input, the add-ons and the buttons together.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change the group's props in the Controls panel. */
export const Playground: Story = {
  args: { size: 'md', inside: false, disabled: false },
  render: (args) => (
    <div style={column}>
      <Field label="Amount (₹)">
        {(id) => (
          <InputGroup {...args}>
            <InputGroupAddon>₹</InputGroupAddon>
            <Input id={id} placeholder="0.00" inputMode="decimal" />
          </InputGroup>
        )}
      </Field>
    </div>
  ),
};

/** Attached add-ons: a prefix and a suffix around the input. */
export const Basic: Story = {
  parameters: source(`<label htmlFor="website">Website</label>
<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <Input id="website" />
  <InputGroupAddon>.com</InputGroupAddon>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <Field label="Website">
        {(id) => (
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <Input id={id} />
            <InputGroupAddon>.com</InputGroupAddon>
          </InputGroup>
        )}
      </Field>
    </div>
  ),
};

/** `inside` puts an icon or a button inside the input's border; `InputGroupButton` attaches a button. */
export const IconsAndButtons: Story = {
  name: 'Icons and buttons',
  parameters: source(`<InputGroup inside>
  <InputGroupAddon><SearchIcon /></InputGroupAddon>
  <Input type="search" aria-label="Search orders" />
</InputGroup>

<InputGroup>
  <Input id="project" />
  <InputGroupButton>Search</InputGroupButton>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <InputGroup inside>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <Input type="search" aria-label="Search orders" placeholder="Search orders" />
      </InputGroup>
      <Field label="Project">
        {(id) => (
          <InputGroup>
            <Input id={id} />
            <InputGroupButton>Search</InputGroupButton>
          </InputGroup>
        )}
      </Field>
    </div>
  ),
};

/** `disabled` on the group disables everything in it; `aria-invalid` on the input turns the group's border red. */
export const States: Story = {
  parameters: source(`<InputGroup disabled>
  <InputGroupAddon>₹</InputGroupAddon>
  <Input id="limit" defaultValue="50,000" />
</InputGroup>

<InputGroup>
  <Input id="weight" aria-invalid="true" aria-describedby="weight-error" />
  <InputGroupAddon>kg</InputGroupAddon>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <Field label="Credit limit (₹)">
        {(id) => (
          <InputGroup disabled>
            <InputGroupAddon>₹</InputGroupAddon>
            <Input id={id} defaultValue="50,000" />
          </InputGroup>
        )}
      </Field>
      <Field label="Weight (kg)">
        {(id) => (
          <>
            <InputGroup>
              <Input
                id={id}
                defaultValue="-2"
                aria-invalid="true"
                aria-describedby={`${id}-error`}
              />
              <InputGroupAddon>kg</InputGroupAddon>
            </InputGroup>
            <p id={`${id}-error`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              Enter a weight above 0.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

/** The group's `size` applies to the input and add-ons, and matches Button. */
export const Sizes: Story = {
  parameters: source(`<InputGroup size="sm">…</InputGroup>
<InputGroup size="md">…</InputGroup>
<InputGroup size="lg">…</InputGroup>`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <InputGroup size={size}>
            <InputGroupAddon>₹</InputGroupAddon>
            <Input aria-label={`Amount, size ${size}`} placeholder={`size="${size}"`} />
          </InputGroup>
          <Button size={size}>Apply</Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * A list toolbar: a search field with a clear button (shown only when there's text, focus returns to the input) and
 * an order form with a currency and a unit. Edge case: a long prefix (a full URL) takes space from the input.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [query, setQuery] = useState('');
const inputRef = useRef<HTMLInputElement>(null);

<InputGroup inside>
  <InputGroupAddon><SearchIcon /></InputGroupAddon>
  <Input ref={inputRef} type="search" aria-label="Search orders" value={query} onChange={setQuery} />
  {query && (
    <InputGroupButton
      aria-label="Clear search"
      onClick={() => {
        setQuery('');
        inputRef.current?.focus();
      }}
    >
      <CloseIcon />
    </InputGroupButton>
  )}
</InputGroup>`),
  render: function Render() {
    const [query, setQuery] = useState('laptops');
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div style={{ ...column, maxWidth: 420 }}>
        <InputGroup inside>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <Input
            ref={inputRef}
            type="search"
            aria-label="Search orders"
            value={query}
            onChange={setQuery}
          />
          {query && (
            <InputGroupButton
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <CloseIcon />
            </InputGroupButton>
          )}
        </InputGroup>
        <Field label="Unit price (₹)">
          {(id) => (
            <InputGroup>
              <InputGroupAddon>₹</InputGroupAddon>
              <Input id={id} inputMode="decimal" defaultValue="54,999.00" />
            </InputGroup>
          )}
        </Field>
        <Field label="Quantity (units)">
          {(id) => (
            <InputGroup>
              <Input id={id} inputMode="numeric" defaultValue="12" />
              <InputGroupAddon>units</InputGroupAddon>
            </InputGroup>
          )}
        </Field>
        <Field label="Supplier portal">
          {(id) => (
            <InputGroup>
              <InputGroupAddon>https://portal.example.com/suppliers/</InputGroupAddon>
              <Input id={id} defaultValue="acme" />
            </InputGroup>
          )}
        </Field>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search orders' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(search).toHaveValue('');
    await expect(search).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  },
};

/** The input keeps its own label; Tab moves from the input to the group's button. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="project">Project</label>
<InputGroup>
  <Input id="project" />
  <InputGroupButton>Search</InputGroupButton>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <Field label="Project">
        {(id) => (
          <InputGroup>
            <Input id={id} />
            <InputGroupButton>Search</InputGroupButton>
          </InputGroup>
        )}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Project' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Search' })).toHaveFocus();
  },
};
