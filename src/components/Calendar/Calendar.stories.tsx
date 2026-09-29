import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Calendar, Stack } from '@mgs/ui';
import { EXAMPLE_DATE, source } from '../../stories/shared';

/** A day near the example date, so the stories always show the same month. */
const day = (offset: number) =>
  new Date(EXAMPLE_DATE.getFullYear(), EXAMPLE_DATE.getMonth(), EXAMPLE_DATE.getDate() + offset);

const events: Record<string, string[]> = {
  [day(-9).toDateString()]: ['Sprint review'],
  [day(-3).toDateString()]: ['Release 2.4', 'Team lunch'],
  [day(0).toDateString()]: ['Invoices due'],
  [day(4).toDateString()]: ['Public holiday'],
};

const eventStyle = {
  display: 'block',
  overflow: 'hidden',
  fontSize: 12,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const renderEvents = (date: Date) =>
  (events[date.toDateString()] ?? []).map((event) => (
    <span key={event} style={eventStyle}>
      {event}
    </span>
  ));

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  // Docs come from Calendar.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn(), onMonthChange: fn() },
  parameters: {
    // Only the MGS API; native attributes also work but would flood the table.
    controls: { include: ['value', 'defaultValue', 'compact'] },
  },
  argTypes: {
    value: {
      control: 'date',
      description: 'The chosen day (controlled); `null` when none. Use with `onChange`.',
      table: { type: { summary: 'Date | null' } },
    },
    defaultValue: {
      control: 'date',
      description: 'The day chosen at the start (uncontrolled).',
      table: { type: { summary: 'Date' } },
    },
    compact: {
      control: 'boolean',
      description: 'Smaller days: for sidebars and cards.',
      table: { defaultValue: { summary: 'false' } },
    },
    renderDay: {
      control: false,
      description: 'What a day shows under its number.',
      table: { type: { summary: '(date: Date) => ReactNode' } },
    },
    onChange: {
      description: '`(value: Date) => void`: the user chose a day.',
      table: { category: 'Events' },
    },
    onMonthChange: {
      description: '`(month: Date) => void`: the first day of the month now on show.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A date control gives a number; the calendar needs a Date. */
const toDate = (value: unknown) =>
  value === undefined || value === null ? undefined : new Date(value as number);

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: { compact: false },
  render: ({ value, defaultValue, ...args }) => (
    <Calendar
      {...args}
      aria-label="Calendar"
      value={value === null ? null : toDate(value)}
      defaultValue={toDate(defaultValue) ?? EXAMPLE_DATE}
    />
  ),
};

export const Basic: Story = {
  parameters: source(`<Calendar aria-label="Team calendar" defaultValue={today} />`),
  render: () => <Calendar aria-label="Team calendar" defaultValue={EXAMPLE_DATE} />,
};

/** `compact` for sidebars and cards. Give it a width: a calendar fills the width it gets. */
export const Compact: Story = {
  parameters: source(`<div style={{ maxWidth: 320 }}>
  <Calendar aria-label="Due dates" compact />
</div>`),
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Calendar aria-label="Due dates" compact defaultValue={EXAMPLE_DATE} />
    </div>
  ),
};

/** `renderDay` shows what happens on a day, under its number. */
export const DayContent: Story = {
  name: 'Day content',
  parameters: source(`<Calendar
  aria-label="Team calendar"
  renderDay={(date) =>
    eventsOf(date).map((event) => <span key={event}>{event}</span>)
  }
/>`),
  render: () => (
    <Calendar aria-label="Team calendar" defaultValue={EXAMPLE_DATE} renderDay={renderEvents} />
  ),
};

/** `onChange` receives the day the user chose: `onChange={setDay}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [day, setDay] = useState<Date | null>(null);

<Calendar aria-label="Delivery day" value={day} onChange={setDay} compact />`),
  render: function Render() {
    const [chosen, setChosen] = useState<Date | null>(EXAMPLE_DATE);
    return (
      <Stack gap="sm" style={{ maxWidth: 320 }}>
        <Calendar aria-label="Delivery day" value={chosen} onChange={setChosen} compact />
        <output style={{ fontSize: 14 }}>Value: {chosen ? chosen.toDateString() : 'null'}</output>
        <Stack direction="row" gap="sm">
          <Button size="sm" onClick={() => setChosen(day(7))}>
            One week later
          </Button>
          <Button size="sm" onClick={() => setChosen(null)}>
            No day
          </Button>
        </Stack>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'One week later' }));
    await expect(canvas.getByText('Value: Thu Oct 01 2026')).toBeInTheDocument();
    await expect(canvas.getByRole('gridcell', { name: /01 Oct 2026/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

/** A calendar and the events of the chosen day beside it. */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [day, setDay] = useState<Date>(new Date());

<Stack direction="row" gap="lg" wrap>
  <div style={{ width: 320 }}>
    <Calendar aria-label="Team calendar" value={day} onChange={setDay} compact />
  </div>
  <section aria-label="Events" aria-live="polite">
    <h3>{day.toDateString()}</h3>
    <ul>{eventsOf(day).map((event) => <li key={event}>{event}</li>)}</ul>
  </section>
</Stack>`),
  render: function Render() {
    const [chosen, setChosen] = useState<Date>(day(-3));
    const list = events[chosen.toDateString()] ?? [];
    return (
      <Stack direction="row" gap="lg" wrap>
        <div style={{ width: 320 }}>
          <Calendar aria-label="Team calendar" value={chosen} onChange={setChosen} compact />
        </div>
        <section aria-label="Events" aria-live="polite" style={{ minWidth: 200 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{chosen.toDateString()}</h3>
          {list.length > 0 ? (
            <ul style={{ margin: 0, paddingInlineStart: 20 }}>
              {list.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0 }}>No events</p>
          )}
        </section>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Release 2.4')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('gridcell', { name: /24 Sep 2026/ }));
    await expect(canvas.getByText('Invoices due')).toBeInTheDocument();
  },
};

/** `aria-label` names the calendar. The days are a grid; each day says its whole date. */
export const Accessibility: Story = {
  parameters: source(`<Calendar aria-label="Team calendar" />`),
  render: () => <Calendar aria-label="Team calendar" defaultValue={EXAMPLE_DATE} compact />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid')).toBeInTheDocument();
    await expect(canvas.getByRole('gridcell', { name: /24 Sep 2026/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: /next month/i }));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
