import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DateRangeInput, type DateRangeInputProps } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../shared';

// Values verified against rsuite 6.2.4 (DateRangeInput.d.ts / .js).
const sizes = ['lg', 'md', 'sm', 'xs'] as const;
// Each end can be null (or an Invalid Date) while the range is incomplete.
type RangeValue = DateRangeInputProps['value'];
const EXAMPLE_RANGE: RangeValue = [EXAMPLE_DATE, new Date(2026, 8, 30)];

const meta = {
  title: 'Components/Date & Time/DateRangeInput',
  component: DateRangeInput,
  // Docs come from DateRangeInput.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  argTypes: {
    format: { control: 'text' },
    character: { control: 'text', table: { defaultValue: { summary: "' ~ '" } } },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    plaintext: { control: 'boolean' },
    onChange: {
      table: { category: 'Events' },
      description: '`(value: [Date, Date] | null, event) => void`',
    },
  },
} satisfies Meta<typeof DateRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<label htmlFor="period">Period</label>
<DateRangeInput id="period" />`),
  args: { size: 'md', disabled: false, readOnly: false, plaintext: false },
  render: (args) => (
    <div style={column}>
      <Field label="Period">{(id) => <DateRangeInput {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="period">Period</label>
<DateRangeInput id="period" />`),
  render: () => (
    <div style={column}>
      <Field label="Period">{(id) => <DateRangeInput id={id} />}</Field>
    </div>
  ),
};

/** `format` for each date; `character` is the text between them. */
export const Format: Story = {
  parameters: source(`<DateRangeInput format="yyyy-MM-dd" character=" to " />
<DateRangeInput format="dd/MM/yyyy HH:mm" />`),
  render: () => (
    <div style={column}>
      <Field label="ISO dates">
        {(id) => (
          <DateRangeInput
            id={id}
            format="yyyy-MM-dd"
            character=" to "
            defaultValue={EXAMPLE_RANGE}
          />
        )}
      </Field>
      <Field label="With time">
        {(id) => <DateRangeInput id={id} format="dd/MM/yyyy HH:mm" defaultValue={EXAMPLE_RANGE} />}
      </Field>
    </div>
  ),
};

export const States: Story = {
  name: 'Disabled / Read-only / Plaintext',
  parameters: source(`<DateRangeInput disabled />
<DateRangeInput readOnly defaultValue={range} />
<DateRangeInput plaintext defaultValue={range} />`),
  render: () => (
    <div style={column}>
      <Field label="Disabled">{(id) => <DateRangeInput id={id} disabled />}</Field>
      <Field label="Read-only">
        {(id) => <DateRangeInput id={id} readOnly defaultValue={EXAMPLE_RANGE} />}
      </Field>
      <DateRangeInput plaintext defaultValue={EXAMPLE_RANGE} />
    </div>
  ),
};

/** `onChange` receives `[start, end]`; either end can be `null` or an Invalid Date while incomplete. */
export const Controlled: Story = {
  parameters: source(`const [range, setRange] = useState<DateRangeInputProps['value']>(null);
const isComplete = range?.every((d) => d && !Number.isNaN(d.getTime()));

<DateRangeInput id="period" value={range} onChange={setRange} />`),
  render: function Render() {
    const [range, setRange] = useState<RangeValue>(EXAMPLE_RANGE);
    const isComplete = range?.every((d) => d && !Number.isNaN(d.getTime()));
    return (
      <div style={column}>
        <Field label="Period">
          {(id) => <DateRangeInput id={id} value={range} onChange={setRange} />}
        </Field>
        <span style={{ fontSize: 14 }}>
          {range?.[0] && range[1] && isComplete
            ? `${range[0].toDateString()} → ${range[1].toDateString()}`
            : 'Incomplete range'}
        </span>
      </div>
    );
  },
};

/**
 * Label the field and describe the expected format in help text linked with `aria-describedby`. Typing works as in
 * DateInput: select a part (click it, or ← / →), then type; ↑ / ↓ change it.
 */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="period">Report period</label>
<DateRangeInput id="period" aria-describedby="period-help" />
<p id="period-help">Format: dd/mm/yyyy ~ dd/mm/yyyy. Click a part, then type.</p>`),
  render: (args) => (
    <div style={column}>
      <Field label="Report period">
        {(id) => (
          <>
            <DateRangeInput id={id} onChange={args.onChange} aria-describedby={`${id}-help`} />
            <p id={`${id}-help`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              Format: dd/mm/yyyy ~ dd/mm/yyyy. Click a part, then type.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Report period');
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription(
      'Format: dd/mm/yyyy ~ dd/mm/yyyy. Click a part, then type.',
    );
    await expect(input).toHaveAttribute('placeholder', 'dd/MM/yyyy ~ dd/MM/yyyy');
  },
};
