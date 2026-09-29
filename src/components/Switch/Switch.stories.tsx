import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Switch } from '@mgs/ui';
import { column, row, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;
const cell = { padding: '4px 12px', textAlign: 'start' } as const;
const stack = { display: 'grid', gap: 4, justifyItems: 'start' } as const;

const modules = [
  { code: 'orders', name: 'Orders', enabled: true },
  { code: 'invoices', name: 'Invoices', enabled: true },
  { code: 'reports', name: 'Reports', enabled: false },
];

const meta = {
  title: 'Components/Switch',
  component: Switch,
  // Docs come from Switch.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: {
      include: ['children', 'checked', 'defaultChecked', 'size', 'loading', 'disabled', 'value'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The visible label. Without one, set `aria-label` or `aria-labelledby`.',
    },
    checked: {
      control: 'boolean',
      description: 'Whether it is on (controlled). Use with `onChange`.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Whether it starts on (uncontrolled).',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Button and Input.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    loading: {
      control: 'boolean',
      description: 'Busy: shows a spinner and ignores clicks and keys, but keeps focus.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or changed; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'What a form submits with `name` when the switch is on.',
    },
    onChange: {
      description: '`(checked: boolean, event) => void`: the new state comes first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    children: 'Email notifications',
    size: 'md',
    loading: false,
    disabled: false,
  },
};

export const Basic: Story = {
  parameters: source(`<Switch defaultChecked>Email notifications</Switch>`),
  render: () => <Switch defaultChecked>Email notifications</Switch>,
};

/** Invalid isn't a prop: set `aria-invalid="true"`, and link the error text with `aria-describedby`. */
export const States: Story = {
  parameters: source(`<Switch>Off</Switch>
<Switch defaultChecked>On</Switch>
<Switch disabled>Disabled</Switch>
<Switch disabled defaultChecked>Disabled, on</Switch>
<Switch loading>Loading</Switch>
<Switch loading defaultChecked>Loading, on</Switch>
<Switch aria-invalid="true" aria-describedby="backup-error">Daily backup</Switch>
<p id="backup-error">Turn on the backup before you continue</p>`),
  render: () => (
    <div style={stack}>
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled</Switch>
      <Switch disabled defaultChecked>
        Disabled, on
      </Switch>
      <Switch loading>Loading</Switch>
      <Switch loading defaultChecked>
        Loading, on
      </Switch>
      <div>
        <Switch aria-invalid="true" aria-describedby="states-backup-error">
          Daily backup
        </Switch>
        <p id="states-backup-error" style={{ margin: '4px 0 0', fontSize: 13 }}>
          Turn on the backup before you continue
        </p>
      </div>
    </div>
  ),
};

/** `sm` for tables and toolbars, `md` for forms and settings, `lg` for touch screens. */
export const Sizes: Story = {
  parameters: source(`<Switch size="sm" defaultChecked>Small</Switch>
<Switch size="md" defaultChecked>Medium</Switch>
<Switch size="lg" defaultChecked>Large</Switch>`),
  render: () => (
    <div style={stack}>
      {sizes.map((size) => (
        <div key={size} style={row}>
          <Switch size={size} defaultChecked>
            {`size="${size}"`}
          </Switch>
          <Switch size={size} aria-label={`Off, ${size}`} />
        </div>
      ))}
    </div>
  ),
};

/** `onChange` receives the new state first: `onChange={setNotify}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [notify, setNotify] = useState(false);

<Switch checked={notify} onChange={setNotify}>Email notifications</Switch>`),
  render: function Render() {
    const [notify, setNotify] = useState(false);
    return (
      <div style={column}>
        <Switch checked={notify} onChange={setNotify}>
          Email notifications
        </Switch>
        <output style={{ fontSize: 14 }}>Notifications: {notify ? 'on' : 'off'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('switch', { name: 'Email notifications' }));
    await expect(canvas.getByText('Notifications: on')).toBeInTheDocument();
  },
};

/**
 * A switch acts at once, so the app saves on every change. While saving, `loading` keeps the switch where it is and
 * ignores more clicks.
 */
export const Loading: Story = {
  parameters: source(`const [active, setActive] = useState(true);
const [saving, setSaving] = useState(false);

<Switch
  checked={active}
  loading={saving}
  onChange={async (next) => {
    setSaving(true);
    await saveStatus(next);
    setActive(next);
    setSaving(false);
  }}
>
  Account active
</Switch>`),
  render: function Render() {
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);
    return (
      <div style={column}>
        <Switch
          checked={active}
          loading={saving}
          onChange={(next) => {
            setSaving(true);
            setTimeout(() => {
              setActive(next);
              setSaving(false);
            }, 1200);
          }}
        >
          Account active
        </Switch>
        <output style={{ fontSize: 14 }}>
          {saving ? 'Saving…' : `Saved: ${active ? 'active' : 'inactive'}`}
        </output>
      </div>
    );
  },
};

/**
 * Rows of a table have no visible label: name each switch with `aria-label`. The name says what is switched; the
 * switch itself says on or off.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [enabled, setEnabled] = useState(['orders', 'invoices']);

<table>
  <tbody>
    {modules.map((module) => (
      <tr key={module.code}>
        <td>{module.name}</td>
        <td>
          <Switch
            size="sm"
            aria-label={\`\${module.name} module\`}
            checked={enabled.includes(module.code)}
            onChange={(on) =>
              setEnabled(on ? [...enabled, module.code] : enabled.filter((code) => code !== module.code))
            }
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>`),
  render: function Render() {
    const [enabled, setEnabled] = useState(
      modules.filter((module) => module.enabled).map((module) => module.code),
    );
    return (
      <div style={column}>
        <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
          <caption style={{ ...cell, captionSide: 'top' }}>
            Modules ({enabled.length} enabled)
          </caption>
          <thead>
            <tr>
              <th style={cell}>Module</th>
              <th style={cell}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.code}>
                <td style={cell}>{module.name}</td>
                <td style={cell}>
                  <Switch
                    size="sm"
                    aria-label={`${module.name} module`}
                    checked={enabled.includes(module.code)}
                    onChange={(on) =>
                      setEnabled(
                        on
                          ? [...enabled, module.code]
                          : enabled.filter((code) => code !== module.code),
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <Button size="sm" onClick={() => setEnabled([])}>
            Disable all
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reports = canvas.getByRole('switch', { name: 'Reports module' });
    await expect(reports).not.toBeChecked();
    await userEvent.click(reports);
    await expect(reports).toBeChecked();
    await expect(canvas.getByText('Modules (3 enabled)')).toBeInTheDocument();
  },
};

/** Tab moves to each switch and skips disabled ones; Space turns it on and off. A loading switch keeps focus. */
export const Accessibility: Story = {
  parameters: source(`<Switch>Email notifications</Switch>
<Switch disabled>SMS notifications</Switch>
<Switch loading defaultChecked>Push notifications</Switch>`),
  render: () => (
    <div style={stack}>
      <Switch>Email notifications</Switch>
      <Switch disabled>SMS notifications</Switch>
      <Switch loading defaultChecked>
        Push notifications
      </Switch>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole('switch', { name: 'Email notifications' });
    const push = canvas.getByRole('switch', { name: 'Push notifications' });
    await userEvent.tab();
    await expect(email).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(email).toBeChecked();
    // The disabled switch is skipped; the loading one takes focus, says it is busy, and doesn't change.
    await userEvent.tab();
    await expect(push).toHaveFocus();
    await expect(push).toHaveAttribute('aria-busy', 'true');
    await userEvent.keyboard(' ');
    await expect(push).toBeChecked();
  },
};
