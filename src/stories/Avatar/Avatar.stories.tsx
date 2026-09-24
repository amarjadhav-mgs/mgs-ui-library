import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup, Badge } from '@mgs/ui';
import CheckIcon from '@rsuite/icons/Check';
import PeoplesIcon from '@rsuite/icons/Peoples';

// Values verified against rsuite 6.2.4 (Avatar.d.ts, AvatarGroup.d.ts, rsuite.css size variables).
const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

const row: CSSProperties = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' };
const column: CSSProperties = { display: 'grid', gap: 20 };

/** Story-only portrait images (inline SVG), so the docs don't depend on an external image service. */
function portrait(background: string, skin: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${background}"/><circle cx="40" cy="32" r="15" fill="${skin}"/><path d="M12 80c2-18 14-27 28-27s26 9 28 27z" fill="${skin}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const photos = {
  asha: portrait('#1e40af', '#f5c6a5'),
  ravi: portrait('#0f766e', '#c68642'),
  sara: portrait('#6d28d9', '#e0ac69'),
  john: portrait('#9f1239', '#f1c27d'),
};

/** Short, copyable snippet for "Show code" instead of the full story source. */
function source(code: string) {
  return { docs: { source: { code, language: 'tsx' } } };
}

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  // Docs come from Avatar.mdx instead of the auto-generated page.
  tags: ['!autodocs'],
  argTypes: {
    src: { control: 'text', description: 'Image URL.' },
    alt: { control: 'text', description: "The person's name. Used as the image's alt text." },
    size: { control: 'inline-radio', options: sizes, table: { defaultValue: { summary: 'md' } } },
    circle: { control: 'boolean' },
    bordered: { control: 'boolean' },
    children: {
      control: 'text',
      description: 'Initials or an icon, shown when there is no image.',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  parameters: source(`<Avatar src={user.photoUrl} alt="Asha Patel" circle />`),
  args: { src: photos.asha, alt: 'Asha Patel', size: 'md', circle: true, bordered: false },
};

export const Basic: Story = {
  parameters: source(`<Avatar src={user.photoUrl} alt="Asha Patel" />
<Avatar src={user.photoUrl} alt="Asha Patel" circle />`),
  render: () => (
    <div style={row}>
      <Avatar src={photos.asha} alt="Asha Patel" />
      <Avatar src={photos.asha} alt="Asha Patel" circle />
    </div>
  ),
};

/**
 * Without an image, show initials. Initials alone mean nothing to a screen reader, so either name the avatar
 * (`role="img"` + `aria-label`) or hide it when the name is already shown next to it.
 */
export const Initials: Story = {
  parameters: source(`<Avatar role="img" aria-label="Asha Patel">AP</Avatar>

// Name already visible next to it: hide the avatar from screen readers
<Avatar aria-hidden>AP</Avatar> <span>Asha Patel</span>`),
  render: () => (
    <div style={column}>
      <div style={row}>
        <Avatar role="img" aria-label="Asha Patel">
          AP
        </Avatar>
        <Avatar circle role="img" aria-label="Ravi Kumar">
          RK
        </Avatar>
      </div>
      <div style={{ ...row, gap: 8 }}>
        <Avatar circle aria-hidden>
          AP
        </Avatar>
        <span>Asha Patel</span>
      </div>
    </div>
  ),
};

/** With no image, children or `alt`, Avatar shows a default person icon (announced as "Avatar"). */
export const Icons: Story = {
  parameters: source(`<Avatar />                                  // default person icon
<Avatar role="img" aria-label="Design team"><PeoplesIcon /></Avatar>`),
  render: () => (
    <div style={row}>
      <Avatar />
      <Avatar circle />
      <Avatar role="img" aria-label="Design team">
        <PeoplesIcon />
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<Avatar size="xs" … />
<Avatar size="sm" … />
<Avatar size="md" … />   // default
<Avatar size="lg" … />
<Avatar size="xl" … />
<Avatar size="2xl" … />
<Avatar size={52} … />   // custom size in px`),
  render: () => (
    <div style={row}>
      {sizes.map((size) => (
        <Avatar key={size} size={size} circle src={photos.asha} alt={`Asha Patel (${size})`} />
      ))}
      <Avatar size={52} circle src={photos.asha} alt="Asha Patel (52px)" />
    </div>
  ),
};

export const Shapes: Story = {
  parameters: source(`<Avatar src={url} alt="Asha Patel" />          // rounded square
<Avatar src={url} alt="Asha Patel" circle />   // circle`),
  render: () => (
    <div style={row}>
      <Avatar src={photos.ravi} alt="Ravi Kumar" size="lg" />
      <Avatar src={photos.ravi} alt="Ravi Kumar" size="lg" circle />
    </div>
  ),
};

/** `bordered` adds a ring, useful on busy backgrounds or to mark the selected person. */
export const Bordered: Story = {
  parameters: source(`<Avatar src={url} alt="Sara Mehta" circle bordered />`),
  render: () => (
    <div style={row}>
      <Avatar src={photos.sara} alt="Sara Mehta" circle bordered />
      <Avatar circle bordered role="img" aria-label="Sara Mehta">
        SM
      </Avatar>
    </div>
  ),
};

/**
 * `color` sets the background: a preset (`'violet'`), a shade (`'blue.700'`) or any CSS colour.
 * ⚠️ Check contrast with the white initials; see the docs.
 */
export const Colors: Story = {
  parameters: source(`<Avatar color="violet" role="img" aria-label="Asha Patel">AP</Avatar>
<Avatar color="blue.700" role="img" aria-label="Ravi Kumar">RK</Avatar>
<Avatar color="#0f766e" role="img" aria-label="Sara Mehta">SM</Avatar>`),
  render: () => (
    <div style={row}>
      <Avatar circle color="violet" role="img" aria-label="Asha Patel">
        AP
      </Avatar>
      <Avatar circle color="blue.700" role="img" aria-label="Ravi Kumar">
        RK
      </Avatar>
      <Avatar circle color="#0f766e" role="img" aria-label="Sara Mehta">
        SM
      </Avatar>
      <Avatar circle color="#9f1239" role="img" aria-label="John Doe">
        JD
      </Avatar>
    </div>
  ),
};

/**
 * While the image loads, or if it fails, Avatar shows its children. Always pass initials as children
 * with `src`, otherwise the full `alt` text is squeezed into the avatar.
 */
export const Fallback: Story = {
  parameters: source(`<Avatar src={user.photoUrl} alt="Asha Patel" circle>AP</Avatar>`),
  render: () => (
    <div style={row}>
      <Avatar src="/missing-photo.png" alt="Asha Patel" circle>
        AP
      </Avatar>
      <span style={{ fontSize: 13 }}>Broken image → initials</span>
    </div>
  ),
};

/** Lay out several avatars with consistent spacing. `size` on the group applies to all of them. */
export const Group: Story = {
  name: 'AvatarGroup',
  parameters: source(`<AvatarGroup spacing={8} size="sm" aria-label="Project members">
  <Avatar src={a} alt="Asha Patel" circle />
  <Avatar src={b} alt="Ravi Kumar" circle />
  <Avatar src={c} alt="Sara Mehta" circle />
</AvatarGroup>`),
  render: () => (
    <AvatarGroup spacing={8} size="sm" aria-label="Project members">
      <Avatar src={photos.asha} alt="Asha Patel" circle />
      <Avatar src={photos.ravi} alt="Ravi Kumar" circle />
      <Avatar src={photos.sara} alt="Sara Mehta" circle />
      <Avatar src={photos.john} alt="John Doe" circle />
    </AvatarGroup>
  ),
};

/**
 * `stack` overlaps the avatars. Show a count for the rest, and give it a name that says what it means.
 */
export const Stacked: Story = {
  parameters: source(`<AvatarGroup stack aria-label="Project members">
  <Avatar src={a} alt="Asha Patel" circle />
  <Avatar src={b} alt="Ravi Kumar" circle />
  <Avatar src={c} alt="Sara Mehta" circle />
  <Avatar circle role="img" aria-label="and 5 more people">+5</Avatar>
</AvatarGroup>`),
  render: () => (
    <AvatarGroup stack aria-label="Project members">
      <Avatar src={photos.asha} alt="Asha Patel" circle />
      <Avatar src={photos.ravi} alt="Ravi Kumar" circle />
      <Avatar src={photos.sara} alt="Sara Mehta" circle />
      <Avatar circle role="img" aria-label="and 5 more people">
        +5
      </Avatar>
    </AvatarGroup>
  ),
};

/** Avatar with a Badge: unread count or online status. Include the status in the name. */
export const WithBadge: Story = {
  name: 'With Badge',
  parameters: source(`<Badge content={3}>
  <Avatar src={url} alt="Asha Patel, 3 new messages" />
</Badge>

<Badge compact color="green" placement="bottomEnd" shape="circle" content={<CheckIcon />}>
  <Avatar src={url} alt="Ravi Kumar, online" circle />
</Badge>`),
  render: () => (
    <div style={row}>
      <Badge content={3}>
        <Avatar src={photos.asha} alt="Asha Patel, 3 new messages" />
      </Badge>
      <Badge compact color="green" placement="bottomEnd" shape="circle" content={<CheckIcon />}>
        <Avatar src={photos.ravi} alt="Ravi Kumar, online" circle />
      </Badge>
    </div>
  ),
};
