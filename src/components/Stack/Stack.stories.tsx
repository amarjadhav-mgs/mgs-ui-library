import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Checkbox, Input, Stack, type StackGap } from '@mgs/ui';
import { Field, source } from '../../stories/shared';

const gaps: StackGap[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];

// A box that shows where a child is: Stack has no look of its own.
const box: CSSProperties = {
  padding: '8px 12px',
  border: '1px dashed var(--mgs-color-border-control)',
  borderRadius: 4,
  fontSize: 14,
};
const frame: CSSProperties = {
  padding: 8,
  border: '1px solid var(--mgs-color-border)',
  borderRadius: 4,
};

const meta = {
  title: 'Components/Stack',
  component: Stack,
  // Docs come from Stack.mdx.
  tags: ['!autodocs'],
  parameters: {
    // Only the MGS API; native <div> attributes also work but would flood the table.
    controls: { include: ['direction', 'gap', 'align', 'justify', 'wrap'] },
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['column', 'row'],
      description: 'Children under each other, or next to each other.',
      table: { type: { summary: "'column' | 'row'" }, defaultValue: { summary: "'column'" } },
    },
    gap: {
      control: 'inline-radio',
      options: gaps,
      description: 'The space between the children, from the MGS spacing scale.',
      table: {
        type: { summary: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'" },
        defaultValue: { summary: "'md'" },
      },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Where the children sit across the direction.',
      table: {
        type: { summary: "'start' | 'center' | 'end' | 'stretch' | 'baseline'" },
        defaultValue: { summary: "'stretch'" },
      },
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between'],
      description: 'Where the children sit along the direction.',
      table: {
        type: { summary: "'start' | 'center' | 'end' | 'between'" },
        defaultValue: { summary: "'start'" },
      },
    },
    wrap: {
      control: 'boolean',
      description: "In a row: children that don't fit go onto the next line.",
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    direction: 'row',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
  render: (args) => (
    <div style={{ ...frame, minHeight: 120 }}>
      <Stack {...args} style={{ minHeight: 104 }}>
        <div style={box}>One</div>
        <div style={{ ...box, padding: '16px 12px' }}>Two</div>
        <div style={box}>Three</div>
      </Stack>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<Stack>
  <Input aria-label="First name" placeholder="First name" />
  <Input aria-label="Last name" placeholder="Last name" />
</Stack>

<Stack direction="row" gap="sm">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</Stack>`),
  render: () => (
    <Stack gap="lg" style={{ maxWidth: 360 }}>
      <Stack>
        <Input aria-label="First name" placeholder="First name" />
        <Input aria-label="Last name" placeholder="Last name" />
      </Stack>
      <Stack direction="row" gap="sm">
        <Button>Cancel</Button>
        <Button variant="primary">Save</Button>
      </Stack>
    </Stack>
  ),
};

/** The steps of the MGS spacing scale: 0, 4, 8, 12, 16 and 24px. */
export const Gaps: Story = {
  parameters: source(`<Stack direction="row" gap="xs">…</Stack>
<Stack direction="row" gap="md">…</Stack>
<Stack direction="row" gap="xl">…</Stack>`),
  render: () => (
    <Stack gap="md">
      {gaps.map((gap) => (
        <Stack key={gap} direction="row" gap={gap} align="center" data-testid={`gap-${gap}`}>
          <div style={{ ...box, width: 72 }}>{gap}</div>
          <div style={box}>One</div>
          <div style={box}>Two</div>
          <div style={box}>Three</div>
        </Stack>
      ))}
    </Stack>
  ),
};

/** `align` works across the direction, `justify` along it. */
export const AlignAndJustify: Story = {
  name: 'Align and justify',
  parameters: source(`<Stack direction="row" align="center" justify="between">
  <span>12 orders</span>
  <Button variant="primary">New order</Button>
</Stack>

<Stack direction="row" justify="end" gap="sm">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</Stack>`),
  render: () => (
    <Stack gap="lg" style={{ maxWidth: 480 }}>
      <div style={frame}>
        <Stack direction="row" align="center" justify="between">
          <span style={{ fontSize: 14 }}>12 orders</span>
          <Button variant="primary">New order</Button>
        </Stack>
      </div>
      <div style={frame}>
        <Stack direction="row" justify="end" gap="sm">
          <Button>Cancel</Button>
          <Button variant="primary">Save</Button>
        </Stack>
      </div>
      <div style={frame}>
        <Stack align="center" gap="sm">
          <span style={{ fontSize: 14 }}>No orders yet</span>
          <Button variant="primary">Create the first order</Button>
        </Stack>
      </div>
    </Stack>
  ),
};

/** With `wrap`, children of a row that don't fit go onto the next line, with the same space between the lines. */
export const Wrap: Story = {
  parameters: source(`<Stack direction="row" gap="sm" wrap>
  <Button>Orders</Button>
  <Button>Invoices</Button>
  <Button>Payments</Button>
  …
</Stack>`),
  render: () => (
    <div style={{ ...frame, maxWidth: 320 }}>
      <Stack direction="row" gap="sm" wrap>
        {['Orders', 'Invoices', 'Payments', 'Customers', 'Reports', 'Settings'].map((name) => (
          <Button key={name}>{name}</Button>
        ))}
      </Stack>
    </div>
  ),
};

/**
 * A form: a column of fields, a row of two fields that share the width, and the buttons at the end. Stacks can be
 * put inside each other.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`<form>
  <Stack gap="lg">
    <Stack direction="row" gap="md">
      <div style={{ flex: 1 }}>
        <label htmlFor="first">First name</label>
        <Input id="first" />
      </div>
      <div style={{ flex: 1 }}>
        <label htmlFor="last">Last name</label>
        <Input id="last" />
      </div>
    </Stack>
    <Checkbox name="updates">Send me product updates</Checkbox>
    <Stack direction="row" gap="sm" justify="end">
      <Button>Cancel</Button>
      <Button type="submit" variant="primary">Save</Button>
    </Stack>
  </Stack>
</form>`),
  render: () => (
    <form
      aria-label="Contact"
      style={{ maxWidth: 480 }}
      onSubmit={(event) => event.preventDefault()}
    >
      <Stack gap="lg">
        <Stack direction="row" gap="md">
          <div style={{ flex: 1 }}>
            <Field label="First name">{(id) => <Input id={id} autoComplete="given-name" />}</Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Last name">{(id) => <Input id={id} autoComplete="family-name" />}</Field>
          </div>
        </Stack>
        <Stack align="start">
          <Checkbox name="updates">Send me product updates</Checkbox>
        </Stack>
        <Stack direction="row" gap="sm" justify="end">
          <Button>Cancel</Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Stack>
      </Stack>
    </form>
  ),
};

/**
 * A Stack adds nothing for screen readers: the order on screen is the order in the code, and Tab follows it. For a
 * toolbar, give it `role="toolbar"` and a name.
 */
export const Accessibility: Story = {
  parameters: source(`<Stack direction="row" gap="sm" role="toolbar" aria-label="Order actions">
  <Button>Copy</Button>
  <Button>Export</Button>
  <Button variant="danger">Delete</Button>
</Stack>`),
  render: () => (
    <Stack direction="row" gap="sm" role="toolbar" aria-label="Order actions">
      <Button>Copy</Button>
      <Button>Export</Button>
      <Button variant="danger">Delete</Button>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar', { name: 'Order actions' });
    const buttons = within(toolbar).getAllByRole('button');
    await expect(buttons.map((button) => button.textContent)).toEqual(['Copy', 'Export', 'Delete']);
    for (const button of buttons) {
      await userEvent.tab();
      await expect(button).toHaveFocus();
    }
  },
};
