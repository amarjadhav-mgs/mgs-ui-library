import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  Button,
  type DateRange,
  DateRangePicker,
  dateRangePresets,
  FormField,
  Input,
  Stack,
} from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

/** A day near the example date, so the stories always show the same month. */
const day = (offset: number) =>
  new Date(EXAMPLE_DATE.getFullYear(), EXAMPLE_DATE.getMonth(), EXAMPLE_DATE.getDate() + offset);

const EXAMPLE_RANGE: DateRange = [day(-6), day(0)];

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  // Docs come from DateRangePicker.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native attributes also work but would flood the table.
    controls: {
      include: [
        'minDate',
        'maxDate',
        'placeholder',
        'size',
        'clearable',
        'loading',
        'disabled',
        'readOnly',
        'required',
        'name',
      ],
    },
  },
  argTypes: {
    value: {
      control: false,
      description: 'The range (controlled); `null` when empty. Use with `onChange`.',
      table: { type: { summary: '[Date, Date] | null' } },
    },
    defaultValue: {
      control: false,
      description: 'The starting range (uncontrolled).',
      table: { type: { summary: '[Date, Date]' } },
    },
    minDate: {
      control: 'date',
      description: 'The first day that can be chosen.',
      table: { type: { summary: 'Date' } },
    },
    maxDate: {
      control: 'date',
      description: 'The last day that can be chosen.',
      table: { type: { summary: 'Date' } },
    },
    isDateDisabled: {
      control: false,
      description: 'Disables more days: weekends, holidays.',
      table: { type: { summary: '(date: Date) => boolean' } },
    },
    presets: {
      control: false,
      description:
        'Shortcuts in the calendar: `{ label, value }`. `dateRangePresets()` gives the usual ones.',
      table: { type: { summary: 'DateRangePreset[]' } },
    },
    placeholder: { control: 'text', description: 'Shown while empty. Not a label.' },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input and Button.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    clearable: {
      control: 'boolean',
      description: 'A button in the field that removes the value.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Busy: the value is being loaded.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or changed; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and copyable, not changeable; submitted with a form.',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'The field must have a value: said to screen readers.',
      table: { defaultValue: { summary: 'false' } },
    },
    name: { control: 'text', description: 'The `name` a form submits the value with.' },
    onChange: {
      description: '`(value: [Date, Date] | null, event) => void`: the range comes first.',
      table: { category: 'Events' },
    },
    onOpenChange: {
      description: '`(open: boolean) => void`',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A date control gives a number; the field needs a Date. */
const toDate = (value: unknown) =>
  value === undefined || value === null ? undefined : new Date(value as number);

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    size: 'md',
    clearable: false,
    loading: false,
    disabled: false,
    readOnly: false,
    required: false,
  },
  render: ({ minDate, maxDate, ...args }) => (
    <div style={column}>
      <Field label="Period">
        {(id) => (
          <DateRangePicker {...args} id={id} minDate={toDate(minDate)} maxDate={toDate(maxDate)} />
        )}
      </Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="period">Period</label>
<DateRangePicker id="period" name="period" />`),
  render: () => (
    <div style={column}>
      <Field label="Period">{(id) => <DateRangePicker id={id} name="period" />}</Field>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<DateRangePicker id="period" defaultValue={range} />
<DateRangePicker id="billed" readOnly defaultValue={range} />
<DateRangePicker id="closed" disabled defaultValue={range} />
<DateRangePicker id="synced" loading />
<DateRangePicker id="leave" aria-invalid="true" aria-describedby="leave-error" />`),
  render: () => (
    <div style={column}>
      <FormField label="Default">
        <DateRangePicker defaultValue={EXAMPLE_RANGE} />
      </FormField>
      <FormField label="Read-only">
        <DateRangePicker readOnly defaultValue={EXAMPLE_RANGE} />
      </FormField>
      <FormField label="Disabled">
        <DateRangePicker disabled defaultValue={EXAMPLE_RANGE} />
      </FormField>
      <FormField label="Loading">
        <DateRangePicker loading />
      </FormField>
      <FormField label="Invalid" error="Enter the days of your leave">
        <DateRangePicker />
      </FormField>
    </div>
  ),
};

/** The same heights as Input and Button. */
export const Sizes: Story = {
  parameters: source(`<DateRangePicker size="sm" aria-label="Small" />
<DateRangePicker size="md" aria-label="Medium" />
<DateRangePicker size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1.4 }}>
            <DateRangePicker
              size={size}
              aria-label={`Period, ${size}`}
              defaultValue={EXAMPLE_RANGE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input size={size} aria-label={`Reference, ${size}`} placeholder="Reference" />
          </div>
          <Button size={size}>Filter</Button>
        </div>
      ))}
    </div>
  ),
};

/** `dateRangePresets()` gives the usual shortcuts of a report. `clearable` adds a button that empties the field. */
export const PresetsAndClear: Story = {
  name: 'Presets and clear',
  parameters: source(`import { DateRangePicker, dateRangePresets } from '@mgs/ui';

<DateRangePicker id="period" clearable presets={dateRangePresets()} />`),
  render: () => (
    <div style={column}>
      <Field label="Period">
        {(id) => (
          <DateRangePicker
            id={id}
            clearable
            defaultValue={EXAMPLE_RANGE}
            presets={dateRangePresets(EXAMPLE_DATE)}
          />
        )}
      </Field>
    </div>
  ),
};

/** Your own shortcuts: a label and a range. */
export const CustomPresets: Story = {
  name: 'Custom presets',
  parameters: source(`<DateRangePicker
  id="quarter"
  presets={[
    { label: 'Q1 (Apr to Jun)', value: [new Date(2026, 3, 1), new Date(2026, 5, 30)] },
    { label: 'Q2 (Jul to Sep)', value: [new Date(2026, 6, 1), new Date(2026, 8, 30)] },
  ]}
/>`),
  render: () => (
    <div style={column}>
      <Field label="Quarter">
        {(id) => (
          <DateRangePicker
            id={id}
            presets={[
              { label: 'Q1 (Apr to Jun)', value: [new Date(2026, 3, 1), new Date(2026, 5, 30)] },
              { label: 'Q2 (Jul to Sep)', value: [new Date(2026, 6, 1), new Date(2026, 8, 30)] },
            ]}
          />
        )}
      </Field>
    </div>
  ),
};

/** Days before `minDate` and after `maxDate` are shown, but can't be chosen. `isDateDisabled` disables days by a rule. */
export const MinAndMax: Story = {
  name: 'Min, max and disabled days',
  parameters: source(`const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

<DateRangePicker id="leave" minDate={today} maxDate={inThreeWeeks} isDateDisabled={isWeekend} />`),
  render: () => (
    <div style={column}>
      <Field label="Leave (weekdays, in the next three weeks)">
        {(id) => (
          <DateRangePicker
            id={id}
            defaultValue={[day(0), day(1)]}
            minDate={day(0)}
            maxDate={day(21)}
            isDateDisabled={isWeekend}
          />
        )}
      </Field>
    </div>
  ),
};

/** `onChange` receives `[start, end]`, or `null` when the field is cleared: `onChange={setPeriod}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [period, setPeriod] = useState<DateRange | null>(null);

<DateRangePicker id="period" value={period} onChange={setPeriod} clearable />`),
  render: function Render() {
    const [period, setPeriod] = useState<DateRange | null>(EXAMPLE_RANGE);
    return (
      <div style={column}>
        <Field label="Period">
          {(id) => <DateRangePicker id={id} value={period} onChange={setPeriod} clearable />}
        </Field>
        <output style={{ fontSize: 14 }}>
          Value: {period ? `${period[0].toDateString()} to ${period[1].toDateString()}` : 'null'}
        </output>
        <div>
          <Button size="sm" onClick={() => setPeriod([day(1), day(7)])}>
            The week after
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'The week after' }));
    await expect(canvas.getByLabelText('Period')).toHaveValue('25/09/2026 – 01/10/2026');
    await expect(canvas.getByText('Value: Fri Sep 25 2026 to Thu Oct 01 2026')).toBeInTheDocument();
  },
};

/** A report filter: a period with the usual shortcuts, which can't be empty and can't reach into the future. */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [period, setPeriod] = useState<DateRange | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(period === null ? 'Choose the period of the report' : '');
}}>
  <Stack gap="lg">
    <FormField label="Period" error={error} required help="Up to today.">
      <DateRangePicker
        name="period"
        value={period}
        onChange={setPeriod}
        maxDate={new Date()}
        presets={dateRangePresets()}
        clearable
      />
    </FormField>
    <Button type="submit" variant="primary">Show report</Button>
  </Stack>
</form>`),
  render: function Render() {
    const [period, setPeriod] = useState<DateRange | null>(null);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Report"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(period === null ? 'Choose the period of the report' : '');
        }}
      >
        <Stack gap="lg">
          <FormField label="Period" error={error} required help="Up to today.">
            <DateRangePicker
              name="period"
              value={period}
              onChange={setPeriod}
              maxDate={EXAMPLE_DATE}
              presets={dateRangePresets(EXAMPLE_DATE)}
              clearable
            />
          </FormField>
          <Stack align="start">
            <Button type="submit" variant="primary">
              Show report
            </Button>
          </Stack>
        </Stack>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const period = canvas.getByRole('textbox', { name: /Period/ });
    await userEvent.click(canvas.getByRole('button', { name: 'Show report' }));
    await expect(period).toHaveAttribute('aria-invalid', 'true');
    await expect(period).toHaveAccessibleDescription(/Choose the period of the report/);
    await expect(period).toHaveAttribute('aria-required', 'true');
  },
};

/** The label names the field. Everything can be typed; Enter opens the calendars and Esc closes them. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="stay">Stay</label>
<DateRangePicker id="stay" />`),
  render: () => (
    <div style={column}>
      <Field label="Stay">{(id) => <DateRangePicker id={id} />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Stay' });
    await expect(input).toHaveAttribute('placeholder', 'dd/MM/yyyy – dd/MM/yyyy');
    // Focus alone doesn't open the calendars: the range can be typed.
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    // A click opens them. The calendars are a dialog, rendered at the end of the page.
    await userEvent.click(input);
    await expect(await page.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveFocus();
  },
};
