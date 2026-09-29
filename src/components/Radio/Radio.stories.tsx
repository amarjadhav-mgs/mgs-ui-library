import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup } from '@mgs/ui';
import { labelStyle, source } from '../../stories/shared';

const heading = { ...labelStyle, margin: '0 0 4px' } as const;
const cell = { padding: '4px 12px', textAlign: 'start' } as const;

const addresses = [
  { id: 'office', name: 'Head office', city: 'Pune' },
  { id: 'warehouse', name: 'Warehouse', city: 'Nashik' },
  { id: 'store', name: 'Store', city: 'Mumbai' },
];

const meta = {
  title: 'Components/Radio',
  component: Radio,
  // Docs come from Radio.mdx.
  tags: ['!autodocs'],
  args: { value: 'express' },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: { include: ['value', 'children', 'disabled'] },
  },
  argTypes: {
    value: {
      control: 'text',
      description: "What the radio stands for: the `RadioGroup`'s value when it is selected.",
      table: { type: { summary: 'string' } },
    },
    children: {
      control: 'text',
      description: 'The visible label. Without one, set `aria-label` or `aria-labelledby`.',
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or selected.",
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. The second radio is the one the controls change. */
export const Playground: Story = {
  args: {
    value: 'express',
    children: 'Express (next day)',
    disabled: false,
  },
  render: (args) => (
    <div>
      <p id="playground-delivery" style={heading}>
        Delivery
      </p>
      <RadioGroup aria-labelledby="playground-delivery" defaultValue="standard">
        <Radio value="standard">Standard (3 to 5 days)</Radio>
        <Radio {...args} />
      </RadioGroup>
    </div>
  ),
};

/** A Radio is always inside a `RadioGroup`, which holds the value. */
export const Basic: Story = {
  parameters: source(`<RadioGroup aria-label="Delivery" name="delivery" defaultValue="standard">
  <Radio value="standard">Standard (3 to 5 days)</Radio>
  <Radio value="express">Express (next day)</Radio>
</RadioGroup>`),
  render: () => (
    <RadioGroup aria-label="Delivery" name="delivery" defaultValue="standard">
      <Radio value="standard">Standard (3 to 5 days)</Radio>
      <Radio value="express">Express (next day)</Radio>
    </RadioGroup>
  ),
};

/** Selected and disabled. The invalid look belongs to the group: see RadioGroup. */
export const States: Story = {
  parameters: source(`<RadioGroup aria-label="States" defaultValue="selected">
  <Radio value="unselected">Unselected</Radio>
  <Radio value="selected">Selected</Radio>
  <Radio value="disabled" disabled>Disabled</Radio>
</RadioGroup>

<RadioGroup aria-label="Disabled and selected" defaultValue="selected">
  <Radio value="selected" disabled>Disabled, selected</Radio>
</RadioGroup>`),
  render: () => (
    <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
      <RadioGroup aria-label="States" defaultValue="selected">
        <Radio value="unselected">Unselected</Radio>
        <Radio value="selected">Selected</Radio>
        <Radio value="disabled" disabled>
          Disabled
        </Radio>
      </RadioGroup>
      <RadioGroup aria-label="Disabled and selected" defaultValue="selected">
        <Radio value="selected" disabled>
          Disabled, selected
        </Radio>
      </RadioGroup>
    </div>
  ),
};

/** The label can be long, and can wrap: the circle stays next to the first line. */
export const LongLabel: Story = {
  name: 'Long label',
  parameters: source(`<RadioGroup aria-label="Invoice delivery" defaultValue="email">
  <Radio value="email">
    Send the invoice by email to the billing contact, with a copy to the account manager
  </Radio>
  <Radio value="post">Send a printed invoice by post to the registered office address</Radio>
</RadioGroup>`),
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <RadioGroup aria-label="Invoice delivery" defaultValue="email">
        <Radio value="email">
          Send the invoice by email to the billing contact, with a copy to the account manager
        </Radio>
        <Radio value="post">Send a printed invoice by post to the registered office address</Radio>
      </RadioGroup>
    </div>
  ),
};

/**
 * One row of a table is the default: the radios have no visible label, so each has an `aria-label`. The `RadioGroup`
 * is around the table, and reaches the radios inside it.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [defaultAddress, setDefaultAddress] = useState('office');

<RadioGroup aria-label="Default delivery address" value={defaultAddress} onChange={setDefaultAddress}>
  <table>
    <tbody>
      {addresses.map((address) => (
        <tr key={address.id}>
          <td><Radio value={address.id} aria-label={\`\${address.name} is the default\`} /></td>
          <td>{address.name}</td>
          <td>{address.city}</td>
        </tr>
      ))}
    </tbody>
  </table>
</RadioGroup>`),
  render: function Render() {
    const [defaultAddress, setDefaultAddress] = useState('office');
    return (
      <RadioGroup
        aria-label="Default delivery address"
        value={defaultAddress}
        onChange={setDefaultAddress}
      >
        <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
          <caption style={{ ...cell, captionSide: 'top' }}>
            Delivery addresses (default: {defaultAddress})
          </caption>
          <thead>
            <tr>
              <th style={cell}>Default</th>
              <th style={cell}>Address</th>
              <th style={cell}>City</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <tr key={address.id}>
                <td style={cell}>
                  <Radio value={address.id} aria-label={`${address.name} is the default`} />
                </td>
                <td style={cell}>{address.name}</td>
                <td style={cell}>{address.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </RadioGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Warehouse is the default' }));
    await expect(canvas.getByText('Delivery addresses (default: warehouse)')).toBeInTheDocument();
    await expect(
      canvas.getByRole('radio', { name: 'Head office is the default' }),
    ).not.toBeChecked();
  },
};

/** Tab reaches the selected radio; the arrow keys skip a disabled radio; Space selects when nothing is selected. */
export const Accessibility: Story = {
  parameters: source(`<RadioGroup aria-label="Delivery">
  <Radio value="standard">Standard</Radio>
  <Radio value="express" disabled>Express</Radio>
  <Radio value="pickup">Pick up at the store</Radio>
</RadioGroup>`),
  render: () => (
    <RadioGroup aria-label="Delivery">
      <Radio value="standard">Standard</Radio>
      <Radio value="express" disabled>
        Express
      </Radio>
      <Radio value="pickup">Pick up at the store</Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const pickup = canvas.getByRole('radio', { name: 'Pick up at the store' });
    await userEvent.tab();
    await expect(standard).toHaveFocus();
    await expect(standard).not.toBeChecked();
    await userEvent.keyboard(' ');
    await expect(standard).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(pickup).toHaveFocus();
    await expect(pickup).toBeChecked();
  },
};
