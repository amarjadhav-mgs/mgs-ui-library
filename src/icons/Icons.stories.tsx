import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as mgsIcons from './index';
import { source } from '../stories/shared';

const icons = Object.entries(mgsIcons) as [string, ComponentType][];

/**
 * Every MGS icon. Import them from `@mgs/ui`; they are sized `1em` and use `currentColor`, so they follow the text
 * around them. They are hidden from screen readers: the button or text next to them carries the meaning.
 */
const meta = {
  title: 'Foundation/Icons',
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  parameters: source(`import { Button, IconButton, PlusIcon, TrashIcon } from '@mgs/ui';

<Button leftIcon={<PlusIcon />}>Add</Button>
<IconButton aria-label="Delete row"><TrashIcon /></IconButton>`),
  render: () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        color: 'var(--mgs-color-text)',
      }}
    >
      {icons.map(([name, Icon]) => (
        <li
          key={name}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
            padding: 12,
            border: '1px solid var(--mgs-color-border)',
            borderRadius: 'var(--mgs-radius-md)',
          }}
        >
          <span style={{ fontSize: 24 }}>
            <Icon />
          </span>
          <code style={{ fontSize: 12 }}>{name}</code>
        </li>
      ))}
    </ul>
  ),
};
