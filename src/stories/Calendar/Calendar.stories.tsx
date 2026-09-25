import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge, Calendar } from '@mgs/ui';
import { EXAMPLE_DATE, source } from '../shared';

// Values verified against rsuite 6.2.4 (Calendar.d.ts).
const narrow = { maxWidth: 420 };

const meta = {
  title: 'Components/Date & Time/Calendar',
  component: Calendar,
  // Docs come from Calendar.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onSelect: fn(), defaultValue: EXAMPLE_DATE },
  argTypes: {
    compact: { control: 'boolean' },
    bordered: { control: 'boolean' },
    isoWeek: { control: 'boolean', description: 'Weeks start on Monday.' },
    weekStart: {
      control: 'inline-radio',
      options: [0, 1, 2, 3, 4, 5, 6],
      description:
        'First day of the week (0 = Sunday). Wins over `isoWeek`. Default: the locale (Monday).',
    },
    onSelect: { table: { category: 'Events' }, description: '`(date: Date) => void`' },
    onChange: { table: { category: 'Events' }, description: '`(date: Date) => void`' },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<Calendar bordered compact />`),
  args: { compact: true, bordered: true, isoWeek: false },
  render: (args) => (
    <div style={narrow}>
      <Calendar {...args} />
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<Calendar bordered />`),
  render: () => <Calendar bordered defaultValue={EXAMPLE_DATE} />,
};

/** `compact` for sidebars and small cards. */
export const Compact: Story = {
  parameters: source(`<Calendar compact bordered />`),
  render: () => (
    <div style={narrow}>
      <Calendar compact bordered defaultValue={EXAMPLE_DATE} />
    </div>
  ),
};

/** Weeks start on the locale's first day (Monday by default). `weekStart` (0 = Sunday … 6 = Saturday) changes it. */
export const WeekStart: Story = {
  name: 'Week start',
  parameters: source(`<Calendar compact weekStart={0} />   // Sunday first`),
  render: () => (
    <div style={narrow}>
      <Calendar compact bordered weekStart={0} defaultValue={EXAMPLE_DATE} />
    </div>
  ),
};

/**
 * `renderCell` adds content to each day (events, counts) and `cellClassName` styles days.
 * A day is announced only by its date, so also list the events elsewhere as text.
 */
export const CustomCells: Story = {
  name: 'Custom cells',
  parameters: source(`<Calendar
  bordered
  renderCell={(date) => {
    const count = eventsOn(date).length;
    return count ? <Badge content={count} color="violet" /> : null;
  }}
/>`),
  render: () => {
    const events: Record<number, number> = { 3: 2, 12: 1, 24: 4 };
    return (
      <Calendar
        bordered
        defaultValue={EXAMPLE_DATE}
        renderCell={(date) => {
          const count = date.getMonth() === EXAMPLE_DATE.getMonth() ? events[date.getDate()] : 0;
          return count ? <Badge content={count} color="violet" /> : null;
        }}
      />
    );
  },
};

/** `onSelect` fires when a day is clicked; `onChange` when the value changes (also via month switching). */
export const Controlled: Story = {
  parameters: source(`const [date, setDate] = useState(new Date());

<Calendar compact value={date} onChange={setDate} />`),
  render: function Render(args) {
    const [date, setDate] = useState(EXAMPLE_DATE);
    return (
      <div style={narrow}>
        <Calendar compact bordered value={date} onChange={setDate} onSelect={args.onSelect} />
        <p style={{ fontSize: 14 }}>Selected: {date.toDateString()}</p>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Each day is a gridcell named by its date, e.g. "10 Sep 2026".
    await userEvent.click(canvas.getByRole('gridcell', { name: '10 Sep 2026' }));
    await expect(args.onSelect).toHaveBeenCalled();
    await expect(canvas.getByText('Selected: Thu Sep 10 2026')).toBeInTheDocument();
  },
};

/**
 * The month is a grid named after the month, each day is named by its full date, and only the selected day is in the
 * Tab order. The month buttons are named and work with Enter. For keyboard date entry, prefer DatePicker.
 */
export const Accessibility: Story = {
  parameters: source(`<Calendar compact defaultValue={new Date(2026, 8, 24)} />`),
  render: (args) => (
    <div style={narrow}>
      <Calendar compact defaultValue={EXAMPLE_DATE} onChange={args.onChange} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid', { name: 'Sep 2026' })).toBeInTheDocument();
    const selected = canvas.getByRole('gridcell', { name: '24 Sep 2026' });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    // Only the selected day is a Tab stop.
    const tabbable = canvas.getAllByRole('gridcell').filter((cell) => cell.tabIndex === 0);
    await expect(tabbable).toEqual([selected]);
    // The month buttons are named and keyboard operable.
    canvas.getByRole('button', { name: 'Next month' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('grid', { name: 'Oct 2026' })).toBeInTheDocument();
  },
};
