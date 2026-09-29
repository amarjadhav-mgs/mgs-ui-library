import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, ButtonGroup, CopyIcon, DownloadIcon, IconButton, Stack, TrashIcon } from '@mgs/ui';
import { source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;
const views = ['List', 'Board', 'Calendar'];

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  // Docs come from ButtonGroup.mdx.
  tags: ['!autodocs'],
  args: { 'aria-label': 'View' },
  parameters: {
    // Only the MGS API; native <div> attributes also work but would flood the table.
    controls: { include: ['size', 'disabled', 'orientation', 'fullWidth'] },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: "Size of every button in the group that doesn't set its own.",
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every button in the group.',
      table: { defaultValue: { summary: 'false' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Buttons next to each other, or under each other.',
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fills the width of the container, with buttons of equal width.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    size: 'md',
    disabled: false,
    orientation: 'horizontal',
    fullWidth: false,
  },
  render: (args) => (
    <ButtonGroup {...args}>
      {views.map((view) => (
        <Button key={view}>{view}</Button>
      ))}
    </ButtonGroup>
  ),
};

export const Basic: Story = {
  parameters: source(`<ButtonGroup aria-label="View">
  <Button>List</Button>
  <Button>Board</Button>
  <Button>Calendar</Button>
</ButtonGroup>`),
  render: () => (
    <ButtonGroup aria-label="View">
      {views.map((view) => (
        <Button key={view}>{view}</Button>
      ))}
    </ButtonGroup>
  ),
};

/** `disabled` on the group disables every button. A single button can be disabled on its own. */
export const States: Story = {
  parameters: source(`<ButtonGroup aria-label="Export" disabled>
  <Button>CSV</Button>
  <Button>Excel</Button>
</ButtonGroup>

<ButtonGroup aria-label="Export">
  <Button>CSV</Button>
  <Button disabled>Excel</Button>
</ButtonGroup>`),
  render: () => (
    <Stack gap="lg" align="start">
      <ButtonGroup aria-label="Export, disabled" disabled>
        <Button>CSV</Button>
        <Button>Excel</Button>
        <Button>PDF</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Export, one disabled">
        <Button>CSV</Button>
        <Button disabled>Excel</Button>
        <Button>PDF</Button>
      </ButtonGroup>
    </Stack>
  ),
};

/** `size` on the group applies to every button in it that doesn't set its own. */
export const Sizes: Story = {
  parameters: source(`<ButtonGroup aria-label="View" size="sm">…</ButtonGroup>
<ButtonGroup aria-label="View" size="md">…</ButtonGroup>
<ButtonGroup aria-label="View" size="lg">…</ButtonGroup>`),
  render: () => (
    <Stack gap="lg" align="start">
      {sizes.map((size) => (
        <ButtonGroup key={size} aria-label={`View, ${size}`} size={size}>
          {views.map((view) => (
            <Button key={view}>{view}</Button>
          ))}
        </ButtonGroup>
      ))}
    </Stack>
  ),
};

/** Every variant can be grouped. Use one variant in a group. */
export const ButtonVariants: Story = {
  name: 'Button variants',
  parameters: source(`<ButtonGroup aria-label="Period">
  <Button variant="primary">Day</Button>
  <Button variant="primary">Week</Button>
  <Button variant="primary">Month</Button>
</ButtonGroup>`),
  render: () => (
    <Stack gap="lg" align="start">
      {(['secondary', 'primary', 'ghost'] as const).map((variant) => (
        <ButtonGroup key={variant} aria-label={`Period, ${variant}`}>
          {['Day', 'Week', 'Month'].map((period) => (
            <Button key={period} variant={variant}>
              {period}
            </Button>
          ))}
        </ButtonGroup>
      ))}
      <ButtonGroup aria-label="Order actions">
        <IconButton aria-label="Copy order">
          <CopyIcon />
        </IconButton>
        <IconButton aria-label="Download order">
          <DownloadIcon />
        </IconButton>
        <IconButton aria-label="Delete order">
          <TrashIcon />
        </IconButton>
      </ButtonGroup>
    </Stack>
  ),
};

/** Under each other, and filling the width of the container. */
export const Layout: Story = {
  parameters: source(`<ButtonGroup aria-label="View" orientation="vertical">…</ButtonGroup>
<ButtonGroup aria-label="View" fullWidth>…</ButtonGroup>`),
  render: () => (
    <Stack gap="lg" align="start">
      <ButtonGroup aria-label="View, vertical" orientation="vertical">
        {views.map((view) => (
          <Button key={view}>{view}</Button>
        ))}
      </ButtonGroup>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <ButtonGroup aria-label="View, full width" fullWidth>
          {views.map((view) => (
            <Button key={view}>{view}</Button>
          ))}
        </ButtonGroup>
      </div>
    </Stack>
  ),
};

/**
 * A view switcher: the chosen button says so with `aria-pressed`, and looks chosen with the `primary` variant. In a
 * toolbar, a `Stack` puts space between groups and single buttons.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [view, setView] = useState('List');

<Stack direction="row" gap="sm" align="center" role="toolbar" aria-label="Orders">
  <ButtonGroup aria-label="View">
    {views.map((name) => (
      <Button
        key={name}
        variant={view === name ? 'primary' : 'secondary'}
        aria-pressed={view === name}
        onClick={() => setView(name)}
      >
        {name}
      </Button>
    ))}
  </ButtonGroup>
  <Button leftIcon={<DownloadIcon />}>Export</Button>
</Stack>`),
  render: function Render() {
    const [view, setView] = useState('List');
    return (
      <Stack gap="md" align="start">
        <Stack direction="row" gap="sm" align="center" role="toolbar" aria-label="Orders">
          <ButtonGroup aria-label="View">
            {views.map((name) => (
              <Button
                key={name}
                variant={view === name ? 'primary' : 'secondary'}
                aria-pressed={view === name}
                onClick={() => setView(name)}
              >
                {name}
              </Button>
            ))}
          </ButtonGroup>
          <Button leftIcon={<DownloadIcon />}>Export</Button>
        </Stack>
        <output style={{ fontSize: 14 }}>View: {view}</output>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const board = canvas.getByRole('button', { name: 'Board' });
    await expect(board).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(board);
    await expect(board).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvas.getByText('View: Board')).toBeInTheDocument();
  },
};

/** The group has a name. Each button is its own Tab stop; buttons of a disabled group are skipped. */
export const Accessibility: Story = {
  parameters: source(`<ButtonGroup aria-label="Period">
  <Button>Day</Button>
  <Button>Week</Button>
</ButtonGroup>
<ButtonGroup aria-label="Export" disabled>
  <Button>CSV</Button>
</ButtonGroup>
<Button variant="primary">Save</Button>`),
  render: () => (
    <Stack direction="row" gap="sm" align="center">
      <ButtonGroup aria-label="Period">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Export" disabled>
        <Button>CSV</Button>
      </ButtonGroup>
      <Button variant="primary">Save</Button>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const period = canvas.getByRole('group', { name: 'Period' });
    await expect(within(period).getAllByRole('button')).toHaveLength(2);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Day' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Week' })).toHaveFocus();
    // The disabled group's button is skipped.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
  },
};
