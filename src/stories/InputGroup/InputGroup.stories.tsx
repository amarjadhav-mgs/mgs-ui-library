import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CloseIcon, Input, InputGroup, SearchIcon } from '@mgs/ui';
import { column, Field, source } from '../shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  // Docs come from InputGroup.mdx.
  tags: ['!autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size of everything in the group.',
      table: { defaultValue: { summary: 'md' } },
    },
    inside: { control: 'boolean', description: "Put add-ons inside the input's border." },
    disabled: { control: 'boolean', description: 'Disable everything in the group.' },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change the group's props in the Controls panel. */
export const Playground: Story = {
  args: { size: 'md', inside: false, disabled: false },
  render: (args) => (
    <div style={column}>
      <Field label="Amount">
        {(id) => (
          <InputGroup {...args}>
            <InputGroup.Addon>₹</InputGroup.Addon>
            <Input id={id} placeholder="0.00" />
          </InputGroup>
        )}
      </Field>
    </div>
  ),
};

/** Text before and after the input. */
export const Basic: Story = {
  parameters: source(`<label htmlFor="site">Website</label>
<InputGroup>
  <InputGroup.Addon>https://</InputGroup.Addon>
  <Input id="site" />
  <InputGroup.Addon>.com</InputGroup.Addon>
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
    </div>
  ),
};

/** `inside` puts an icon inside the border, and `InputGroup.Button` adds a button. */
export const IconsAndButtons: Story = {
  name: 'Icons and buttons',
  parameters: source(`<InputGroup inside>
  <Input type="search" aria-label="Search" placeholder="Search" />
  <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
</InputGroup>

<InputGroup>
  <Input aria-label="Project name" />
  <InputGroup.Button>Search</InputGroup.Button>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <InputGroup inside>
        <Input type="search" aria-label="Search" placeholder="Search" />
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup>
      <InputGroup>
        <Input aria-label="Project name" placeholder="Project name" />
        <InputGroup.Button>Search</InputGroup.Button>
      </InputGroup>
    </div>
  ),
};

/**
 * A clear button for search and filter fields: named "Clear search", shown only when there's text, and it moves focus
 * back to the input.
 */
export const Clearable: Story = {
  parameters: source(`const [query, setQuery] = useState('');
const inputRef = useRef<HTMLInputElement>(null);

<InputGroup inside>
  <Input ref={inputRef} type="search" aria-label="Search projects" value={query} onChange={setQuery} />
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
          <Input
            ref={inputRef}
            type="search"
            aria-label="Search projects"
            value={query}
            onChange={setQuery}
          />
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

/** The input keeps its own label; Tab moves from the input to the group's button. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="project">Project</label>
<InputGroup>
  <Input id="project" />
  <InputGroup.Button>Search</InputGroup.Button>
</InputGroup>`),
  render: () => (
    <div style={column}>
      <Field label="Project">
        {(id) => (
          <InputGroup>
            <Input id={id} />
            <InputGroup.Button>Search</InputGroup.Button>
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
