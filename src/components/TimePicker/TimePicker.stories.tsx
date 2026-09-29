import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, FormField, Input, Stack, TimePicker } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  // Docs come from TimePicker.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native attributes also work but would flood the table.
    controls: {
      include: [
        'value',
        'defaultValue',
        'minuteStep',
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
      control: 'text',
      description: "The time (controlled), as 24-hour text: `'14:30'`; `null` when empty.",
      table: { type: { summary: 'string | null' } },
    },
    defaultValue: {
      control: 'text',
      description: "The starting time (uncontrolled): `'09:00'`.",
      table: { type: { summary: 'string' } },
    },
    minuteStep: {
      control: 'number',
      description: 'The minutes offered in the list: `15` offers 00, 15, 30 and 45.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } },
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
      description: '`(value: string | null, event) => void`: the time comes first.',
      table: { category: 'Events' },
    },
    onOpenChange: {
      description: '`(open: boolean) => void`',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    minuteStep: 1,
    size: 'md',
    clearable: false,
    loading: false,
    disabled: false,
    readOnly: false,
    required: false,
  },
  render: ({ value, defaultValue, ...args }) => (
    <div style={column}>
      <Field label="Start time">
        {(id) => (
          <TimePicker
            {...args}
            id={id}
            // An emptied text control gives '': no value.
            value={value === '' ? undefined : value}
            defaultValue={defaultValue === '' ? undefined : defaultValue}
          />
        )}
      </Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="start">Start time</label>
<TimePicker id="start" name="start" />`),
  render: () => (
    <div style={column}>
      <Field label="Start time">{(id) => <TimePicker id={id} name="start" />}</Field>
    </div>
  ),
};

/** `disabled` and `readOnly` look alike but behave differently: see the table in the docs. */
export const States: Story = {
  parameters: source(`<TimePicker id="start" defaultValue="09:00" />
<TimePicker id="opened" readOnly defaultValue="09:00" />
<TimePicker id="closed" disabled defaultValue="09:00" />
<TimePicker id="synced" loading />
<TimePicker id="pickup" aria-invalid="true" aria-describedby="pickup-error" />`),
  render: () => (
    <div style={column}>
      <FormField label="Default">
        <TimePicker defaultValue="09:00" />
      </FormField>
      <FormField label="Read-only">
        <TimePicker readOnly defaultValue="09:00" />
      </FormField>
      <FormField label="Disabled">
        <TimePicker disabled defaultValue="09:00" />
      </FormField>
      <FormField label="Loading">
        <TimePicker loading />
      </FormField>
      <FormField label="Invalid" error="Enter the pickup time">
        <TimePicker />
      </FormField>
    </div>
  ),
};

/** The same heights as Input and Button. */
export const Sizes: Story = {
  parameters: source(`<TimePicker size="sm" aria-label="Small" />
<TimePicker size="md" aria-label="Medium" />
<TimePicker size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TimePicker size={size} aria-label={`Start time, ${size}`} defaultValue="09:00" />
          </div>
          <div style={{ flex: 1 }}>
            <Input size={size} aria-label={`Room, ${size}`} placeholder="Room" />
          </div>
          <Button size={size}>Book</Button>
        </div>
      ))}
    </div>
  ),
};

/** `minuteStep={15}` offers 00, 15, 30 and 45 in the list. `clearable` adds a button that empties the field. */
export const MinuteStep: Story = {
  name: 'Minute step and clear',
  parameters: source(`<TimePicker id="meeting" minuteStep={15} clearable />`),
  render: () => (
    <div style={column}>
      <Field label="Meeting starts at">
        {(id) => <TimePicker id={id} defaultValue="10:30" minuteStep={15} clearable />}
      </Field>
    </div>
  ),
};

/** `onChange` receives 24-hour text, or `null` when the field is cleared: `onChange={setStart}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [start, setStart] = useState<string | null>('09:00');

<TimePicker id="start" value={start} onChange={setStart} clearable />`),
  render: function Render() {
    const [start, setStart] = useState<string | null>('09:00');
    return (
      <div style={column}>
        <Field label="Start time">
          {(id) => <TimePicker id={id} value={start} onChange={setStart} clearable />}
        </Field>
        <output style={{ fontSize: 14 }}>Value: {start ?? 'null'}</output>
        <div>
          <Button size="sm" onClick={() => setStart('14:30')}>
            Half past two
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Half past two' }));
    await expect(canvas.getByLabelText('Start time')).toHaveValue('14:30');
    await expect(canvas.getByText('Value: 14:30')).toBeInTheDocument();
  },
};

/** Opening hours: two times, where the second must be after the first. 24-hour text compares like text. */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [opens, setOpens] = useState<string | null>('09:00');
const [closes, setCloses] = useState<string | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  if (closes === null) setError('Enter the closing time');
  else if (opens !== null && closes <= opens) setError('The closing time must be after the opening time');
  else setError('');
}}>
  <Stack gap="lg">
    <FormField label="Opens at">
      <TimePicker name="opens" value={opens} onChange={setOpens} minuteStep={30} />
    </FormField>
    <FormField label="Closes at" error={error} required>
      <TimePicker name="closes" value={closes} onChange={setCloses} minuteStep={30} />
    </FormField>
    <Button type="submit" variant="primary">Save hours</Button>
  </Stack>
</form>`),
  render: function Render() {
    const [opens, setOpens] = useState<string | null>('09:00');
    const [closes, setCloses] = useState<string | null>(null);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Opening hours"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          if (closes === null) setError('Enter the closing time');
          else if (opens !== null && closes <= opens)
            setError('The closing time must be after the opening time');
          else setError('');
        }}
      >
        <Stack gap="lg">
          <FormField label="Opens at">
            <TimePicker name="opens" value={opens} onChange={setOpens} minuteStep={30} />
          </FormField>
          <FormField label="Closes at" error={error} required>
            <TimePicker name="closes" value={closes} onChange={setCloses} minuteStep={30} />
          </FormField>
          <Stack align="start">
            <Button type="submit" variant="primary">
              Save hours
            </Button>
          </Stack>
        </Stack>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closes = canvas.getByRole('textbox', { name: /Closes at/ });
    await userEvent.click(canvas.getByRole('button', { name: 'Save hours' }));
    await expect(closes).toHaveAttribute('aria-invalid', 'true');
    await expect(closes).toHaveAccessibleDescription('Enter the closing time');
    await expect(closes).toHaveAttribute('aria-required', 'true');
  },
};

/** The label names the field. Everything can be typed; Enter opens the lists and Esc closes them. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="alarm">Alarm</label>
<TimePicker id="alarm" />`),
  render: () => (
    <div style={column}>
      <Field label="Alarm">{(id) => <TimePicker id={id} />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Alarm' });
    await expect(input).toHaveAttribute('placeholder', 'HH:mm');
    // Focus alone doesn't open the lists: the time can be typed.
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    // A click opens them. The lists are a dialog, rendered at the end of the page.
    await userEvent.click(input);
    await expect(await page.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveFocus();
  },
};
