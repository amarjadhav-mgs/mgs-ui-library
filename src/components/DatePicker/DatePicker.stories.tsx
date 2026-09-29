import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, DatePicker, FormField, Input, Stack } from '@mgs/ui';
import { column, EXAMPLE_DATE, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

/** A day near the example date, so the stories always show the same month. */
const day = (offset: number) =>
  new Date(EXAMPLE_DATE.getFullYear(), EXAMPLE_DATE.getMonth(), EXAMPLE_DATE.getDate() + offset);

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  // Docs come from DatePicker.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native attributes also work but would flood the table.
    controls: {
      include: [
        'value',
        'defaultValue',
        'withTime',
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
      control: 'date',
      description: 'The date (controlled); `null` when empty. Use with `onChange`.',
      table: { type: { summary: 'Date | null' } },
    },
    defaultValue: {
      control: 'date',
      description: 'The starting date (uncontrolled).',
      table: { type: { summary: 'Date' } },
    },
    withTime: {
      control: 'boolean',
      description: "Also asks for the time, in the locale's format.",
      table: { defaultValue: { summary: 'false' } },
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
      description: 'Shortcuts in the calendar: `{ label, value }`.',
      table: { type: { summary: 'DatePreset[]' } },
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
      description: '`(value: Date | null, event) => void`: the date comes first.',
      table: { category: 'Events' },
    },
    onOpenChange: {
      description: '`(open: boolean) => void`',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A date control gives a number; the field needs a Date. */
const toDate = (value: unknown) =>
  value === undefined || value === null ? undefined : new Date(value as number);

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    withTime: false,
    size: 'md',
    clearable: false,
    loading: false,
    disabled: false,
    readOnly: false,
    required: false,
  },
  render: ({ value, defaultValue, minDate, maxDate, ...args }) => (
    <div style={column}>
      <Field label="Due date">
        {(id) => (
          <DatePicker
            {...args}
            id={id}
            value={value === null ? null : toDate(value)}
            defaultValue={toDate(defaultValue)}
            minDate={toDate(minDate)}
            maxDate={toDate(maxDate)}
          />
        )}
      </Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="due">Due date</label>
<DatePicker id="due" name="due" />`),
  render: () => (
    <div style={column}>
      <Field label="Due date">{(id) => <DatePicker id={id} name="due" />}</Field>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<DatePicker id="start" defaultValue={date} />
<DatePicker id="created" readOnly defaultValue={date} />
<DatePicker id="closed" disabled defaultValue={date} />
<DatePicker id="synced" loading />
<DatePicker id="due" aria-invalid="true" aria-describedby="due-error" />`),
  render: () => (
    <div style={column}>
      <FormField label="Default">
        <DatePicker defaultValue={EXAMPLE_DATE} />
      </FormField>
      <FormField label="Read-only">
        <DatePicker readOnly defaultValue={EXAMPLE_DATE} />
      </FormField>
      <FormField label="Disabled">
        <DatePicker disabled defaultValue={EXAMPLE_DATE} />
      </FormField>
      <FormField label="Loading">
        <DatePicker loading />
      </FormField>
      <FormField label="Invalid" error="Enter the due date">
        <DatePicker />
      </FormField>
    </div>
  ),
};

/** The same heights as Input and Button. */
export const Sizes: Story = {
  parameters: source(`<DatePicker size="sm" aria-label="Small" />
<DatePicker size="md" aria-label="Medium" />
<DatePicker size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <DatePicker size={size} aria-label={`Due date, ${size}`} defaultValue={EXAMPLE_DATE} />
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

/** `withTime` adds the time, in the locale's format. The calendar then has an OK button. */
export const WithTime: Story = {
  name: 'With time',
  parameters: source(`<label htmlFor="follow-up">Follow up on</label>
<DatePicker id="follow-up" withTime />`),
  render: () => (
    <div style={column}>
      <Field label="Follow up on">
        {(id) => <DatePicker id={id} withTime defaultValue={EXAMPLE_DATE} />}
      </Field>
    </div>
  ),
};

/** Days before `minDate` and after `maxDate` are shown, but can't be chosen or typed. */
export const MinAndMax: Story = {
  name: 'Min and max',
  parameters: source(`<DatePicker id="delivery" minDate={today} maxDate={inTwoWeeks} />`),
  render: () => (
    <div style={column}>
      <Field label="Delivery date (in the next two weeks)">
        {(id) => <DatePicker id={id} defaultValue={day(2)} minDate={day(0)} maxDate={day(14)} />}
      </Field>
    </div>
  ),
};

/** `isDateDisabled` disables days by a rule: weekends, holidays. */
export const DisabledDays: Story = {
  name: 'Disabled days',
  parameters: source(`const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

<DatePicker id="meeting" isDateDisabled={isWeekend} />`),
  render: () => (
    <div style={column}>
      <Field label="Meeting date (weekdays)">
        {(id) => <DatePicker id={id} defaultValue={EXAMPLE_DATE} isDateDisabled={isWeekend} />}
      </Field>
    </div>
  ),
};

/** `presets` adds shortcuts to the calendar. `clearable` adds a button that empties the field. */
export const PresetsAndClear: Story = {
  name: 'Presets and clear',
  parameters: source(`<DatePicker
  id="created"
  clearable
  presets={[
    { label: 'Today', value: today },
    { label: 'Yesterday', value: yesterday },
  ]}
/>`),
  render: () => (
    <div style={column}>
      <Field label="Created on">
        {(id) => (
          <DatePicker
            id={id}
            clearable
            defaultValue={EXAMPLE_DATE}
            presets={[
              { label: 'Today', value: day(0) },
              { label: 'Yesterday', value: day(-1) },
            ]}
          />
        )}
      </Field>
    </div>
  ),
};

/** `onChange` receives a `Date`, or `null` when the field is cleared: `onChange={setDue}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [due, setDue] = useState<Date | null>(null);

<DatePicker id="due" value={due} onChange={setDue} clearable />`),
  render: function Render() {
    const [due, setDue] = useState<Date | null>(EXAMPLE_DATE);
    return (
      <div style={column}>
        <Field label="Due date">
          {(id) => <DatePicker id={id} value={due} onChange={setDue} clearable />}
        </Field>
        <output style={{ fontSize: 14 }}>Value: {due ? due.toDateString() : 'null'}</output>
        <div>
          <Button size="sm" onClick={() => setDue(day(7))}>
            One week later
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'One week later' }));
    await expect(canvas.getByLabelText('Due date')).toHaveValue('01/10/2026');
    await expect(canvas.getByText('Value: Thu Oct 01 2026')).toBeInTheDocument();
  },
};

/**
 * A start and an end date that depend on each other: the end can't be before the start, and moving the start past
 * the end empties the end. With `FormField`, labels and errors are connected without any `id`.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [start, setStart] = useState<Date | null>(null);
const [end, setEnd] = useState<Date | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(end === null ? 'Enter the expected completion date' : '');
}}>
  <Stack gap="lg">
    <FormField label="Start date">
      <DatePicker
        name="start"
        value={start}
        onChange={(next) => {
          setStart(next);
          if (next && end && end < next) setEnd(null);
        }}
      />
    </FormField>
    <FormField label="Expected completion" error={error} required>
      <DatePicker name="end" value={end} onChange={setEnd} minDate={start ?? undefined} />
    </FormField>
    <Button type="submit" variant="primary">Save project</Button>
  </Stack>
</form>`),
  render: function Render() {
    const [start, setStart] = useState<Date | null>(EXAMPLE_DATE);
    const [end, setEnd] = useState<Date | null>(null);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Project"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(end === null ? 'Enter the expected completion date' : '');
        }}
      >
        <Stack gap="lg">
          <FormField label="Start date">
            <DatePicker
              name="start"
              value={start}
              onChange={(next) => {
                setStart(next);
                if (next && end && end < next) setEnd(null);
              }}
            />
          </FormField>
          <FormField label="Expected completion" error={error} required>
            <DatePicker name="end" value={end} onChange={setEnd} minDate={start ?? undefined} />
          </FormField>
          <Stack align="start">
            <Button type="submit" variant="primary">
              Save project
            </Button>
          </Stack>
        </Stack>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const end = canvas.getByRole('textbox', { name: /Expected completion/ });
    await userEvent.click(canvas.getByRole('button', { name: 'Save project' }));
    await expect(end).toHaveAttribute('aria-invalid', 'true');
    await expect(end).toHaveAccessibleDescription('Enter the expected completion date');
    await expect(end).toHaveAttribute('aria-required', 'true');
  },
};

/** The label names the field. Everything can be typed; Enter opens the calendar and Esc closes it. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="birthday">Date of birth</label>
<DatePicker id="birthday" />`),
  render: () => (
    <div style={column}>
      <Field label="Date of birth">{(id) => <DatePicker id={id} />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Date of birth' });
    await expect(input).toHaveAttribute('placeholder', 'dd/MM/yyyy');
    await expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    // Focus alone doesn't open the calendar: the date can be typed.
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    // A click opens it. The calendar is a dialog, rendered at the end of the page.
    await userEvent.click(input);
    await expect(await page.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveFocus();
  },
};
