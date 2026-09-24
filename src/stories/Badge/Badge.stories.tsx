import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Avatar, Badge, Button, IconButton } from '@mgs/ui';
import CheckIcon from '@rsuite/icons/Check';
import EmailIcon from '@rsuite/icons/Email';
import NoticeIcon from '@rsuite/icons/Notice';

// Values verified against rsuite 6.2.4. The placement type also lists left*/right* corners,
// but RSuite has no styles for them, so only these four are offered.
const placements = ['topStart', 'topEnd', 'bottomStart', 'bottomEnd'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'] as const;

const row: CSSProperties = { display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' };
const column: CSSProperties = { display: 'grid', gap: 20 };

/** Short, copyable snippet for "Show code" instead of the full story source. */
function source(code: string) {
  return { docs: { source: { code, language: 'tsx' } } };
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  // Docs come from Badge.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  argTypes: {
    content: { control: 'text', description: 'Number or content shown in the badge.' },
    maxCount: {
      control: 'number',
      description: 'Numbers above this show as "99+". Only for numeric content.',
      table: { defaultValue: { summary: '99' } },
    },
    color: { control: 'select', options: [undefined, ...colors] },
    placement: {
      control: 'inline-radio',
      options: placements,
      table: { defaultValue: { summary: 'topEnd' } },
    },
    shape: { control: 'inline-radio', options: ['rectangle', 'circle'] },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    compact: { control: 'boolean', description: 'No padding: for icons and single characters.' },
    outline: {
      control: 'boolean',
      description: 'Border that separates the badge from what it sits on.',
      table: { defaultValue: { summary: 'true' } },
    },
    invisible: { control: 'boolean', description: 'Hide the badge (e.g. when the count is 0).' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<Badge content={6}>
  <IconButton icon={<NoticeIcon />} aria-label="Notifications, 6 unread" />
</Badge>`),
  args: {
    content: 6,
    maxCount: 99,
    placement: 'topEnd',
    size: 'md',
    compact: false,
    outline: true,
    invisible: false,
  },
  render: (args) => (
    <Badge {...args}>
      <IconButton
        icon={<NoticeIcon />}
        aria-label={args.invisible ? 'Notifications' : `Notifications, ${args.content} unread`}
      />
    </Badge>
  ),
};

export const Basic: Story = {
  parameters: source(`<Badge content={6}>
  <IconButton icon={<NoticeIcon />} aria-label="Notifications, 6 unread" />
</Badge>`),
  render: () => (
    <Badge content={6}>
      <IconButton icon={<NoticeIcon />} aria-label="Notifications, 6 unread" />
    </Badge>
  ),
};

export const WithContent: Story = {
  name: 'With content',
  parameters: source(`<Badge content={6}>…</Badge>
<Badge content={150}>…</Badge>              // shows "99+" (maxCount)
<Badge content="new" color="violet">…</Badge>
<Badge color="green" placement="bottomEnd">…</Badge>   // dot, no content
<Badge compact color="green" placement="bottomEnd" content={<CheckIcon />}>…</Badge>`),
  render: () => (
    <div style={row}>
      <Badge content={6}>
        <Avatar>AP</Avatar>
      </Badge>
      <Badge content={150}>
        <Avatar>RK</Avatar>
      </Badge>
      <Badge content="new" color="violet">
        <Avatar>SM</Avatar>
      </Badge>
      <Badge color="green" placement="bottomEnd">
        <Avatar>JD</Avatar>
      </Badge>
      <Badge compact color="green" placement="bottomEnd" content={<CheckIcon />}>
        <Avatar>TW</Avatar>
      </Badge>
      <Badge compact content={<NoticeIcon />}>
        <Avatar>LB</Avatar>
      </Badge>
    </div>
  ),
};

export const Placement: Story = {
  parameters: source(`<Badge content={6} placement="topStart">…</Badge>
<Badge content={6} placement="topEnd">…</Badge>
<Badge content={6} placement="bottomStart">…</Badge>
<Badge content={6} placement="bottomEnd">…</Badge>`),
  render: () => (
    <div style={row}>
      {placements.map((placement) => (
        <Badge key={placement} content={6} placement={placement}>
          <Avatar>{placement[0].toUpperCase() + placement.replace(/[a-z]/g, '')}</Avatar>
        </Badge>
      ))}
    </div>
  ),
};

/** If the wrapped element is round, use `shape="circle"` so the badge sits on its edge. */
export const Shapes: Story = {
  parameters: source(`<Badge content={6} shape="rectangle">
  <IconButton icon={<NoticeIcon />} aria-label="Notifications, 6 unread" />
</Badge>

<Badge content={6} shape="circle">
  <IconButton icon={<NoticeIcon />} circle aria-label="Notifications, 6 unread" />
</Badge>`),
  render: () => (
    <div style={column}>
      <div style={row}>
        <Badge content={6} shape="rectangle">
          <Avatar>AP</Avatar>
        </Badge>
        <Badge content={6} shape="circle">
          <Avatar circle>AP</Avatar>
        </Badge>
      </div>
      <div style={row}>
        <Badge content={6} shape="rectangle">
          <IconButton
            icon={<NoticeIcon />}
            size="sm"
            appearance="primary"
            aria-label="Notifications, 6 unread"
          />
        </Badge>
        <Badge content={6} shape="circle">
          <IconButton
            icon={<NoticeIcon />}
            circle
            size="sm"
            appearance="primary"
            aria-label="Messages, 6 unread"
          />
        </Badge>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Badge content={6} size="xs">…</Badge>
<Badge content={6} size="sm">…</Badge>
<Badge content={6} size="md">…</Badge>
<Badge content={6} size="lg">…</Badge>
<Badge content={6} size="xl">…</Badge>

<Badge content="Small" size="sm" />`),
  render: () => (
    <div style={column}>
      <div style={row}>
        {sizes.map((size) => (
          <Badge key={size} content={6} size={size}>
            <Avatar>{size}</Avatar>
          </Badge>
        ))}
      </div>
      <div style={row}>
        {sizes.map((size) => (
          <Badge key={size} content={size.toUpperCase()} size={size} />
        ))}
      </div>
    </div>
  ),
};

/** Fine-tune the position with `offset={[x, y]}` (numbers are pixels; strings like "20%" also work). */
export const Offset: Story = {
  parameters: source(`<Badge content={6} shape="circle" offset={[5, 5]}>
  <IconButton icon={<NoticeIcon />} circle appearance="subtle" aria-label="Notifications, 6 unread" />
</Badge>`),
  render: () => (
    <div style={row}>
      <Badge content={6} shape="circle">
        <IconButton
          icon={<NoticeIcon />}
          circle
          appearance="subtle"
          aria-label="Notifications, 6 unread"
        />
      </Badge>
      <Badge content={6} shape="circle" offset={[5, 5]}>
        <IconButton
          icon={<EmailIcon />}
          circle
          appearance="subtle"
          aria-label="Messages, 6 unread"
        />
      </Badge>
    </div>
  ),
};

/** `invisible` hides the badge without removing it, e.g. when the count drops to 0. */
export const Invisible: Story = {
  parameters: source(`const [show, setShow] = useState(true);

<Badge content={6} invisible={!show}>…</Badge>
<Badge content="New" invisible={!show} />`),
  render: function Render() {
    const [show, setShow] = useState(true);
    return (
      <div style={column}>
        <div style={row}>
          <Badge content={6} invisible={!show}>
            <Avatar>AP</Avatar>
          </Badge>
          <Badge content="New" invisible={!show} />
        </div>
        <div>
          <Button size="sm" toggleable active={show} onToggle={setShow} aria-pressed={show}>
            Show badge
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('New');
    await expect(badge).toHaveAttribute('data-hidden', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Show badge' }));
    await expect(badge).toHaveAttribute('data-hidden', 'true');
  },
};

/** Without children a badge stands alone: a dot, a count, a label or an icon next to text. */
export const WithoutChildren: Story = {
  name: 'Badge without children',
  parameters: source(`<Badge />
<Badge content="6" />
<Badge content="99+" />
<Badge content="new" color="violet" />

<Badge compact color="green" content={<CheckIcon />} /> Ready`),
  render: () => (
    <div style={column}>
      <div style={row}>
        <Badge />
        <Badge content="6" />
        <Badge content="99+" />
        <Badge content="new" color="violet" />
        <Badge compact content={<NoticeIcon />} />
      </div>
      <div style={{ ...row, gap: 8 }}>
        <Badge compact color="green" content={<CheckIcon />} />
        <span>Ready</span>
      </div>
      <div style={{ ...row, gap: 8 }}>
        <Badge compact content={<NoticeIcon />} />
        <span>Error</span>
      </div>
    </div>
  ),
};

/**
 * Preset colours plus any CSS colour. ⚠️ Only the default (red) and `violet` meet contrast with white
 * text; the Accessibility panel flags the others. See the docs.
 */
export const Colors: Story = {
  parameters: source(`<Badge content={6}>…</Badge>                  // default red (no color prop)
<Badge color="violet" content={6}>…</Badge>
<Badge color="#1e3a8a" content="Custom">…</Badge>
// color: red | orange | yellow | green | cyan | blue | violet | any CSS colour`),
  render: () => (
    <div style={column}>
      <div style={row}>
        {colors.map((color) => (
          <Badge key={color} color={color} content={6}>
            <Avatar>{color.slice(0, 2).toUpperCase()}</Avatar>
          </Badge>
        ))}
        <Badge color="#1e3a8a" content="Custom">
          <Avatar>CU</Avatar>
        </Badge>
      </div>
      <div style={row}>
        {colors.map((color) => (
          <Badge key={color} color={color} content={color} />
        ))}
        <Badge color="#1e3a8a" content="custom" />
      </div>
    </div>
  ),
};

/**
 * A badge is visual only; screen readers don't connect its text to what it sits on.
 * Put the meaning in the wrapped element's accessible name.
 */
export const Accessibility: Story = {
  parameters: source(`// ✅ The count is part of the button's name
<Badge content={unread}>
  <IconButton icon={<NoticeIcon />} aria-label={\`Notifications, \${unread} unread\`} />
</Badge>

// ✅ Status dot + visible text (colour alone isn't enough)
<Badge color="green" /> <span>Online</span>`),
  render: () => (
    <div style={column}>
      <Badge content={3}>
        <IconButton icon={<NoticeIcon />} aria-label="Notifications, 3 unread" />
      </Badge>
      <div style={{ ...row, gap: 8 }}>
        <Badge color="green" />
        <span>Online</span>
      </div>
    </div>
  ),
};
