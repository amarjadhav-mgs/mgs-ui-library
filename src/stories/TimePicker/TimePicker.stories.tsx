import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TimePicker } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../shared';

// Values verified against rsuite 6.2.4 (TimePicker.d.ts; TimePicker is a DatePicker with a time format).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  // Docs come from TimePicker.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text', table: { defaultValue: { summary: 'HH:mm' } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    showMeridiem: { control: 'boolean', description: 'AM/PM (use with a 12-hour format).' },
    editable: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    plaintext: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: Date | null, event) => void`',
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<TimePicker label="Start time" />`),
  args: { format: 'HH:mm', size: 'md', showMeridiem: false },
  render: (args) => (
    <div style={column}>
      <TimePicker {...args} label="Start time" />
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="start">Start time</label>
<TimePicker id="start" />`),
  render: () => (
    <div style={column}>
      <Field label="Start time">{(id) => <TimePicker id={id} />}</Field>
    </div>
  ),
};

export const Label: Story = {
  parameters: source(`<TimePicker label="Start time" />`),
  render: () => (
    <div style={column}>
      <TimePicker label="Start time" />
    </div>
  ),
};

/** `format` decides which columns appear: `HH:mm`, `HH:mm:ss`, or `hh:mm aa` with `showMeridiem`. */
export const Format: Story = {
  parameters: source(`<TimePicker format="HH:mm" />
<TimePicker format="HH:mm:ss" />
<TimePicker format="hh:mm aa" showMeridiem />`),
  render: () => (
    <div style={column}>
      <TimePicker label="24-hour" format="HH:mm" defaultValue={EXAMPLE_DATE} />
      <TimePicker label="With seconds" format="HH:mm:ss" defaultValue={EXAMPLE_DATE} />
      <TimePicker label="12-hour" format="hh:mm aa" showMeridiem defaultValue={EXAMPLE_DATE} />
    </div>
  ),
};

/** `hideHours` / `hideMinutes` / `hideSeconds` remove options, e.g. outside working hours or every 15 minutes. */
export const LimitOptions: Story = {
  name: 'Limit options',
  parameters: source(`<TimePicker
  hideHours={(hour) => hour < 9 || hour > 17}
  hideMinutes={(minute) => minute % 15 !== 0}
/>`),
  render: () => (
    <div style={column}>
      <TimePicker
        label="Meeting (9–17, every 15 min)"
        hideHours={(hour) => hour < 9 || hour > 17}
        hideMinutes={(minute) => minute % 15 !== 0}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<TimePicker size="lg" />  <TimePicker size="sm" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <TimePicker key={size} size={size} label={`Size ${size}`} />
      ))}
    </div>
  ),
};

/** `onChange` receives a `Date` (only its time matters), or `null` when cleared. */
export const Controlled: Story = {
  parameters: source(`const [time, setTime] = useState<Date | null>(null);

<TimePicker label="Start time" value={time} onChange={setTime} />`),
  render: function Render() {
    const [time, setTime] = useState<Date | null>(EXAMPLE_DATE);
    return (
      <div style={column}>
        <TimePicker label="Start time" value={time} onChange={setTime} />
        <span style={{ fontSize: 14 }}>{time ? time.toTimeString().slice(0, 5) : 'No time'}</span>
      </div>
    );
  },
};
