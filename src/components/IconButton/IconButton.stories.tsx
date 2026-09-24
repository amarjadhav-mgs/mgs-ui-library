import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { iconOptions, PlusIcon } from '../../../.storybook/icons';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          'A square button showing only an icon. It shares variants, sizes, loading and behaviour with `Button`. `aria-label` is **required**: it is the only thing screen readers announce. See **Components/Button** for full guidance.',
      },
    },
  },
  args: {
    icon: <PlusIcon />,
    'aria-label': 'Add item',
    onClick: fn(),
  },
  argTypes: {
    icon: { control: 'select', options: Object.keys(iconOptions), mapping: iconOptions },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    onClick: { table: { category: 'Events' } },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'secondary', size: 'md', loading: false, disabled: false },
};

export const VariantsAndSizes: Story = {
  parameters: {
    docs: {
      source: {
        language: 'tsx',
        code: `<IconButton icon={<PlusIcon />} aria-label="Add item" variant="primary" size="sm" />
<IconButton icon={<PlusIcon />} aria-label="Add item" variant="secondary" size="md" />
<IconButton icon={<PlusIcon />} aria-label="Add item" variant="danger" size="lg" />
<IconButton icon={<PlusIcon />} aria-label="Add item" variant="ghost" />`,
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['primary', 'secondary', 'danger', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <IconButton key={size} {...args} variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};
