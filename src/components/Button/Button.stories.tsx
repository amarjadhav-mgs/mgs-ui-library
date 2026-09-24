import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  iconOptions,
} from '../../../.storybook/icons';
import { IconButton } from '../IconButton';
import { Button } from './Button';
import { buttonClassName } from './buttonClassName';

const row: CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };
const column: CSSProperties = { display: 'grid', gap: 16 };

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div style={row}>
      {label && <span style={{ width: 96, fontSize: 13, color: '#6b7280' }}>{label}</span>}
      {children}
    </div>
  );
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
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    leftIcon: { control: 'select', options: Object.keys(iconOptions), mapping: iconOptions },
    rightIcon: { control: 'select', options: Object.keys(iconOptions), mapping: iconOptions },
    children: { control: 'text' },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    onClick: { table: { category: 'Events' } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel below. */
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
    children: 'Save changes',
  },
};

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} leftIcon={<PlusIcon />}>
        New project
      </Button>
      <Button {...args} variant="secondary" leftIcon={<DownloadIcon />}>
        Export
      </Button>
      <Button {...args} variant="ghost" leftIcon={<ArrowLeftIcon />}>
        Back
      </Button>
      <Button {...args} variant="secondary" rightIcon={<ArrowRightIcon />}>
        Next
      </Button>
    </div>
  ),
};

/** Use `IconButton` for icon-only actions. `aria-label` is required and is what screen readers announce. */
export const IconOnly: Story = {
  render: () => (
    <div style={column}>
      <Row label="Variants">
        <IconButton icon={<PlusIcon />} aria-label="Add item" />
        <IconButton icon={<DownloadIcon />} aria-label="Download" variant="secondary" />
        <IconButton icon={<TrashIcon />} aria-label="Delete" variant="danger" />
        <IconButton icon={<CloseIcon />} aria-label="Close" variant="ghost" />
      </Row>
      <Row label="Sizes">
        <IconButton icon={<PlusIcon />} aria-label="Add item" size="sm" variant="secondary" />
        <IconButton icon={<PlusIcon />} aria-label="Add item" size="md" variant="secondary" />
        <IconButton icon={<PlusIcon />} aria-label="Add item" size="lg" variant="secondary" />
      </Row>
    </div>
  ),
};

/**
 * The spinner is centered over the content, so the width never changes. The button stays
 * focusable and clicks are ignored until loading ends. Click "Save" to try it.
 */
export const Loading: Story = {
  render: function Render(args) {
    const [saving, setSaving] = useState(false);
    return (
      <div style={column}>
        <Row label="Variants">
          <Button {...args} loading>
            Primary
          </Button>
          <Button {...args} loading variant="secondary">
            Secondary
          </Button>
          <Button {...args} loading variant="danger">
            Danger
          </Button>
          <Button {...args} loading variant="ghost">
            Ghost
          </Button>
          <IconButton icon={<PlusIcon />} aria-label="Add item" loading variant="secondary" />
        </Row>
        <Row label="Interactive">
          <Button
            {...args}
            leftIcon={<DownloadIcon />}
            loading={saving}
            onClick={(event) => {
              args.onClick?.(event);
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save' });

    await userEvent.click(save);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toHaveFocus();

    // A second click while loading is ignored.
    await userEvent.click(save);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} disabled variant="primary">
        Primary
      </Button>
      <Button {...args} disabled variant="secondary">
        Secondary
      </Button>
      <Button {...args} disabled variant="danger">
        Danger
      </Button>
      <Button {...args} disabled variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true, size: 'lg', children: 'Continue' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Button {...args} />
    </div>
  ),
};

/** Labels never wrap; in a narrow space they are truncated with an ellipsis. Keep labels short. */
export const LongText: Story = {
  render: (args) => (
    <div style={{ ...column, width: 220, padding: 12, border: '1px dashed #d1d5db' }}>
      <Button {...args}>Save and continue to the next step</Button>
      <Button {...args} fullWidth variant="secondary" leftIcon={<DownloadIcon />}>
        Download the full quarterly report
      </Button>
    </div>
  ),
};

/**
 * `type` defaults to `"button"`, so a Button never submits a form by accident.
 * Use `type="submit"` for the form's main action and `type="reset"` to clear it.
 */
export const ButtonTypes: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <form
        style={{ ...column, maxWidth: 360 }}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('name')));
        }}
        onReset={() => setSubmitted(null)}
      >
        <label style={{ display: 'grid', gap: 4, fontFamily: 'system-ui' }}>
          Name
          <input name="name" defaultValue="Asha" />
        </label>
        <div style={row}>
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
          <Button variant="ghost">Does nothing</Button>
        </div>
        <output style={{ fontFamily: 'system-ui' }}>
          {submitted ? `Submitted: ${submitted}` : 'Not submitted'}
        </output>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Does nothing' }));
    await expect(canvas.getByText('Not submitted')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByText('Submitted: Asha')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.getByText('Not submitted')).toBeInTheDocument();
  },
};

/** Hover, pressed and focus are interactive: move the mouse over a button, click it, or press Tab. */
export const States: Story = {
  render: (args) => (
    <div style={column}>
      {(['primary', 'secondary', 'danger', 'ghost'] as const).map((variant) => (
        <Row key={variant} label={variant}>
          <Button {...args} variant={variant}>
            Default
          </Button>
          <Button {...args} variant={variant} disabled>
            Disabled
          </Button>
          <Button {...args} variant={variant} loading>
            Loading
          </Button>
          <Button {...args} variant={variant} loading disabled>
            Loading + disabled
          </Button>
        </Row>
      ))}
    </div>
  ),
};

/**
 * The common "button group" pattern: one primary action, with secondary actions beside it.
 * A plain flex container is all you need; put the primary action last (right).
 */
export const ActionsRow: Story = {
  render: (args) => (
    <div style={column}>
      <div style={{ ...row, justifyContent: 'flex-end' }}>
        <Button {...args} variant="ghost">
          Cancel
        </Button>
        <Button {...args} variant="primary">
          Save
        </Button>
      </div>
      <div style={{ ...row, justifyContent: 'flex-end' }}>
        <Button {...args} variant="secondary">
          Keep
        </Button>
        <Button {...args} variant="danger" leftIcon={<TrashIcon />}>
          Delete project
        </Button>
      </div>
    </div>
  ),
};

/**
 * Buttons have no responsive props; layout decides. On narrow screens stack the actions
 * and use `fullWidth`; on wide screens keep them inline.
 */
export const Responsive: Story = {
  render: (args) => (
    <div style={column}>
      <Row label="Mobile">
        <div style={{ ...column, gap: 8, width: 320, padding: 12, border: '1px dashed #d1d5db' }}>
          <Button {...args} fullWidth>
            Save
          </Button>
          <Button {...args} fullWidth variant="secondary">
            Cancel
          </Button>
        </div>
      </Row>
      <Row label="Desktop">
        <div style={{ ...row, width: 560, padding: 12, border: '1px dashed #d1d5db' }}>
          <Button {...args} variant="secondary">
            Cancel
          </Button>
          <Button {...args}>Save</Button>
        </div>
      </Row>
    </div>
  ),
};

/** Tab moves focus (a ring appears only for keyboard focus); Enter and Space activate. */
export const Keyboard: Story = {
  args: { children: 'Press me' },
  render: (args) => (
    <div style={row}>
      <Button {...args} />
      <Button variant="secondary" disabled>
        Skipped (disabled)
      </Button>
      <Button variant="secondary">Next stop</Button>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Press me' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // Disabled buttons are skipped.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Next stop' })).toHaveFocus();
  },
};

/** For navigation use a real link styled with `buttonClassName`, never a Button inside `<a>`. */
export const AsLink: Story = {
  render: () => (
    <div style={row}>
      <a href="#docs" className={buttonClassName()}>
        Read the docs
      </a>
      <a href="#pricing" className={buttonClassName({ variant: 'secondary' })}>
        See pricing
      </a>
      <a href="#more" className={buttonClassName({ variant: 'ghost', size: 'sm' })}>
        Learn more
      </a>
    </div>
  ),
};
