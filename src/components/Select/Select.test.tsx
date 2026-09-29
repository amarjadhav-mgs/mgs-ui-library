import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InputGroup, Select, type SelectOption } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { styleSource } from '../../test/styleSource';
import * as stories from './Select.stories';

const allStories = composeStories(stories);

const statuses: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paid', label: 'Paid' },
];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error options are required */}
    <Select aria-label="Status" />
    {/* @ts-expect-error RSuite's data is hidden; use options */}
    <Select aria-label="Status" data={statuses} />
    {/* @ts-expect-error values are strings */}
    <Select aria-label="Status" options={[{ value: 1, label: 'One' }]} />
    {/* @ts-expect-error values are strings */}
    <Select aria-label="Status" options={statuses} value={1} />
    {/* @ts-expect-error RSuite's cleanable is hidden; use clearable */}
    <Select aria-label="Status" options={statuses} cleanable />
    {/* @ts-expect-error RSuite's block is hidden: a Select is always full width */}
    <Select aria-label="Status" options={statuses} block />
    {/* @ts-expect-error RSuite's labelKey is hidden: options have value and label */}
    <Select aria-label="Status" options={statuses} labelKey="name" />
    {/* @ts-expect-error RSuite's disabledItemValues is hidden; use disabled on the option */}
    <Select aria-label="Status" options={statuses} disabledItemValues={['open']} />
    {/* @ts-expect-error RSuite's appearance is hidden */}
    <Select aria-label="Status" options={statuses} appearance="subtle" />
    {/* @ts-expect-error RSuite's placement is hidden */}
    <Select aria-label="Status" options={statuses} placement="topStart" />
    {/* @ts-expect-error RSuite's renderValue is hidden */}
    <Select aria-label="Status" options={statuses} renderValue={() => null} />
    {/* @ts-expect-error RSuite's onOpen is hidden; use onOpenChange */}
    <Select aria-label="Status" options={statuses} onOpen={() => {}} />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <Select aria-label="Status" options={statuses} size="xs" />
  </>
);

/** The list, which RSuite renders at the end of the page. */
const list = () => screen.findByRole('listbox');

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('Select stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Select', () => {
  it('renders a closed combobox of size md, named by the app, showing the placeholder', () => {
    const { container } = render(
      <Select aria-label="Status" options={statuses} placeholder="Choose a status" />,
    );
    const field = screen.getByRole('combobox', { name: 'Status' });
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveAttribute('data-size', 'md');
    expect(field).toHaveTextContent('Choose a status');
    expect(container.firstElementChild).toHaveClass('mgs-select');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('is named by a visible label through aria-labelledby, and never points at a label that is not there', () => {
    render(
      <>
        <span id="status-label">Invoice status</span>
        <Select aria-labelledby="status-label" options={statuses} />
        <Select aria-label="Second" options={statuses} />
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'Invoice status' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Second' })).not.toHaveAttribute('aria-labelledby');
  });

  it('opens on click, lists the options, and onChange gets the chosen value first', async () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select
        aria-label="Status"
        options={statuses}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );
    const field = screen.getByRole('combobox');
    await userEvent.click(field);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    const options = within(await list()).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Draft', 'Open', 'Paid']);
    await userEvent.click(options[2]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('paid', expect.anything());
    expect(field).toHaveTextContent('Paid');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('value: stays what the app sets, and null shows the placeholder', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Select aria-label="Status" options={statuses} value="open" onChange={onChange} />,
    );
    const field = screen.getByRole('combobox');
    await userEvent.click(field);
    await userEvent.click(within(await list()).getByRole('option', { name: 'Paid' }));
    expect(onChange).toHaveBeenCalledWith('paid', expect.anything());
    expect(field).toHaveTextContent('Open');
    rerender(
      <Select
        aria-label="Status"
        options={statuses}
        value={null}
        placeholder="Choose"
        onChange={onChange}
      />,
    );
    expect(field).toHaveTextContent('Choose');
  });

  it('keyboard: Enter opens, arrows move, Enter chooses and focus stays on the field', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Status" options={statuses} defaultValue="draft" onChange={onChange} />,
    );
    const field = screen.getByRole('combobox');
    await userEvent.tab();
    expect(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await list();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('open', expect.anything());
    expect(field).toHaveTextContent('Open');
    expect(field).toHaveFocus();
  });

  it('clearable: a button removes the value, and onChange gets null', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Select aria-label="Status" options={statuses} defaultValue="open" onChange={onChange} />,
    );
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    rerender(
      <Select
        aria-label="Status"
        options={statuses}
        defaultValue="open"
        onChange={onChange}
        clearable
        placeholder="Choose"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null, expect.anything());
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose');
  });

  it('searchable: filters the options by their label, shows emptyText, and calls onSearch', async () => {
    const onSearch = vi.fn();
    render(
      <Select
        aria-label="Status"
        options={statuses}
        searchable
        onSearch={onSearch}
        emptyText="No statuses found"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await list();
    await userEvent.keyboard('pa');
    expect(onSearch).toHaveBeenLastCalledWith('pa');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Paid']);
    await userEvent.keyboard('zz');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No statuses found')).toBeInTheDocument();
  });

  it('without searchable there is no search box', async () => {
    render(<Select aria-label="Status" options={statuses} />);
    await userEvent.click(screen.getByRole('combobox'));
    await list();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('a disabled option is marked and can not be chosen', async () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Status"
        options={[...statuses, { value: 'void', label: 'Void', disabled: true }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const option = within(await list()).getByRole('option', { name: 'Void' });
    expect(option).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('options with a group are listed under their heading', async () => {
    render(
      <Select
        aria-label="City"
        options={[
          { value: 'pune', label: 'Pune', group: 'Maharashtra' },
          { value: 'surat', label: 'Surat', group: 'Gujarat' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const listbox = await list();
    expect(within(listbox).getByText('Maharashtra')).toBeInTheDocument();
    expect(within(listbox).getByText('Gujarat')).toBeInTheDocument();
    expect(within(listbox).getAllByRole('option')).toHaveLength(2);
  });

  it('disabled: not focusable and does not open; also inside a disabled InputGroup', async () => {
    const { rerender } = render(<Select aria-label="Status" options={statuses} disabled />);
    const field = screen.getByRole('combobox');
    expect(field).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    expect(field).not.toHaveFocus();
    await userEvent.click(field);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(
      <InputGroup disabled>
        <Select aria-label="Status" options={statuses} />
      </InputGroup>,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('readOnly: focusable, marked read-only, and does not open', async () => {
    render(<Select aria-label="Status" options={statuses} defaultValue="open" readOnly />);
    const field = screen.getByRole('combobox');
    expect(field).toHaveAttribute('aria-readonly', 'true');
    await userEvent.tab();
    expect(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(field);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('a form submits name=value, and an empty value when nothing is chosen', () => {
    render(
      <form data-testid="form">
        <Select aria-label="Status" name="status" options={statuses} defaultValue="open" />
        <Select aria-label="Channel" name="channel" options={statuses} />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect([...data.entries()]).toEqual([
      ['status', 'open'],
      ['channel', ''],
    ]);
  });

  it("the app's description (an error) is read before the chosen value", () => {
    render(
      <>
        <Select
          aria-label="Status"
          options={statuses}
          defaultValue="open"
          aria-invalid="true"
          aria-describedby="status-error"
        />
        <p id="status-error">Choose another status</p>
      </>,
    );
    const field = screen.getByRole('combobox');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Choose another status Open');
  });

  it('className and style go to the root; other attributes and ref go to the field', () => {
    const ref = createRef<HTMLDivElement>();
    const onBlur = vi.fn();
    const { container } = render(
      <Select
        ref={ref}
        aria-label="Status"
        options={statuses}
        id="status"
        data-testid="status"
        onBlur={onBlur}
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const field = screen.getByRole('combobox');
    const root = container.firstElementChild;
    expect(ref.current).toBe(field);
    expect(field).toHaveAttribute('id', 'status');
    expect(field).toHaveAttribute('data-testid', 'status');
    field.focus();
    field.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('mgs-select', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('a list of more than 100 options opens, and shows only the options in view', async () => {
    const many = Array.from({ length: 500 }, (_, index) => ({
      value: `customer-${index}`,
      label: `Customer ${index}`,
    }));
    render(<Select aria-label="Customer" options={many} defaultValue="customer-3" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Customer 3');
    await userEvent.click(screen.getByRole('combobox'));
    await list();
    expect(screen.getAllByRole('option').length).toBeLessThan(500);
  });

  it('warns in development when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Select options={statuses} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('warns in development when two options have the same value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Select aria-label="Status" options={[...statuses, { value: 'open', label: 'Open 2' }]} />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('the same value'));
  });

  it('the field border and the error border come from the MGS tokens (read from the bridge)', () => {
    const bridge = styleSource('src/styles/rsuite-bridge.scss');
    expect(bridge).toMatch(
      /\.rs-picker \{\s*--rs-picker-toggle-border-color: var\(--mgs-color-border-control\)/,
    );
    expect(bridge).toMatch(
      /\.rs-picker-toggle\[aria-invalid='true'\] \{\s*--rs-picker-toggle-border-color: var\(--mgs-color-border-error\)/,
    );
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
