import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Radio, RadioGroup, WarningIcon } from '@mgs/ui';
import { column, labelStyle, source } from '../../stories/shared';

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const heading = { ...labelStyle, margin: '0 0 4px' } as const;

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  // Docs come from RadioGroup.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    // Only the MGS API; native <div> attributes also work but would flood the table.
    controls: {
      include: ['value', 'defaultValue', 'orientation', 'disabled', 'name', 'required'],
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description:
        'The value of the selected radio (controlled); `null` when none is selected. Use with `onChange`.',
      table: { type: { summary: 'string | null' } },
    },
    defaultValue: {
      control: 'text',
      description: 'The value selected at the start (uncontrolled).',
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Radios under each other, or next to each other.',
      table: {
        type: { summary: "'vertical' | 'horizontal'" },
        defaultValue: { summary: "'vertical'" },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every radio in the group.',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'The `name` a form submits the selected value with. Set it in forms.',
    },
    required: {
      control: 'boolean',
      description: 'One of the radios must be selected before the form can be submitted.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: "`(value: string, event) => void`: the selected radio's value comes first.",
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    defaultValue: 'standard',
    orientation: 'vertical',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <div>
      <p id="playground-delivery" style={heading}>
        Delivery
      </p>
      <RadioGroup {...args} aria-labelledby="playground-delivery">
        <Radio value="standard">Standard (3 to 5 days)</Radio>
        <Radio value="express">Express (next day)</Radio>
        <Radio value="pickup">Pick up at the store</Radio>
      </RadioGroup>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<p id="delivery">Delivery</p>
<RadioGroup aria-labelledby="delivery" name="delivery" defaultValue="standard">
  <Radio value="standard">Standard (3 to 5 days)</Radio>
  <Radio value="express">Express (next day)</Radio>
  <Radio value="pickup">Pick up at the store</Radio>
</RadioGroup>`),
  render: () => (
    <div>
      <p id="basic-delivery" style={heading}>
        Delivery
      </p>
      <RadioGroup aria-labelledby="basic-delivery" name="delivery" defaultValue="standard">
        <Radio value="standard">Standard (3 to 5 days)</Radio>
        <Radio value="express">Express (next day)</Radio>
        <Radio value="pickup">Pick up at the store</Radio>
      </RadioGroup>
    </div>
  ),
};

/** Disable the whole group or single radios. Invalid isn't a prop: set `aria-invalid="true"` on the group. */
export const States: Story = {
  parameters: source(`<RadioGroup aria-labelledby="all" disabled defaultValue="standard">
  <Radio value="standard">Standard</Radio>
  <Radio value="express">Express</Radio>
</RadioGroup>

<RadioGroup aria-labelledby="one" defaultValue="standard">
  <Radio value="standard">Standard</Radio>
  <Radio value="express" disabled>Express (not available for this address)</Radio>
</RadioGroup>

<RadioGroup aria-labelledby="invalid" aria-invalid="true" aria-describedby="delivery-error">
  <Radio value="standard">Standard</Radio>
  <Radio value="express">Express</Radio>
</RadioGroup>
<p id="delivery-error">Choose a delivery option</p>`),
  render: () => (
    <div style={column}>
      <div>
        <p id="states-all" style={heading}>
          Disabled group
        </p>
        <RadioGroup aria-labelledby="states-all" disabled defaultValue="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </div>
      <div>
        <p id="states-one" style={heading}>
          One disabled radio
        </p>
        <RadioGroup aria-labelledby="states-one" defaultValue="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express" disabled>
            Express (not available for this address)
          </Radio>
        </RadioGroup>
      </div>
      <div>
        <p id="states-invalid" style={heading}>
          Invalid
        </p>
        <RadioGroup
          aria-labelledby="states-invalid"
          aria-invalid="true"
          aria-describedby="states-delivery-error"
        >
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
        <p id="states-delivery-error" style={errorText}>
          <WarningIcon /> Choose a delivery option
        </p>
      </div>
    </div>
  ),
};

/** Next to each other, for a few short options. A row that is full wraps onto the next line. */
export const Horizontal: Story = {
  parameters:
    source(`<RadioGroup aria-labelledby="priority" orientation="horizontal" defaultValue="normal">
  <Radio value="low">Low</Radio>
  <Radio value="normal">Normal</Radio>
  <Radio value="high">High</Radio>
  <Radio value="urgent">Urgent</Radio>
</RadioGroup>`),
  render: () => (
    <div>
      <p id="horizontal-priority" style={heading}>
        Priority
      </p>
      <RadioGroup
        aria-labelledby="horizontal-priority"
        orientation="horizontal"
        defaultValue="normal"
      >
        {priorities.map((priority) => (
          <Radio key={priority.value} value={priority.value}>
            {priority.label}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  ),
};

/** `onChange` receives the value first: `onChange={setDelivery}` works directly. */
export const Controlled: Story = {
  parameters: source(`const [delivery, setDelivery] = useState('standard');

<RadioGroup aria-labelledby="delivery" value={delivery} onChange={setDelivery}>
  <Radio value="standard">Standard</Radio>
  <Radio value="express">Express</Radio>
  <Radio value="pickup">Pick up at the store</Radio>
</RadioGroup>`),
  render: function Render() {
    const [delivery, setDelivery] = useState('standard');
    return (
      <div style={column}>
        <div>
          <p id="controlled-delivery" style={heading}>
            Delivery
          </p>
          <RadioGroup aria-labelledby="controlled-delivery" value={delivery} onChange={setDelivery}>
            <Radio value="standard">Standard</Radio>
            <Radio value="express">Express</Radio>
            <Radio value="pickup">Pick up at the store</Radio>
          </RadioGroup>
        </div>
        <output style={{ fontSize: 14 }}>Selected: {delivery}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Express' }));
    await expect(canvas.getByText('Selected: express')).toBeInTheDocument();
    await expect(canvas.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
  },
};

/**
 * A question the user hasn't answered yet starts with `null`. A radio can't be unselected by clicking it again, so
 * give the user another way to clear the answer when it is optional.
 */
export const NothingSelected: Story = {
  name: 'Nothing selected',
  parameters: source(`const [rating, setRating] = useState<string | null>(null);

<RadioGroup aria-labelledby="rating" orientation="horizontal" value={rating} onChange={setRating}>
  <Radio value="good">Good</Radio>
  <Radio value="ok">OK</Radio>
  <Radio value="bad">Bad</Radio>
</RadioGroup>
<Button variant="link" onClick={() => setRating(null)}>
  Clear answer
</Button>`),
  render: function Render() {
    const [rating, setRating] = useState<string | null>(null);
    return (
      <div style={column}>
        <div>
          <p id="nothing-rating" style={heading}>
            How was the delivery? (optional)
          </p>
          <RadioGroup
            aria-labelledby="nothing-rating"
            orientation="horizontal"
            value={rating}
            onChange={setRating}
          >
            <Radio value="good">Good</Radio>
            <Radio value="ok">OK</Radio>
            <Radio value="bad">Bad</Radio>
          </RadioGroup>
        </div>
        <div>
          {/* Never disabled: a button that disables itself when pressed leaves keyboard focus on nothing. */}
          <Button variant="link" onClick={() => setRating(null)}>
            Clear answer
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const good = canvas.getByRole('radio', { name: 'Good' });
    await expect(good).not.toBeChecked();
    await userEvent.click(good);
    await expect(good).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear answer' }));
    await expect(good).not.toBeChecked();
  },
};

/**
 * A form with a required choice: options from an array, validation on submit, the error linked to the group with
 * `aria-describedby`, and `aria-invalid` for the red borders.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [priority, setPriority] = useState<string | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(priority === null ? 'Choose a priority' : '');
}}>
  <p id="priority">Priority</p>
  <RadioGroup
    aria-labelledby="priority"
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'priority-error' : undefined}
    name="priority"
    required
    value={priority}
    onChange={setPriority}
  >
    {priorities.map((priority) => (
      <Radio key={priority.value} value={priority.value}>{priority.label}</Radio>
    ))}
  </RadioGroup>
  {error && <p id="priority-error">{error}</p>}

  <Button type="submit" variant="primary">Create task</Button>
</form>`),
  render: function Render() {
    const [priority, setPriority] = useState<string | null>(null);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Task"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(priority === null ? 'Choose a priority' : '');
        }}
      >
        <div>
          <p id="advanced-priority" style={heading}>
            Priority
          </p>
          <RadioGroup
            aria-labelledby="advanced-priority"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'advanced-priority-error' : undefined}
            name="priority"
            required
            value={priority}
            onChange={setPriority}
          >
            {priorities.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
          {error && (
            <p id="advanced-priority-error" style={errorText}>
              <WarningIcon /> {error}
            </p>
          )}
        </div>
        <div>
          <Button type="submit" variant="primary">
            Create task
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Priority' });
    const submit = canvas.getByRole('button', { name: 'Create task' });
    await userEvent.click(submit);
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(group).toHaveAccessibleDescription('Choose a priority');
    await userEvent.click(canvas.getByRole('radio', { name: 'High' }));
    await userEvent.click(submit);
    await expect(group).not.toHaveAttribute('aria-invalid');
  },
};

/** Tab moves into the group, to the selected radio; the arrow keys move between the radios and select them. */
export const Accessibility: Story = {
  parameters: source(`<p id="delivery">Delivery</p>
<RadioGroup aria-labelledby="delivery" defaultValue="standard">
  <Radio value="standard">Standard</Radio>
  <Radio value="express">Express</Radio>
  <Radio value="pickup">Pick up at the store</Radio>
</RadioGroup>`),
  render: () => (
    <div>
      <p id="accessibility-delivery" style={heading}>
        Delivery
      </p>
      <RadioGroup aria-labelledby="accessibility-delivery" defaultValue="standard">
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
        <Radio value="pickup">Pick up at the store</Radio>
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Delivery' });
    const standard = within(group).getByRole('radio', { name: 'Standard' });
    const express = within(group).getByRole('radio', { name: 'Express' });
    await userEvent.tab();
    await expect(standard).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(express).toHaveFocus();
    await expect(express).toBeChecked();
    await expect(standard).not.toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(standard).toBeChecked();
  },
};
