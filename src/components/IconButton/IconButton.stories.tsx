import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  ButtonGroup,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  IconButton,
  type IconButtonVariant,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from '@mgs/ui';
import { source } from '../../stories/shared';

const variants: IconButtonVariant[] = ['primary', 'secondary', 'danger', 'ghost'];
const sizes = ['sm', 'md', 'lg'] as const;
const icons = {
  PlusIcon: <PlusIcon />,
  EditIcon: <EditIcon />,
  TrashIcon: <TrashIcon />,
  SettingsIcon: <SettingsIcon />,
};

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  // Docs come from IconButton.mdx.
  tags: ['!autodocs'],
  args: { 'aria-label': 'Add item', children: <PlusIcon />, onClick: fn() },
  parameters: {
    controls: { include: ['aria-label', 'children', 'variant', 'size', 'disabled', 'loading'] },
  },
  argTypes: {
    'aria-label': {
      control: 'text',
      description:
        'Required. The accessible name: describe the action ("Delete row"), not the icon.',
      table: { type: { summary: 'string' } },
    },
    children: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
      description: 'The icon, e.g. `<TrashIcon />`. Hidden from screen readers.',
      table: { type: { summary: 'ReactElement' } },
    },
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
      description: 'Spinner, `aria-busy`, ignores clicks and Enter/Space; keeps name and focus.',
      table: { defaultValue: { summary: 'false' } },
    },
    onClick: { table: { category: 'Events' } },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: { variant: 'secondary', size: 'md', disabled: false, loading: false },
};

export const Basic: Story = {
  parameters: source(`import { IconButton, EditIcon, TrashIcon } from '@mgs/ui';

<IconButton aria-label="Edit order"><EditIcon /></IconButton>
<IconButton aria-label="Delete order" variant="danger"><TrashIcon /></IconButton>`),
  render: () => (
    <Row>
      <IconButton aria-label="Edit order">
        <EditIcon />
      </IconButton>
      <IconButton aria-label="Delete order" variant="danger">
        <TrashIcon />
      </IconButton>
    </Row>
  ),
};

export const Variants: Story = {
  parameters: source(`<IconButton aria-label="Add" variant="primary"><PlusIcon /></IconButton>
<IconButton aria-label="Settings" variant="secondary"><SettingsIcon /></IconButton>
<IconButton aria-label="Delete" variant="danger"><TrashIcon /></IconButton>
<IconButton aria-label="Download" variant="ghost"><DownloadIcon /></IconButton>`),
  render: () => (
    <Row>
      <IconButton aria-label="Add" variant="primary">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Settings" variant="secondary">
        <SettingsIcon />
      </IconButton>
      <IconButton aria-label="Delete" variant="danger">
        <TrashIcon />
      </IconButton>
      <IconButton aria-label="Download" variant="ghost">
        <DownloadIcon />
      </IconButton>
    </Row>
  ),
};

/** The states you can set, per variant. Hover, press and focus (Tab) are interactive. */
export const States: Story = {
  parameters: source(`<IconButton aria-label="Copy link"><CopyIcon /></IconButton>
<IconButton aria-label="Copy link" disabled><CopyIcon /></IconButton>
<IconButton aria-label="Copy link" loading><CopyIcon /></IconButton>`),
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {variants.map((variant) => (
        <Row key={variant}>
          <span style={{ width: 88, fontSize: 12, color: 'var(--mgs-color-text-secondary)' }}>
            {variant[0].toUpperCase() + variant.slice(1)}
          </span>
          <IconButton aria-label={`Copy link (${variant})`} variant={variant}>
            <CopyIcon />
          </IconButton>
          <IconButton aria-label={`Copy link (${variant}, disabled)`} variant={variant} disabled>
            <CopyIcon />
          </IconButton>
          <IconButton aria-label={`Copy link (${variant}, loading)`} variant={variant} loading>
            <CopyIcon />
          </IconButton>
        </Row>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<IconButton aria-label="Search" size="sm"><SearchIcon /></IconButton>
<IconButton aria-label="Search" size="md"><SearchIcon /></IconButton>
<IconButton aria-label="Search" size="lg"><SearchIcon /></IconButton>`),
  render: () => (
    <Row>
      {sizes.map((size) => (
        <IconButton key={size} aria-label={`Search (${size})`} size={size}>
          <SearchIcon />
        </IconButton>
      ))}
    </Row>
  ),
};

/**
 * ERP layouts: row actions in a table (each label names its row, `title` adds a tooltip for sighted users) and a
 * toolbar group. Edge case: a custom icon that isn't from `@mgs/ui` is hidden from screen readers too.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`// Table row actions: the label names the row
<IconButton aria-label={\`Edit order \${order.id}\`} title="Edit" size="sm"><EditIcon /></IconButton>
<IconButton aria-label={\`Delete order \${order.id}\`} title="Delete" size="sm" variant="danger"><TrashIcon /></IconButton>

// Toolbar
<ButtonGroup aria-label="Export">
  <IconButton aria-label="Download as CSV"><DownloadIcon /></IconButton>
  <IconButton aria-label="Copy link"><CopyIcon /></IconButton>
</ButtonGroup>`),
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <table style={{ borderCollapse: 'collapse', maxWidth: 480, width: '100%', fontSize: 14 }}>
        <caption style={{ textAlign: 'start', marginBottom: 8 }}>Sales orders</caption>
        <thead>
          <tr>
            <th style={{ textAlign: 'start', padding: 8 }}>Order</th>
            <th style={{ textAlign: 'start', padding: 8 }}>Customer</th>
            <th style={{ textAlign: 'end', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 1042, customer: 'Acme Industries' },
            { id: 1043, customer: 'Globex' },
          ].map((order) => (
            <tr key={order.id} style={{ borderTop: '1px solid var(--mgs-color-border)' }}>
              <td style={{ padding: 8 }}>{order.id}</td>
              <td style={{ padding: 8 }}>{order.customer}</td>
              <td style={{ padding: 8 }}>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <IconButton aria-label={`Edit order ${order.id}`} title="Edit" size="sm">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete order ${order.id}`}
                    title="Delete"
                    size="sm"
                    variant="danger"
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Row>
        <ButtonGroup aria-label="Export">
          <IconButton aria-label="Download as CSV">
            <DownloadIcon />
          </IconButton>
          <IconButton aria-label="Copy link">
            <CopyIcon />
          </IconButton>
        </ButtonGroup>
        <IconButton aria-label="Close panel">
          <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" />
          </svg>
        </IconButton>
      </Row>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Delete order 1043' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Export' })).toBeInTheDocument();
    // The custom icon is hidden; the button is announced by its label only.
    await expect(
      canvas.getByRole('button', { name: 'Close panel' }).querySelector('svg'),
    ).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Tab reaches each button, Enter and Space activate, and screen readers announce the `aria-label`. */
export const Accessibility: Story = {
  parameters: source(`<IconButton aria-label="Edit row 3" onClick={edit}><EditIcon /></IconButton>
<IconButton aria-label="Delete row 3" variant="danger"><TrashIcon /></IconButton>`),
  render: (args) => (
    <Row>
      <IconButton aria-label="Edit row 3" onClick={args.onClick}>
        <EditIcon />
      </IconButton>
      <IconButton aria-label="Delete row 3" variant="danger">
        <TrashIcon />
      </IconButton>
    </Row>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Edit row 3' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Delete row 3' })).toHaveFocus();
  },
};
