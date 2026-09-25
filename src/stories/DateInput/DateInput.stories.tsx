import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DateInput } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../shared';

// Values verified against rsuite 6.2.4 (DateInput.d.ts, DateInput/hooks/useKeyboardInputEvent.js).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;

const meta = {
  title: 'Components/DateInput',
  component: DateInput,
  // Docs come from DateInput.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text', table: { defaultValue: { summary: 'yyyy-MM-dd' } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    plaintext: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: Date | null, event) => void`',
    },
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<label htmlFor="date">Date</label>
<DateInput id="date" format="dd/MM/yyyy" />`),
  args: { format: 'dd/MM/yyyy', size: 'md', disabled: false, readOnly: false, plaintext: false },
  render: (args) => (
    <div style={column}>
      <Field label="Date">{(id) => <DateInput {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="date">Date</label>
<DateInput id="date" />`),
  render: () => (
    <div style={column}>
      <Field label="Date">{(id) => <DateInput id={id} />}</Field>
    </div>
  ),
};

/** `format` uses date-fns tokens and is also the placeholder. Add hours/minutes for date and time. */
export const Format: Story = {
  parameters: source(`<DateInput format="dd/MM/yyyy" />
<DateInput format="MM/dd/yyyy" />
<DateInput format="yyyy-MM-dd HH:mm" />`),
  render: () => (
    <div style={column}>
      <Field label="dd/MM/yyyy">
        {(id) => <DateInput id={id} format="dd/MM/yyyy" defaultValue={EXAMPLE_DATE} />}
      </Field>
      <Field label="MM/dd/yyyy">
        {(id) => <DateInput id={id} format="MM/dd/yyyy" defaultValue={EXAMPLE_DATE} />}
      </Field>
      <Field label="Date and time">
        {(id) => <DateInput id={id} format="yyyy-MM-dd HH:mm" defaultValue={EXAMPLE_DATE} />}
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<DateInput size="lg" />
<DateInput size="md" />
<DateInput size="sm" />
<DateInput size="xs" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <DateInput key={size} size={size} aria-label={`Date (${size})`} />
      ))}
    </div>
  ),
};

export const States: Story = {
  name: 'Disabled / Read-only / Plaintext',
  parameters: source(`<DateInput disabled />
<DateInput readOnly defaultValue={date} />
<DateInput plaintext defaultValue={date} />`),
  render: () => (
    <div style={column}>
      <Field label="Disabled">{(id) => <DateInput id={id} disabled />}</Field>
      <Field label="Read-only">
        {(id) => <DateInput id={id} readOnly defaultValue={EXAMPLE_DATE} />}
      </Field>
      <DateInput plaintext defaultValue={EXAMPLE_DATE} />
    </div>
  ),
};

/**
 * While the date is incomplete, `onChange` receives an **Invalid Date** (not `null`), so check it before
 * using the value.
 */
export const Controlled: Story = {
  parameters: source(`const [date, setDate] = useState<Date | null>(null);
const isComplete = date !== null && !Number.isNaN(date.getTime());

<DateInput id="date" value={date} onChange={setDate} />
{isComplete ? date.toDateString() : 'Incomplete date'}`),
  render: function Render() {
    const [date, setDate] = useState<Date | null>(EXAMPLE_DATE);
    const isComplete = date !== null && !Number.isNaN(date.getTime());
    return (
      <div style={column}>
        <Field label="Date">
          {(id) => <DateInput id={id} format="dd/MM/yyyy" value={date} onChange={setDate} />}
        </Field>
        <span style={{ fontSize: 14 }}>
          Value: {date === null ? 'none' : isComplete ? date.toDateString() : 'incomplete date'}
        </span>
      </div>
    );
  },
};

/**
 * Typing edits the selected part (day, month or year): click the part, or move with ←/→, then type.
 * ↑/↓ change the selected part. Explain the format in help text.
 */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="dob">Date of birth</label>
<DateInput id="dob" format="dd/MM/yyyy" aria-describedby="dob-help" />
<p id="dob-help">Format: dd/mm/yyyy. Click the day, then type.</p>`),
  render: (args) => (
    <div style={column}>
      <Field label="Date of birth">
        {(id) => (
          <>
            <DateInput
              id={id}
              format="dd/MM/yyyy"
              onChange={args.onChange}
              aria-describedby={`${id}-help`}
            />
            <p id={`${id}-help`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              Format: dd/mm/yyyy. Click the day, then type.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};
