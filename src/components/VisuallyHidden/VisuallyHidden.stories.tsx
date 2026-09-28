import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, EditIcon, IconButton, TrashIcon, VisuallyHidden } from '@mgs/ui';
import { source } from '../../stories/shared';

function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

const Note = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--mgs-color-text-secondary)' }}>
    {children}
  </p>
);

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  // Docs come from VisuallyHidden.mdx.
  tags: ['!autodocs'],
  args: { children: 'order 1042' },
  parameters: {
    controls: { include: ['children'] },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Text for screen readers only.',
      table: { type: { summary: 'ReactNode' } },
    },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Edit the hidden text: the button looks the same, but its accessible name changes. */
export const Playground: Story = {
  render: (args) => (
    <div>
      <Button leftIcon={<TrashIcon />}>
        Delete <VisuallyHidden {...args} />
      </Button>
      <Note>Screen readers read the button as "Delete {String(args.children ?? '')}".</Note>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<Button leftIcon={<TrashIcon />}>
  Delete <VisuallyHidden>order 1042</VisuallyHidden>
</Button>`),
  render: () => (
    <div>
      <Button leftIcon={<TrashIcon />}>
        Delete <VisuallyHidden>order 1042</VisuallyHidden>
      </Button>
      <Note>Screen readers read "Delete order 1042"; the screen shows "Delete".</Note>
    </div>
  ),
};

/**
 * Context that sighted users get from the layout: which row a button acts on, a link that opens a new tab, the meaning
 * of a coloured status dot, and a heading for a region that has no visible heading.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`// A row action: the visible label is short, the hidden text names the row
<Button size="sm">Edit <VisuallyHidden>invoice INV-204</VisuallyHidden></Button>

// A link that opens a new tab
<a href="/guide" target="_blank" rel="noreferrer">
  User guide <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
</a>

// A colour-only status
<span className="status-dot status-dot--overdue" aria-hidden="true" />
<VisuallyHidden>Overdue</VisuallyHidden>

// A region without a visible heading
<section aria-labelledby="filters-heading">
  <VisuallyHidden id="filters-heading">Filters</VisuallyHidden>
  …
</section>`),
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
        <caption style={{ textAlign: 'start', paddingBottom: 8 }}>Invoices</caption>
        <tbody>
          {[
            { id: 'INV-204', status: 'Overdue', color: 'var(--mgs-color-danger)' },
            { id: 'INV-205', status: 'Paid', color: 'var(--mgs-color-text-secondary)' },
          ].map((invoice) => (
            <tr key={invoice.id}>
              <th scope="row" style={{ padding: '4px 12px 4px 0', textAlign: 'start' }}>
                {invoice.id}
              </th>
              <td style={{ padding: '4px 12px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: invoice.color,
                  }}
                />
                <VisuallyHidden>{invoice.status}</VisuallyHidden>
              </td>
              <td style={{ padding: '4px 0' }}>
                <Row>
                  <Button size="sm" leftIcon={<EditIcon />}>
                    Edit <VisuallyHidden>invoice {invoice.id}</VisuallyHidden>
                  </Button>
                  <IconButton
                    size="sm"
                    variant="danger"
                    aria-label={`Delete invoice ${invoice.id}`}
                  >
                    <TrashIcon />
                  </IconButton>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="https://www.w3.org/WAI/" target="_blank" rel="noreferrer">
        Accessibility guidelines <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
      </a>
      <section aria-labelledby="vh-filters-heading">
        <VisuallyHidden id="vh-filters-heading">Filters</VisuallyHidden>
        <Row>
          <Button size="sm">Open</Button>
          <Button size="sm">Overdue</Button>
        </Row>
      </section>
    </div>
  ),
};

/** The hidden text joins the button's accessible name; Tab reaches the button as usual. */
export const Accessibility: Story = {
  parameters: source(`<Button>Edit <VisuallyHidden>invoice INV-204</VisuallyHidden></Button>`),
  render: () => (
    <Button>
      Edit <VisuallyHidden>invoice INV-204</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Edit invoice INV-204' })).toHaveFocus();
  },
};
