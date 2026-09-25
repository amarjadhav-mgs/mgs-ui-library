import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { allowedMaxDays, beforeToday, combine, DateRangePicker, type DateRange } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../shared';

// Values verified against rsuite 6.2.4 (DateRangePicker.d.ts, disabledDateUtils.d.ts).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
const EXAMPLE_RANGE: DateRange = [EXAMPLE_DATE, addDays(EXAMPLE_DATE, 6)];

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  // Docs come from DateRangePicker.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text' },
    character: { control: 'text', table: { defaultValue: { summary: "' ~ '" } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    appearance: { control: 'inline-radio', options: ['default', 'subtle'] },
    showOneCalendar: { control: 'boolean' },
    showWeekNumbers: { control: 'boolean' },
    hoverRange: { control: 'inline-radio', options: [undefined, 'week', 'month'] },
    oneTap: { control: 'boolean' },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: [Date, Date] | null, event) => void`',
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<DateRangePicker label="Travel dates" />`),
  args: { size: 'md', appearance: 'default', showOneCalendar: false, oneTap: false },
  render: (args) => (
    <div style={column}>
      <DateRangePicker {...args} label="Travel dates" />
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="travel">Travel dates</label>
<DateRangePicker id="travel" />`),
  render: () => (
    <div style={column}>
      <Field label="Travel dates">{(id) => <DateRangePicker id={id} />}</Field>
    </div>
  ),
};

export const Label: Story = {
  parameters: source(`<DateRangePicker label="Travel dates" />`),
  render: () => (
    <div style={column}>
      <DateRangePicker label="Travel dates" />
    </div>
  ),
};

/** `showOneCalendar` shows one month instead of two: better on small screens. */
export const OneCalendar: Story = {
  name: 'One calendar',
  parameters: source(`<DateRangePicker showOneCalendar />`),
  render: () => (
    <div style={column}>
      <DateRangePicker label="Dates" showOneCalendar />
    </div>
  ),
};

/** `hoverRange` selects a whole week or month with one click; `oneTap` closes on that click. */
export const WeekOrMonth: Story = {
  name: 'Week / month selection',
  parameters: source(`<DateRangePicker hoverRange="week" oneTap isoWeek />
<DateRangePicker hoverRange="month" oneTap />`),
  render: () => (
    <div style={column}>
      <DateRangePicker label="Week" hoverRange="week" oneTap isoWeek />
      <DateRangePicker label="Month" hoverRange="month" oneTap />
    </div>
  ),
};

/**
 * `shouldDisableDate` blocks dates. Ready-made rules: `beforeToday()`, `afterToday()`,
 * `allowedMaxDays(n)`, `allowedRange(start, end)`, `combine(...)` (all from `@mgs/ui`).
 */
export const DisabledDates: Story = {
  name: 'Disabled dates',
  parameters:
    source(`import { DateRangePicker, beforeToday, allowedMaxDays, combine } from '@mgs/ui';

<DateRangePicker shouldDisableDate={beforeToday()} />
<DateRangePicker shouldDisableDate={combine(beforeToday(), allowedMaxDays(7))} />`),
  render: () => (
    <div style={column}>
      <DateRangePicker label="From today" shouldDisableDate={beforeToday()} />
      <DateRangePicker
        label="Up to 7 days, from today"
        shouldDisableDate={combine(beforeToday(), allowedMaxDays(7))}
      />
    </div>
  ),
};

/** `ranges` replaces the default shortcuts (Today, Yesterday, Last 7 days). */
export const Shortcuts: Story = {
  parameters: source(`<DateRangePicker
  ranges={[
    { label: 'Next 7 days', value: [today, addDays(today, 6)] },
    { label: 'Next 30 days', value: [today, addDays(today, 29)] },
  ]}
/>`),
  render: () => {
    const today = new Date();
    return (
      <div style={column}>
        <DateRangePicker
          label="Report period"
          ranges={[
            { label: 'Next 7 days', value: [today, addDays(today, 6)] },
            { label: 'Next 30 days', value: [today, addDays(today, 29)] },
          ]}
        />
      </div>
    );
  },
};

/** `format` for date and time; `character` is the text between start and end. */
export const Format: Story = {
  parameters: source(`<DateRangePicker format="dd/MM/yyyy" character=" – " />
<DateRangePicker format="yyyy-MM-dd HH:mm" />`),
  render: () => (
    <div style={column}>
      <DateRangePicker
        label="Dates"
        format="dd/MM/yyyy"
        character=" – "
        defaultValue={EXAMPLE_RANGE}
      />
      <DateRangePicker label="With time" format="yyyy-MM-dd HH:mm" defaultValue={EXAMPLE_RANGE} />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<DateRangePicker size="lg" />  <DateRangePicker size="sm" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <DateRangePicker key={size} size={size} label={`Size ${size}`} />
      ))}
    </div>
  ),
};

/** `onChange` receives `[start, end]`, or `null` when cleared. */
export const Controlled: Story = {
  parameters: source(`const [range, setRange] = useState<DateRange | null>(null);

<DateRangePicker label="Dates" value={range} onChange={setRange} />`),
  render: function Render() {
    const [range, setRange] = useState<DateRange | null>(EXAMPLE_RANGE);
    return (
      <div style={column}>
        <DateRangePicker label="Dates" value={range} onChange={setRange} />
        <span style={{ fontSize: 14 }}>
          {range ? `${range[0].toDateString()} → ${range[1].toDateString()}` : 'No range'}
        </span>
      </div>
    );
  },
};
