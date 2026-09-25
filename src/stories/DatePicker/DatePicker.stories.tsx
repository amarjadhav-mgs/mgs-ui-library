import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DatePicker } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, row, source } from '../shared';

// Values verified against rsuite 6.2.4 (DatePicker.d.ts, internals/types/picker.d.ts).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  // Docs come from DatePicker.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text', table: { defaultValue: { summary: 'yyyy-MM-dd' } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    appearance: { control: 'inline-radio', options: ['default', 'subtle'] },
    placement: {
      control: 'select',
      options: ['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'autoVerticalStart'],
      table: { defaultValue: { summary: 'bottomStart' } },
    },
    block: { control: 'boolean' },
    cleanable: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    editable: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    oneTap: { control: 'boolean' },
    showWeekNumbers: { control: 'boolean' },
    isoWeek: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    plaintext: { control: 'boolean' },
    loading: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: Date | null, event) => void`',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<label htmlFor="start">Start date</label>
<DatePicker id="start" />`),
  args: { format: 'yyyy-MM-dd', size: 'md', appearance: 'default', block: false, oneTap: false },
  render: (args) => (
    <div style={column}>
      <Field label="Start date">{(id) => <DatePicker {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="start">Start date</label>
<DatePicker id="start" />`),
  render: () => (
    <div style={column}>
      <Field label="Start date">{(id) => <DatePicker id={id} />}</Field>
    </div>
  ),
};

/** `label` shows a label inside the field and connects it to the input for screen readers. */
export const Label: Story = {
  parameters: source(`<DatePicker label="Start date" />`),
  render: () => (
    <div style={column}>
      <DatePicker label="Start date" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<DatePicker size="lg" label="Large" />
<DatePicker size="md" label="Medium" />
<DatePicker size="sm" label="Small" />
<DatePicker size="xs" label="Extra small" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <DatePicker key={size} size={size} label={`Size ${size}`} />
      ))}
    </div>
  ),
};

/** `appearance="subtle"` removes the border (for toolbars and filters). `block` fills the container. */
export const AppearanceAndBlock: Story = {
  name: 'Appearance / Block',
  parameters: source(`<DatePicker appearance="subtle" label="Subtle" />
<DatePicker block label="Block" />`),
  render: () => (
    <div style={column}>
      <DatePicker appearance="subtle" label="Subtle" />
      <DatePicker block label="Block" />
    </div>
  ),
};

/** `format` uses date-fns tokens. Include hours and minutes to pick a time as well. */
export const Format: Story = {
  parameters: source(`<DatePicker format="dd/MM/yyyy" />
<DatePicker format="MMM dd, yyyy" />
<DatePicker format="yyyy-MM-dd HH:mm" />   // date + time
<DatePicker format="dd/MM/yyyy hh:mm aa" showMeridiem />`),
  render: () => (
    <div style={column}>
      <DatePicker label="dd/MM/yyyy" format="dd/MM/yyyy" defaultValue={EXAMPLE_DATE} />
      <DatePicker label="MMM dd, yyyy" format="MMM dd, yyyy" defaultValue={EXAMPLE_DATE} />
      <DatePicker label="Date + time" format="yyyy-MM-dd HH:mm" defaultValue={EXAMPLE_DATE} />
      <DatePicker
        label="12-hour"
        format="dd/MM/yyyy hh:mm aa"
        showMeridiem
        defaultValue={EXAMPLE_DATE}
      />
    </div>
  ),
};

/** `oneTap` closes the picker as soon as a date is clicked (no OK button). */
export const OneTap: Story = {
  parameters: source(`<DatePicker oneTap />`),
  render: () => (
    <div style={column}>
      <DatePicker label="Due date" oneTap />
    </div>
  ),
};

/** `shouldDisableDate` blocks dates, e.g. weekends. Disabled days can't be picked or typed. */
export const DisabledDates: Story = {
  name: 'Disabled dates',
  parameters: source(`const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

<DatePicker shouldDisableDate={isWeekend} />`),
  render: () => (
    <div style={column}>
      <DatePicker
        label="Weekday"
        shouldDisableDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
    </div>
  ),
};

/** `ranges` adds shortcut buttons to the popup. */
export const Shortcuts: Story = {
  parameters: source(`<DatePicker
  ranges={[
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: addDays(new Date(), 1) },
  ]}
/>`),
  render: () => (
    <div style={column}>
      <DatePicker
        label="Delivery"
        ranges={[
          { label: 'Today', value: new Date() },
          { label: 'Tomorrow', value: new Date(Date.now() + 86_400_000) },
        ]}
      />
    </div>
  ),
};

/** `showWeekNumbers` adds week numbers; `isoWeek` starts weeks on Monday (ISO 8601). */
export const WeekNumbers: Story = {
  name: 'Week numbers',
  parameters: source(`<DatePicker showWeekNumbers isoWeek />`),
  render: () => (
    <div style={column}>
      <DatePicker label="Week" showWeekNumbers isoWeek />
    </div>
  ),
};

export const States: Story = {
  name: 'Disabled / Read-only / Plaintext / Loading',
  parameters: source(`<DatePicker disabled />
<DatePicker readOnly defaultValue={date} />
<DatePicker plaintext defaultValue={date} />
<DatePicker loading />`),
  render: () => (
    <div style={column}>
      <DatePicker label="Disabled" disabled />
      <DatePicker label="Read-only" readOnly defaultValue={EXAMPLE_DATE} />
      <div style={row}>
        <span>Plaintext:</span>
        <DatePicker plaintext defaultValue={EXAMPLE_DATE} />
      </div>
      <DatePicker label="Loading" loading />
    </div>
  ),
};

/** `onChange` receives a `Date` (or `null` when cleared). */
export const Controlled: Story = {
  parameters: source(`const [date, setDate] = useState<Date | null>(null);

<DatePicker id="start" value={date} onChange={setDate} />`),
  render: function Render() {
    const [date, setDate] = useState<Date | null>(EXAMPLE_DATE);
    return (
      <div style={column}>
        <Field label="Start date">
          {(id) => <DatePicker id={id} value={date} onChange={setDate} />}
        </Field>
        <span style={{ fontSize: 14 }}>Selected: {date ? date.toDateString() : 'none'}</span>
      </div>
    );
  },
};

/** Type a date directly, or press Enter to open the calendar. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="birthday">Date of birth</label>
<DatePicker id="birthday" format="dd/MM/yyyy" oneTap />`),
  render: (args) => (
    <div style={column}>
      <Field label="Date of birth">
        {(id) => <DatePicker id={id} format="dd/MM/yyyy" oneTap onChange={args.onChange} />}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Date of birth');
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{Escape}');
  },
};
