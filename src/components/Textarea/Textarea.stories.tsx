import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Textarea } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  // Docs come from Textarea.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    controls: {
      include: [
        'size',
        'rows',
        'autosize',
        'minRows',
        'maxRows',
        'value',
        'defaultValue',
        'placeholder',
        'disabled',
        'readOnly',
      ],
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    rows: {
      control: { type: 'number', min: 1 },
      description: 'Visible lines when `autosize` is off. Users can drag the height.',
      table: { defaultValue: { summary: '3' } },
    },
    autosize: {
      control: 'boolean',
      description: 'Grow and shrink with the text, between `minRows` and `maxRows`.',
      table: { defaultValue: { summary: 'false' } },
    },
    minRows: {
      control: { type: 'number', min: 1 },
      description: 'Smallest height with `autosize`.',
    },
    maxRows: {
      control: { type: 'number', min: 1 },
      description: 'Largest height with `autosize`; longer text scrolls.',
    },
    value: { control: 'text', description: 'The value (controlled). Use with `onChange`.' },
    defaultValue: { control: 'text', description: 'The starting value (uncontrolled).' },
    placeholder: { control: 'text', description: 'An example value. Not a label.' },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or edited; not submitted with a form.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and copyable, not editable; submitted with a form.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(value: string, event) => void`: the value comes first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: { size: 'md', rows: 3, autosize: false, disabled: false, readOnly: false },
  render: (args) => (
    <div style={column}>
      <Field label="Notes">{(id) => <Textarea {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="notes">Notes</label>
<Textarea id="notes" name="notes" />`),
  render: () => (
    <div style={column}>
      <Field label="Notes">{(id) => <Textarea id={id} name="notes" />}</Field>
    </div>
  ),
};

export const States: Story = {
  parameters: source(`<Textarea id="notes" defaultValue="Deliver after 10 am." />
<Textarea id="terms" readOnly defaultValue="Payment due in 30 days." />
<Textarea id="reason" disabled />
<Textarea id="comment" aria-invalid="true" aria-describedby="comment-error" />`),
  render: () => (
    <div style={column}>
      <Field label="Default">
        {(id) => <Textarea id={id} defaultValue="Deliver after 10 am." />}
      </Field>
      <Field label="Read-only">
        {(id) => <Textarea id={id} readOnly defaultValue="Payment due in 30 days." />}
      </Field>
      <Field label="Disabled">{(id) => <Textarea id={id} disabled />}</Field>
      <Field label="Invalid">
        {(id) => (
          <>
            <Textarea id={id} aria-invalid="true" aria-describedby={`${id}-error`} />
            <p id={`${id}-error`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              Enter a reason for the change.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Textarea size="sm" aria-label="Small" />
<Textarea size="md" aria-label="Medium" />
<Textarea size="lg" aria-label="Large" />`),
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <Textarea
          key={size}
          size={size}
          rows={2}
          aria-label={`Size ${size}`}
          placeholder={`size="${size}"`}
        />
      ))}
    </div>
  ),
};

/** Type several lines: the field grows from 2 to 6 lines, then scrolls. */
export const Autosize: Story = {
  parameters: source(`<Textarea id="comment" autosize minRows={2} maxRows={6} />`),
  render: () => (
    <div style={column}>
      <Field label="Comment">{(id) => <Textarea id={id} autosize minRows={2} maxRows={6} />}</Field>
    </div>
  ),
};

/**
 * An approval comment with a character count linked to the field, and a read-only note from the requester. Edge case:
 * pasting more than `maxLength` characters is cut at the limit by the browser.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [comment, setComment] = useState('');

<label htmlFor="request">Request</label>
<Textarea id="request" readOnly defaultValue="Please approve the order for 12 laptops." />

<label htmlFor="comment">Approval comment</label>
<Textarea
  id="comment"
  autosize
  minRows={3}
  maxRows={8}
  maxLength={500}
  value={comment}
  onChange={setComment}
  aria-describedby="comment-count"
/>
<p id="comment-count">{comment.length} / 500 characters</p>`),
  render: function Render() {
    const [comment, setComment] = useState('');
    return (
      <div style={{ ...column, maxWidth: 420 }}>
        <Field label="Request">
          {(id) => (
            <Textarea id={id} readOnly defaultValue="Please approve the order for 12 laptops." />
          )}
        </Field>
        <Field label="Approval comment">
          {(id) => (
            <>
              <Textarea
                id={id}
                autosize
                minRows={3}
                maxRows={8}
                maxLength={500}
                value={comment}
                onChange={setComment}
                aria-describedby={`${id}-count`}
              />
              <p id={`${id}-count`} style={{ margin: '4px 0 0', fontSize: 13 }}>
                {comment.length} / 500 characters
              </p>
            </>
          )}
        </Field>
        <div>
          <Button variant="primary">Approve</Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const comment = canvas.getByLabelText('Approval comment');
    await userEvent.type(comment, 'Approved');
    await expect(comment).toHaveAccessibleDescription('8 / 500 characters');
  },
};

/** Tab reaches the field; Enter adds a new line instead of submitting the form. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="notes">Notes</label>
<Textarea id="notes" />`),
  render: () => (
    <div style={column}>
      <Field label="Notes">{(id) => <Textarea id={id} />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const notes = canvas.getByRole('textbox', { name: 'Notes' });
    await expect(notes).toHaveFocus();
    await userEvent.keyboard('Line one{Enter}Line two');
    await expect(notes).toHaveValue('Line one\nLine two');
  },
};
