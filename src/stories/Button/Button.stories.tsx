import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, ButtonGroup, ButtonToolbar, IconButton } from '@mgs/ui';
import ArrowLeftIcon from '@rsuite/icons/ArrowLeft';
import ArrowRightIcon from '@rsuite/icons/ArrowRight';
import CloseIcon from '@rsuite/icons/Close';
import CopyIcon from '@rsuite/icons/Copy';
import EditIcon from '@rsuite/icons/Edit';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import PlusIcon from '@rsuite/icons/Plus';
import SearchIcon from '@rsuite/icons/Search';
import SettingIcon from '@rsuite/icons/Setting';
import TrashIcon from '@rsuite/icons/Trash';

// Values verified against rsuite 6.2.4 (Button.d.ts, internals/types).
const appearances = ['default', 'primary', 'link', 'subtle', 'ghost'] as const;
const colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'] as const;
const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const column: CSSProperties = { display: 'grid', gap: 16 };

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {label && (
        <span style={{ width: 88, fontSize: 12, color: 'var(--rs-text-secondary)' }}>{label}</span>
      )}
      {children}
    </div>
  );
}

/** Short, copyable snippet for "Show code" instead of the full story source. */
function source(code: string) {
  return { docs: { source: { code, language: 'tsx' } } };
}

const meta = {
  title: 'Components/Button',
  component: Button,
  // Docs come from Button.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    appearance: {
      control: 'inline-radio',
      options: appearances,
      description: 'Visual style.',
      table: { defaultValue: { summary: 'default' } },
    },
    color: {
      control: 'select',
      options: [undefined, ...colors],
      description: 'Colour palette. Most visible with `primary` and `ghost`.',
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Button size.',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: { control: 'boolean', description: 'Native disabled: not focusable or clickable.' },
    loading: {
      control: 'boolean',
      description:
        'Shows a spinner and blocks mouse clicks; the width stays the same. Keyboard can still activate it.',
    },
    active: { control: 'boolean', description: 'Shows the button as the current selection.' },
    block: { control: 'boolean', description: 'Stretches the button to the full container width.' },
    children: { control: 'text', description: 'Button label.' },
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
    appearance: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    active: false,
    block: false,
    children: 'Save changes',
  },
};

export const Basic: Story = {
  parameters: source(`<Button>Default</Button>
<Button appearance="primary">Primary</Button>`),
  render: (args) => (
    <Row>
      <Button {...args}>Default</Button>
      <Button {...args} appearance="primary">
        Primary
      </Button>
    </Row>
  ),
};

export const Appearance: Story = {
  parameters: source(`<Button appearance="default">Default</Button>
<Button appearance="primary">Primary</Button>
<Button appearance="link">Link</Button>
<Button appearance="subtle">Subtle</Button>
<Button appearance="ghost">Ghost</Button>`),
  render: (args) => (
    <Row>
      {appearances.map((appearance) => (
        <Button key={appearance} {...args} appearance={appearance}>
          {appearance[0].toUpperCase() + appearance.slice(1)}
        </Button>
      ))}
    </Row>
  ),
};

export const Colors: Story = {
  parameters: source(`<Button color="red" appearance="primary">Red</Button>
<Button color="green" appearance="primary">Green</Button>
<Button color="red" appearance="ghost">Red</Button>
// color: red | orange | yellow | green | cyan | blue | violet`),
  render: (args) => (
    <div style={column}>
      {(['primary', 'ghost'] as const).map((appearance) => (
        <Row key={appearance} label={appearance}>
          {colors.map((color) => (
            <Button key={color} {...args} appearance={appearance} color={color}>
              {color[0].toUpperCase() + color.slice(1)}
            </Button>
          ))}
        </Row>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Button size="lg">Large</Button>
<Button size="md">Medium</Button>
<Button size="sm">Small</Button>
<Button size="xs">Extra small</Button>`),
  render: (args) => (
    <Row>
      <Button {...args} appearance="primary" size="lg">
        Large
      </Button>
      <Button {...args} appearance="primary" size="md">
        Medium
      </Button>
      <Button {...args} appearance="primary" size="sm">
        Small
      </Button>
      <Button {...args} appearance="primary" size="xs">
        Extra small
      </Button>
    </Row>
  ),
};

/**
 * RSuite overlays a spinner (the width doesn't change) and blocks **mouse** clicks.
 * Enter/Space can still activate a focused loading button, so guard the handler too.
 */
export const Loading: Story = {
  parameters: source(`const [saving, setSaving] = useState(false);

async function save() {
  if (saving) return; // loading blocks mouse clicks, not Enter/Space
  setSaving(true);
  await saveForm();
  setSaving(false);
}

<Button appearance="primary" loading={saving} aria-busy={saving} onClick={save}>
  Save
</Button>`),
  render: function Render(args) {
    const [saving, setSaving] = useState(false);
    return (
      <div style={column}>
        <Row label="Appearances">
          {appearances.map((appearance) => (
            <Button key={appearance} {...args} appearance={appearance} loading>
              {appearance}
            </Button>
          ))}
        </Row>
        <Row label="Interactive">
          <Button
            appearance="primary"
            loading={saving}
            aria-busy={saving}
            onClick={() => {
              if (saving) return;
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          >
            Save
          </Button>
        </Row>
      </div>
    );
  },
};

export const Disabled: Story = {
  parameters: source(`<Button disabled>Default</Button>
<Button appearance="primary" disabled>Primary</Button>
<Button appearance="link" disabled>Link</Button>`),
  render: (args) => (
    <Row>
      {appearances.map((appearance) => (
        <Button key={appearance} {...args} appearance={appearance} disabled>
          {appearance}
        </Button>
      ))}
    </Row>
  ),
};

/**
 * `active` shows a button as the current selection. `toggleable` (RSuite v6) flips it on click and
 * calls `onToggle`. RSuite does not set `aria-pressed`, so pass it yourself for toggle buttons.
 */
export const Active: Story = {
  parameters: source(`<Button active>Active</Button>

// Toggle button (controlled, with aria-pressed for screen readers)
const [bold, setBold] = useState(false);

<Button toggleable active={bold} onToggle={setBold} aria-pressed={bold}>
  Bold
</Button>`),
  render: function Render(args) {
    const [bold, setBold] = useState(false);
    return (
      <div style={column}>
        <Row label="Active">
          {appearances.map((appearance) => (
            <Button key={appearance} {...args} appearance={appearance} active>
              {appearance}
            </Button>
          ))}
        </Row>
        <Row label="Toggleable">
          <Button toggleable active={bold} onToggle={setBold} aria-pressed={bold}>
            Bold
          </Button>
          <span style={{ fontSize: 12 }}>{bold ? 'On' : 'Off'}</span>
        </Row>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const bold = within(canvasElement).getByRole('button', { name: 'Bold' });
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
  },
};

export const BlockFullWidth: Story = {
  name: 'Block / Full Width',
  parameters: source(`<Button appearance="primary" block>Continue</Button>
<Button block>Cancel</Button>`),
  render: (args) => (
    <div style={{ ...column, gap: 8, maxWidth: 360 }}>
      <Button {...args} appearance="primary" block>
        Continue
      </Button>
      <Button {...args} block>
        Cancel
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: source(`import PlusIcon from '@rsuite/icons/Plus';

<Button appearance="primary" startIcon={<PlusIcon />}>New project</Button>
<Button startIcon={<FileDownloadIcon />}>Export</Button>
<Button endIcon={<ArrowRightIcon />}>Next</Button>`),
  render: (args) => (
    <Row>
      <Button {...args} appearance="primary" startIcon={<PlusIcon />}>
        New project
      </Button>
      <Button {...args} startIcon={<FileDownloadIcon />}>
        Export
      </Button>
      <Button {...args} appearance="subtle" startIcon={<ArrowLeftIcon />}>
        Back
      </Button>
      <Button {...args} endIcon={<ArrowRightIcon />}>
        Next
      </Button>
    </Row>
  ),
};

/**
 * Icon-only buttons have no visible text, so they **must** have an `aria-label`.
 * RSuite's types don't enforce it; the accessibility tests on these stories do.
 */
export const IconButtons: Story = {
  name: 'IconButton',
  parameters: source(`<IconButton icon={<PlusIcon />} aria-label="Add" />
<IconButton icon={<EditIcon />} appearance="primary" aria-label="Edit" />
<IconButton icon={<TrashIcon />} color="red" appearance="primary" aria-label="Delete" />
<IconButton icon={<CloseIcon />} circle aria-label="Close" />

// With text; placement: 'start' (default) | 'end'
<IconButton icon={<SettingIcon />}>Settings</IconButton>
<IconButton icon={<ArrowRightIcon />} placement="end">Next</IconButton>`),
  render: () => (
    <div style={column}>
      <Row label="Icon only">
        <IconButton icon={<PlusIcon />} aria-label="Add" />
        <IconButton icon={<EditIcon />} appearance="primary" aria-label="Edit" />
        <IconButton icon={<TrashIcon />} color="red" appearance="primary" aria-label="Delete" />
        <IconButton icon={<SearchIcon />} appearance="subtle" aria-label="Search" />
      </Row>
      <Row label="Circle">
        <IconButton icon={<CloseIcon />} circle aria-label="Close" />
        <IconButton icon={<PlusIcon />} circle appearance="primary" aria-label="Add" />
      </Row>
      <Row label="Sizes">
        {sizes.map((size) => (
          <IconButton key={size} icon={<PlusIcon />} size={size} aria-label="Add" />
        ))}
      </Row>
      <Row label="With text">
        <IconButton icon={<SettingIcon />}>Settings</IconButton>
        <IconButton icon={<ArrowRightIcon />} placement="end">
          Next
        </IconButton>
      </Row>
    </div>
  ),
};

/** Joins related buttons. Give the group an `aria-label` so screen readers announce its purpose. */
export const ButtonGroups: Story = {
  name: 'ButtonGroup',
  parameters: source(`<ButtonGroup aria-label="Text alignment">
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>

<ButtonGroup size="sm" divided>…</ButtonGroup>
<ButtonGroup vertical>…</ButtonGroup>
<ButtonGroup justified>…</ButtonGroup>
<ButtonGroup disabled>…</ButtonGroup>`),
  render: () => {
    const buttons = ['Left', 'Center', 'Right'].map((label) => (
      <Button key={label}>{label}</Button>
    ));
    return (
      <div style={column}>
        <Row label="Basic">
          <ButtonGroup aria-label="Text alignment">{buttons}</ButtonGroup>
        </Row>
        <Row label="Primary">
          <ButtonGroup aria-label="View">
            <Button appearance="primary">Day</Button>
            <Button appearance="primary">Week</Button>
            <Button appearance="primary">Month</Button>
          </ButtonGroup>
        </Row>
        <Row label="Small, divided">
          <ButtonGroup aria-label="Text alignment (small)" size="sm" divided>
            {buttons}
          </ButtonGroup>
        </Row>
        <Row label="Disabled">
          <ButtonGroup aria-label="Text alignment (disabled)" disabled>
            {buttons}
          </ButtonGroup>
        </Row>
        <Row label="Vertical">
          <ButtonGroup aria-label="Text alignment (vertical)" vertical>
            {buttons}
          </ButtonGroup>
        </Row>
        <div style={{ maxWidth: 420 }}>
          <ButtonGroup aria-label="Text alignment (justified)" justified>
            {buttons}
          </ButtonGroup>
        </div>
      </div>
    );
  },
};

/**
 * Lays out buttons or groups in a row with consistent spacing (it is an RSuite `Stack`).
 * It has `role="toolbar"`; add an `aria-label`. Focus moves with Tab (no arrow-key navigation).
 */
export const ButtonToolbars: Story = {
  name: 'ButtonToolbar',
  parameters: source(`<ButtonToolbar aria-label="Document actions">
  <Button appearance="primary">Save</Button>
  <Button>Preview</Button>
  <ButtonGroup aria-label="Clipboard">
    <IconButton icon={<CopyIcon />} aria-label="Copy" />
    <IconButton icon={<TrashIcon />} aria-label="Delete" />
  </ButtonGroup>
</ButtonToolbar>`),
  render: () => (
    <ButtonToolbar aria-label="Document actions">
      <Button appearance="primary">Save</Button>
      <Button>Preview</Button>
      <ButtonGroup aria-label="Clipboard">
        <IconButton icon={<CopyIcon />} aria-label="Copy" />
        <IconButton icon={<TrashIcon />} aria-label="Delete" />
      </ButtonGroup>
    </ButtonToolbar>
  ),
};

/**
 * `href` renders a real `<a>` styled as a button. For router links use `as`,
 * e.g. `<Button as={Link} to="/projects">`. A disabled link is removed from the tab order.
 */
export const LinkButton: Story = {
  parameters: source(`<Button href="/docs">Read the docs</Button>
<Button href="https://rsuitejs.com" target="_blank" rel="noreferrer">RSuite</Button>
<Button href="/docs" disabled>Disabled link</Button>

// React Router
<Button as={Link} to="/projects" appearance="primary">Projects</Button>`),
  render: () => (
    <Row>
      <Button href="#docs" appearance="primary">
        Read the docs
      </Button>
      <Button href="https://rsuitejs.com" target="_blank" rel="noreferrer">
        RSuite
      </Button>
      <Button href="#docs" appearance="link">
        Link appearance
      </Button>
      <Button href="#docs" disabled>
        Disabled link
      </Button>
    </Row>
  ),
};

/** Hover and pressed are interactive: point at a button, click it, or press Tab for focus. */
export const States: Story = {
  parameters: source(`<Button>Default</Button>
<Button active>Active</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`),
  render: (args) => (
    <div style={column}>
      {appearances.map((appearance) => (
        <Row key={appearance} label={appearance}>
          <Button {...args} appearance={appearance}>
            Default
          </Button>
          <Button {...args} appearance={appearance} active>
            Active
          </Button>
          <Button {...args} appearance={appearance} disabled>
            Disabled
          </Button>
          <Button {...args} appearance={appearance} loading>
            Loading
          </Button>
        </Row>
      ))}
    </div>
  ),
};

/** Tab moves focus, Enter and Space activate, disabled buttons are skipped. */
export const Accessibility: Story = {
  parameters: source(`<Button onClick={handleClick}>Press me</Button>
<Button disabled>Skipped</Button>
<IconButton icon={<CloseIcon />} aria-label="Close" />`),
  args: { children: 'Press me' },
  render: (args) => (
    <Row>
      <Button {...args} />
      <Button disabled>Skipped (disabled)</Button>
      <IconButton icon={<CloseIcon />} aria-label="Close" />
    </Row>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Press me' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // The disabled button is skipped; the icon button is reachable by its label.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();
  },
};
