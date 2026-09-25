import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Button,
  type ButtonVariant,
  DownloadIcon,
  IconButton,
  Input,
  PlusIcon,
  TrashIcon,
} from '@mgs/ui';
import { source } from '../../stories/shared';

const variants: ButtonVariant[] = ['primary', 'secondary', 'danger', 'ghost', 'link'];
const sizes = ['sm', 'md', 'lg'] as const;
const icons = {
  none: undefined,
  PlusIcon: <PlusIcon />,
  DownloadIcon: <DownloadIcon />,
  ChevronRightIcon: <ChevronRightIcon />,
};

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {label && (
        <span style={{ width: 88, fontSize: 12, color: 'var(--mgs-color-text-secondary)' }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

const Column = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', gap: 16 }}>{children}</div>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  // Docs come from Button.mdx.
  tags: ['!autodocs'],
  args: { children: 'Button', onClick: fn() },
  parameters: {
    // Only the MGS API; native <button> attributes also work but would flood the table.
    controls: {
      include: [
        'variant',
        'size',
        'disabled',
        'loading',
        'fullWidth',
        'leftIcon',
        'rightIcon',
        'children',
      ],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variants,
      description: 'Visual style.',
      table: {
        type: { summary: variants.map((v) => `'${v}'`).join(' | ') },
        defaultValue: { summary: "'secondary'" },
      },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size. Inside a `ButtonGroup`, the group size applies when this is not set.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    disabled: {
      control: 'boolean',
      description: 'Not focusable or clickable.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description:
        'Spinner, `aria-busy`, ignores clicks and Enter/Space; keeps width, name and focus.',
      table: { defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fills the container width.',
      table: { defaultValue: { summary: 'false' } },
    },
    leftIcon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
      description: 'Decorative icon before the label.',
      table: { type: { summary: 'ReactNode' } },
    },
    rightIcon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
      description: 'Decorative icon after the label.',
      table: { type: { summary: 'ReactNode' } },
    },
    children: { control: 'text', description: 'The label; it is the accessible name.' },
    onClick: { table: { category: 'Events' } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        // Live snippet: hide props left at their default and Storybook's click spy.
        transform: (code: string) =>
          code
            .split('\n')
            .filter((line) => !/=\{false\}|onClick=\{\(\) => \{\}\}/.test(line))
            .join('\n'),
      },
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
    children: 'Save changes',
  },
};

export const Basic: Story = {
  parameters: source(`<Button>Cancel</Button>
<Button variant="primary">Save</Button>`),
  render: (args) => (
    <Row>
      <Button {...args}>Cancel</Button>
      <Button {...args} variant="primary">
        Save
      </Button>
    </Row>
  ),
};

export const Variants: Story = {
  parameters: source(`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`),
  render: (args) => (
    <Row>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {capitalize(variant)}
        </Button>
      ))}
    </Row>
  ),
};

/** Hover, press, and press Tab for the focus ring; the rows show the states you can set. */
export const States: Story = {
  parameters: source(`<Button>Default</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`),
  render: (args) => (
    <Column>
      {variants.map((variant) => (
        <Row key={variant} label={capitalize(variant)}>
          <Button {...args} variant={variant}>
            Default
          </Button>
          <Button {...args} variant={variant} disabled>
            Disabled
          </Button>
          <Button {...args} variant={variant} loading>
            Loading
          </Button>
        </Row>
      ))}
    </Column>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`),
  render: (args) => (
    <Row>
      <Button {...args} variant="primary" size="sm">
        Small
      </Button>
      <Button {...args} variant="primary" size="md">
        Medium
      </Button>
      <Button {...args} variant="primary" size="lg">
        Large
      </Button>
    </Row>
  ),
};

/** Click **Save**: it stays busy for 1.5 s. Clicks and Enter/Space are ignored meanwhile, and focus stays on it. */
export const Loading: Story = {
  parameters: source(`const [saving, setSaving] = useState(false);

<Button variant="primary" loading={saving} onClick={save}>
  Save
</Button>`),
  render: function Render(args) {
    const [saving, setSaving] = useState(false);
    return (
      <Column>
        <Row label="Variants">
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} loading>
              {capitalize(variant)}
            </Button>
          ))}
        </Row>
        <Row label="Interactive">
          <Button
            variant="primary"
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          >
            Save
          </Button>
        </Row>
      </Column>
    );
  },
};

export const Disabled: Story = {
  parameters: source(`<Button variant="primary" disabled>Save</Button>`),
  render: (args) => (
    <Row>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {capitalize(variant)}
        </Button>
      ))}
    </Row>
  ),
};

export const FullWidth: Story = {
  name: 'Full Width',
  parameters: source(`<Button variant="primary" fullWidth>Continue</Button>
<Button fullWidth>Cancel</Button>`),
  render: (args) => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <Button {...args} variant="primary" fullWidth>
        Continue
      </Button>
      <Button {...args} fullWidth>
        Cancel
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  parameters:
    source(`import { Button, PlusIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from '@mgs/ui';

<Button variant="primary" leftIcon={<PlusIcon />}>New order</Button>
<Button leftIcon={<DownloadIcon />}>Export</Button>
<Button variant="ghost" leftIcon={<ChevronLeftIcon />}>Back</Button>
<Button rightIcon={<ChevronRightIcon />}>Next</Button>`),
  render: (args) => (
    <Row>
      <Button {...args} variant="primary" leftIcon={<PlusIcon />}>
        New order
      </Button>
      <Button {...args} leftIcon={<DownloadIcon />}>
        Export
      </Button>
      <Button {...args} variant="ghost" leftIcon={<ChevronLeftIcon />}>
        Back
      </Button>
      <Button {...args} rightIcon={<ChevronRightIcon />}>
        Next
      </Button>
      <Button {...args} variant="danger" leftIcon={<TrashIcon />}>
        Delete
      </Button>
    </Row>
  ),
};

/**
 * ERP layouts: a page header with a single primary action, and a form whose submit button shows `loading` while
 * saving, so a double click or a second Enter can't submit twice. Edge case: a label wider than its button is cut off
 * (it doesn't wrap), though screen readers still read all of it.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`// Page header: one primary action, the rest secondary
<Button leftIcon={<DownloadIcon />}>Export</Button>
<Button variant="primary" leftIcon={<PlusIcon />}>New order</Button>

// Form footer: the submit button is busy while saving
const [saving, setSaving] = useState(false);

<form onSubmit={async (event) => {
  event.preventDefault();
  setSaving(true);
  await saveOrder();
  setSaving(false);
}}>
  …
  <Button onClick={cancel}>Cancel</Button>
  <Button type="submit" variant="primary" loading={saving}>Save order</Button>
</form>`),
  render: function Render() {
    const [saving, setSaving] = useState(false);
    const [saves, setSaves] = useState(0);
    return (
      <Column>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <h3 style={{ margin: 0 }}>Sales orders</h3>
          <Row>
            <Button leftIcon={<DownloadIcon />}>Export</Button>
            <Button variant="primary" leftIcon={<PlusIcon />}>
              New order
            </Button>
          </Row>
        </div>

        <form
          aria-label="Order"
          style={{ display: 'grid', gap: 12, maxWidth: 420 }}
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            setTimeout(() => {
              setSaving(false);
              setSaves((count) => count + 1);
            }, 600);
          }}
        >
          <label htmlFor="advanced-customer" style={{ fontSize: 14 }}>
            Customer
          </label>
          <Input id="advanced-customer" defaultValue="Acme Industries" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save order
            </Button>
          </div>
          <output style={{ fontSize: 14 }}>
            {saves > 0 && `Saved ${saves} time${saves > 1 ? 's' : ''}.`}
          </output>
        </form>

        <Row label="Long label (clipped)">
          <div style={{ width: 200 }}>
            <Button fullWidth>Approve and send all selected invoices</Button>
          </div>
        </Row>
      </Column>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save order' });
    await userEvent.click(save);
    await expect(save).toHaveAttribute('aria-busy', 'true');
    // A second Enter while saving is ignored: the order is saved once.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Saved 1 time.'));
    await expect(save).not.toHaveAttribute('aria-busy');
  },
};

/** Tab moves focus, Enter and Space activate, disabled buttons are skipped, and a loading button ignores Enter. */
export const Accessibility: Story = {
  parameters: source(`<Button onClick={handleClick}>Press me</Button>
<Button disabled>Skipped</Button>
<Button loading>Busy</Button>
<IconButton aria-label="Delete row"><TrashIcon /></IconButton>`),
  args: { children: 'Press me' },
  render: (args) => (
    <Row>
      <Button {...args} />
      <Button disabled>Skipped (disabled)</Button>
      <Button loading onClick={args.onClick}>
        Busy
      </Button>
      <IconButton aria-label="Delete row">
        <TrashIcon />
      </IconButton>
    </Row>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Press me' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // The disabled button is skipped; the loading one is focusable but doesn't activate.
    await userEvent.tab();
    const busy = canvas.getByRole('button', { name: 'Busy' });
    await expect(busy).toHaveFocus();
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete row' })).toHaveFocus();
  },
};
