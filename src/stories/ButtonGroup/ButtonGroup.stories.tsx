import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, ButtonGroup, ButtonToolbar, CopyIcon, IconButton, TrashIcon } from '@mgs/ui';
import { source } from '../shared';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ width: 96, fontSize: 12, color: 'var(--mgs-color-text-secondary)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

const alignment = ['Left', 'Center', 'Right'].map((label) => <Button key={label}>{label}</Button>);

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  // Docs come from ButtonGroup.mdx.
  tags: ['!autodocs'],
  args: { 'aria-label': 'Text alignment' },
  parameters: {
    controls: { include: ['size', 'disabled', 'vertical', 'justified', 'block', 'divided'] },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of every button in the group that does not set its own.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" } },
    },
    disabled: { control: 'boolean', description: 'Disables every button in the group.' },
    vertical: { control: 'boolean', description: 'Stacks the buttons vertically.' },
    justified: { control: 'boolean', description: 'Equal-width buttons across the container.' },
    block: { control: 'boolean', description: 'Fills the container width.' },
    divided: { control: 'boolean', description: 'Dividing lines between the buttons.' },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change the group props in the Controls panel. */
export const Playground: Story = {
  args: {
    size: 'md',
    disabled: false,
    vertical: false,
    justified: false,
    block: false,
    divided: false,
  },
  render: (args) => <ButtonGroup {...args}>{alignment}</ButtonGroup>,
};

export const Basic: Story = {
  parameters: source(`<ButtonGroup aria-label="Text alignment">
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>`),
  render: () => <ButtonGroup aria-label="Text alignment">{alignment}</ButtonGroup>,
};

/** `size` and `disabled` on the group apply to every button in it that doesn't set its own. */
export const GroupProps: Story = {
  name: 'Group props',
  parameters: source(`<ButtonGroup size="sm">…</ButtonGroup>
<ButtonGroup disabled>…</ButtonGroup>
<ButtonGroup vertical>…</ButtonGroup>
<ButtonGroup justified>…</ButtonGroup>`),
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Row label="Primary">
        <ButtonGroup aria-label="Period">
          <Button variant="primary">Day</Button>
          <Button variant="primary">Week</Button>
          <Button variant="primary">Month</Button>
        </ButtonGroup>
      </Row>
      <Row label="Small">
        <ButtonGroup aria-label="Text alignment (small)" size="sm">
          {alignment}
        </ButtonGroup>
      </Row>
      <Row label="Disabled">
        <ButtonGroup aria-label="Text alignment (disabled)" disabled>
          {alignment}
        </ButtonGroup>
      </Row>
      <Row label="Vertical">
        <ButtonGroup aria-label="Text alignment (vertical)" vertical>
          {alignment}
        </ButtonGroup>
      </Row>
      <div style={{ maxWidth: 420 }}>
        <ButtonGroup aria-label="Text alignment (justified)" justified>
          {alignment}
        </ButtonGroup>
      </div>
    </div>
  ),
};

/** Lays out buttons and groups in a row with even spacing. Add an `aria-label`; focus moves with Tab. */
export const Toolbar: Story = {
  parameters: source(`<ButtonToolbar aria-label="Order actions">
  <Button variant="primary">Save</Button>
  <Button>Preview</Button>
  <ButtonGroup aria-label="Clipboard">
    <IconButton aria-label="Copy order"><CopyIcon /></IconButton>
    <IconButton aria-label="Delete order"><TrashIcon /></IconButton>
  </ButtonGroup>
</ButtonToolbar>`),
  render: () => (
    <ButtonToolbar aria-label="Order actions">
      <Button variant="primary">Save</Button>
      <Button>Preview</Button>
      <ButtonGroup aria-label="Clipboard">
        <IconButton aria-label="Copy order">
          <CopyIcon />
        </IconButton>
        <IconButton aria-label="Delete order">
          <TrashIcon />
        </IconButton>
      </ButtonGroup>
    </ButtonToolbar>
  ),
};

/**
 * Each button is its own Tab stop; buttons in a disabled group are skipped. Name every group and toolbar with
 * `aria-label` so screen readers announce what it is for.
 */
export const Accessibility: Story = {
  parameters: source(`<ButtonToolbar aria-label="Order actions">
  <ButtonGroup aria-label="Period">
    <Button>Day</Button>
    <Button>Week</Button>
  </ButtonGroup>
  <ButtonGroup aria-label="Export" disabled>
    <Button>CSV</Button>
  </ButtonGroup>
  <Button variant="primary">Save</Button>
</ButtonToolbar>`),
  render: () => (
    <ButtonToolbar aria-label="Order actions">
      <ButtonGroup aria-label="Period">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Export" disabled>
        <Button>CSV</Button>
      </ButtonGroup>
      <Button variant="primary">Save</Button>
    </ButtonToolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar', { name: 'Order actions' });
    await expect(within(toolbar).getByRole('group', { name: 'Period' })).toBeInTheDocument();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Day' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Week' })).toHaveFocus();
    // The disabled group's button is skipped.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
  },
};
