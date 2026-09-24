import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const WithIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button {...args} leftIcon={<span>←</span>}>
        Back
      </Button>
      <Button {...args} variant="secondary" rightIcon={<span>→</span>}>
        Next
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    'aria-label': 'Close',
    leftIcon: <span>✕</span>,
    children: undefined,
  },
};

export const Loading: Story = { args: { loading: true, children: 'Saving…' } };

/** Click to see the loading state; the button keeps focus while busy. */
export const LoadingInteractive: Story = {
  render: function Render(args) {
    const [loading, setLoading] = useState(false);
    return (
      <Button
        {...args}
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
      >
        {loading ? 'Saving…' : 'Save'}
      </Button>
    );
  },
};

export const FullWidth: Story = { args: { fullWidth: true, size: 'lg' } };
