import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TimeRangePicker, type DateRange } from '@mgs/ui';
import { column, Field, source } from '../shared';

// Values verified against rsuite 6.2.4 (TimeRangePicker is a DateRangePicker with a time format).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;
const time = (d: Date) => d.toTimeString().slice(0, 5);
const EXAMPLE_RANGE: DateRange = [new Date(2026, 8, 24, 9, 0), new Date(2026, 8, 24, 17, 30)];

const meta = {
  title: 'Components/TimeRangePicker',
  component: TimeRangePicker,
  // Docs come from TimeRangePicker.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text', table: { defaultValue: { summary: 'HH:mm' } } },
    character: { control: 'text', table: { defaultValue: { summary: "' ~ '" } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    showMeridiem: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: [Date, Date] | null, event) => void`',
    },
  },
} satisfies Meta<typeof TimeRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<TimeRangePicker label="Opening hours" />`),
  args: { format: 'HH:mm', size: 'md', showMeridiem: false },
  render: (args) => (
    <div style={column}>
      <TimeRangePicker {...args} label="Opening hours" />
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="hours">Opening hours</label>
<TimeRangePicker id="hours" />`),
  render: () => (
    <div style={column}>
      <Field label="Opening hours">{(id) => <TimeRangePicker id={id} />}</Field>
    </div>
  ),
};

/** `format` for 24/12-hour times; `character` is the text between start and end. */
export const Format: Story = {
  parameters: source(`<TimeRangePicker format="HH:mm" />
<TimeRangePicker format="hh:mm aa" showMeridiem character=" – " />`),
  render: () => (
    <div style={column}>
      <TimeRangePicker label="24-hour" format="HH:mm" defaultValue={EXAMPLE_RANGE} />
      <TimeRangePicker
        label="12-hour"
        format="hh:mm aa"
        showMeridiem
        character=" – "
        defaultValue={EXAMPLE_RANGE}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<TimeRangePicker size="lg" />  <TimeRangePicker size="sm" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <TimeRangePicker key={size} size={size} label={`Size ${size}`} />
      ))}
    </div>
  ),
};

/** `onChange` receives `[start, end]` as Dates (only the times matter), or `null` when cleared. */
export const Controlled: Story = {
  parameters: source(`const [hours, setHours] = useState<DateRange | null>(null);

<TimeRangePicker label="Opening hours" value={hours} onChange={setHours} />`),
  render: function Render() {
    const [hours, setHours] = useState<DateRange | null>(EXAMPLE_RANGE);
    return (
      <div style={column}>
        <TimeRangePicker label="Opening hours" value={hours} onChange={setHours} />
        <span style={{ fontSize: 14 }}>
          {hours ? `${time(hours[0])} → ${time(hours[1])}` : 'No hours'}
        </span>
      </div>
    );
  },
};
