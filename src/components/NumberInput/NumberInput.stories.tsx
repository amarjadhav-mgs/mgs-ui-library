import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, MgsProvider, type MgsTheme, NumberInput } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  // Docs come from NumberInput.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    controls: {
      include: [
        'min',
        'max',
        'step',
        'decimals',
        'grouping',
        'prefix',
        'suffix',
        'controls',
        'size',
        'disabled',
        'readOnly',
      ],
    },
  },
  argTypes: {
    min: {
      control: 'number',
      description: 'Smallest value; a smaller one becomes this on leaving the field.',
    },
    max: {
      control: 'number',
      description: 'Largest value; a larger one becomes this on leaving the field.',
    },
    step: {
      control: 'number',
      description: 'How much ↑ ↓ and the step buttons change the value (Page Up / Down: 10 steps).',
      table: { defaultValue: { summary: '1' } },
    },
    decimals: {
      control: { type: 'number', min: 0, max: 6 },
      description:
        'Decimal places: rounded and shown on leaving the field. `0`: whole numbers only.',
    },
    grouping: {
      control: 'boolean',
      description: 'Thousands separators while not focused.',
      table: { defaultValue: { summary: 'true' } },
    },
    prefix: {
      control: 'text',
      description: 'Text or an icon before the number, inside the field.',
    },
    suffix: { control: 'text', description: 'Text or an icon after the number, inside the field.' },
    controls: {
      control: 'boolean',
      description: 'The − + step buttons (mouse); ↑ ↓ always work.',
      table: { defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input and Button.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or edited.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable and copyable, not editable; no step buttons.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(value: number | null, event) => void`: a number, or `null` when emptied.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel; type, use ↑ ↓, and leave the field to see rounding and limits. */
export const Playground: Story = {
  args: {
    min: 0,
    max: 1000000,
    step: 1,
    decimals: 2,
    grouping: true,
    prefix: '₹',
    controls: true,
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={column}>
      <Field label="Amount (₹)">
        {(id) => <NumberInput {...args} id={id} defaultValue={54999} />}
      </Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`const [quantity, setQuantity] = useState<number | null>(1);

<label htmlFor="quantity">Quantity</label>
<NumberInput id="quantity" min={1} decimals={0} value={quantity} onChange={setQuantity} />`),
  render: function Render() {
    const [quantity, setQuantity] = useState<number | null>(1);
    return (
      <div style={column}>
        <Field label="Quantity">
          {(id) => (
            <NumberInput id={id} min={1} decimals={0} value={quantity} onChange={setQuantity} />
          )}
        </Field>
        <output style={{ fontSize: 14 }}>
          Value: {quantity === null ? 'null' : `${quantity} (${typeof quantity})`}
        </output>
      </div>
    );
  },
};

export const States: Story = {
  parameters: source(`<NumberInput id="stock" readOnly defaultValue={1250} suffix="units" />
<NumberInput id="limit" disabled defaultValue={50000} prefix="₹" />
<NumberInput id="discount" suffix="%" aria-invalid="true" aria-describedby="discount-error" />`),
  render: () => (
    <div style={column}>
      <Field label="Default">{(id) => <NumberInput id={id} defaultValue={12} suffix="kg" />}</Field>
      <Field label="Read-only">
        {(id) => <NumberInput id={id} readOnly defaultValue={1250} suffix="units" />}
      </Field>
      <Field label="Disabled">
        {(id) => <NumberInput id={id} disabled defaultValue={50000} prefix="₹" decimals={2} />}
      </Field>
      <Field label="Invalid">
        {(id) => (
          <>
            <NumberInput
              id={id}
              defaultValue={120}
              suffix="%"
              aria-invalid="true"
              aria-describedby={`${id}-error`}
            />
            <p id={`${id}-error`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              A discount can't be more than 100%.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<NumberInput size="sm" aria-label="Small" />
<NumberInput size="md" aria-label="Medium" />
<NumberInput size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <NumberInput size={size} aria-label={`Quantity, size ${size}`} defaultValue={12} />
          <Button size={size}>Add</Button>
        </div>
      ))}
    </div>
  ),
};

/** The same amount in each locale: `en-IN` groups in lakhs and crores. */
export const Locales: Story = {
  parameters: source(`<MgsProvider locale="en-IN">
  <NumberInput id="amount" prefix="₹" decimals={2} defaultValue={1234567.5} />  {/* 12,34,567.50 */}
</MgsProvider>`),
  render: (_args, { globals }) => (
    <div style={column}>
      {(['en-GB', 'en-US', 'en-IN'] as const).map((locale) => (
        <MgsProvider key={locale} theme={globals.theme as MgsTheme} locale={locale}>
          <Field label={`Amount (${locale})`}>
            {(id) => (
              <NumberInput
                id={id}
                prefix="₹"
                decimals={2}
                defaultValue={1234567.5}
                controls={false}
              />
            )}
          </Field>
        </MgsProvider>
      ))}
    </div>
  ),
};

/**
 * An order line: quantity, unit price in ₹ (Indian grouping), discount as a percentage, and a read-only total.
 * Edge case: a discount typed above 100 becomes 100 when leaving the field.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [quantity, setQuantity] = useState<number | null>(12);
const [price, setPrice] = useState<number | null>(54999);
const [discount, setDiscount] = useState<number | null>(5);
const total = (quantity ?? 0) * (price ?? 0) * (1 - (discount ?? 0) / 100);

<MgsProvider locale="en-IN">
  <NumberInput id="quantity" min={1} decimals={0} value={quantity} onChange={setQuantity} suffix="units" />
  <NumberInput id="price" min={0} decimals={2} value={price} onChange={setPrice} prefix="₹" />
  <NumberInput id="discount" min={0} max={100} step={0.5} value={discount} onChange={setDiscount} suffix="%" />
  <NumberInput id="total" readOnly decimals={2} value={total} prefix="₹" />
</MgsProvider>`),
  render: function Render(_args, { globals }) {
    const [quantity, setQuantity] = useState<number | null>(12);
    const [price, setPrice] = useState<number | null>(54999);
    const [discount, setDiscount] = useState<number | null>(5);
    const total = (quantity ?? 0) * (price ?? 0) * (1 - (discount ?? 0) / 100);
    return (
      <MgsProvider theme={globals.theme as MgsTheme} locale="en-IN">
        <div style={{ ...column, maxWidth: 420 }}>
          <Field label="Quantity (units)">
            {(id) => (
              <NumberInput
                id={id}
                min={1}
                decimals={0}
                value={quantity}
                onChange={setQuantity}
                suffix="units"
              />
            )}
          </Field>
          <Field label="Unit price (₹)">
            {(id) => (
              <NumberInput
                id={id}
                min={0}
                decimals={2}
                value={price}
                onChange={setPrice}
                prefix="₹"
              />
            )}
          </Field>
          <Field label="Discount (%)">
            {(id) => (
              <NumberInput
                id={id}
                min={0}
                max={100}
                step={0.5}
                value={discount}
                onChange={setDiscount}
                suffix="%"
              />
            )}
          </Field>
          <Field label="Total (₹)">
            {(id) => <NumberInput id={id} readOnly decimals={2} value={total} prefix="₹" />}
          </Field>
        </div>
      </MgsProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const discount = canvas.getByRole('spinbutton', { name: 'Discount (%)' });
    await userEvent.clear(discount);
    await userEvent.type(discount, '150');
    await userEvent.tab();
    await expect(discount).toHaveValue('100');
    await expect(canvas.getByRole('spinbutton', { name: 'Total (₹)' })).toHaveValue('0.00');
  },
};

/** Tab reaches the field; ↑ ↓ step it, Home and End jump to the limits, and screen readers hear the value. */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="quantity">Quantity</label>
<NumberInput id="quantity" min={1} max={10} defaultValue={5} />`),
  render: () => (
    <div style={column}>
      <Field label="Quantity">
        {(id) => <NumberInput id={id} min={1} max={10} defaultValue={5} />}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const quantity = canvas.getByRole('spinbutton', { name: 'Quantity' });
    await expect(quantity).toHaveFocus();
    await expect(quantity).toHaveAttribute('aria-valuenow', '5');
    await userEvent.keyboard('{ArrowUp}');
    await expect(quantity).toHaveAttribute('aria-valuenow', '6');
    await userEvent.keyboard('{End}');
    await expect(quantity).toHaveAttribute('aria-valuenow', '10');
    await userEvent.keyboard('{Home}');
    await expect(quantity).toHaveAttribute('aria-valuenow', '1');
    await expect(quantity).toHaveAttribute('aria-valuemax', '10');
  },
};
