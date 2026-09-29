import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MultiSelect, type SelectOption } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { styleSource } from '../../test/styleSource';
import * as stories from './MultiSelect.stories';

const allStories = composeStories(stories);

const modules: SelectOption[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'reports', label: 'Reports' },
];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error options are required */}
    <MultiSelect aria-label="Modules" />
    {/* @ts-expect-error the value is a list */}
    <MultiSelect aria-label="Modules" options={modules} value="orders" />
    {/* @ts-expect-error an empty value is [], not null */}
    <MultiSelect aria-label="Modules" options={modules} value={null} />
    {/* @ts-expect-error values are strings */}
    <MultiSelect aria-label="Modules" options={modules} value={[1, 2]} />
    {/* @ts-expect-error RSuite's data is hidden; use options */}
    <MultiSelect aria-label="Modules" data={modules} />
    {/* @ts-expect-error RSuite's cleanable is hidden; use clearable */}
    <MultiSelect aria-label="Modules" options={modules} cleanable />
    {/* @ts-expect-error RSuite's sticky is hidden: options keep their place */}
    <MultiSelect aria-label="Modules" options={modules} sticky />
    {/* @ts-expect-error RSuite's countable is hidden: the count is always shown */}
    <MultiSelect aria-label="Modules" options={modules} countable={false} />
    {/* @ts-expect-error RSuite's block is hidden: a MultiSelect is always full width */}
    <MultiSelect aria-label="Modules" options={modules} block />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <MultiSelect aria-label="Modules" options={modules} size="xs" />
  </>
);

/** The list, which RSuite renders at the end of the page. */
const list = () => screen.findByRole('listbox');

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('MultiSelect stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('MultiSelect', () => {
  it('renders a closed combobox of size md, named by the app, showing the placeholder', () => {
    const { container } = render(
      <MultiSelect aria-label="Modules" options={modules} placeholder="Choose modules" />,
    );
    const field = screen.getByRole('combobox', { name: 'Modules' });
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveAttribute('data-size', 'md');
    expect(field).toHaveTextContent('Choose modules');
    expect(field).not.toHaveAttribute('aria-labelledby');
    expect(container.firstElementChild).toHaveClass('mgs-multi-select');
  });

  it('shows the chosen labels and how many there are', () => {
    render(
      <MultiSelect aria-label="Modules" options={modules} defaultValue={['orders', 'reports']} />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Orders,Reports');
    expect(screen.getByRole('combobox')).toHaveTextContent('2');
  });

  it('checks and unchecks options, stays open, and onChange gets the values first', async () => {
    const onChange = vi.fn();
    render(<MultiSelect aria-label="Modules" options={modules} onChange={onChange} />);
    const field = screen.getByRole('combobox');
    await userEvent.click(field);
    const listbox = await list();
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(within(listbox).getByText('Invoices'));
    expect(onChange).toHaveBeenLastCalledWith(['invoices'], expect.anything());
    await userEvent.click(within(listbox).getByText('Orders'));
    expect(onChange).toHaveBeenLastCalledWith(['invoices', 'orders'], expect.anything());
    expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(within(listbox).getByText('Invoices'));
    expect(onChange).toHaveBeenLastCalledWith(['orders'], expect.anything());
    expect(field).toHaveTextContent('Orders');
  });

  it('the options keep their place in the list when they are chosen', async () => {
    render(<MultiSelect aria-label="Modules" options={modules} defaultValue={['reports']} />);
    await userEvent.click(screen.getByRole('combobox'));
    const options = within(await list()).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Orders', 'Invoices', 'Reports']);
  });

  it('value: stays what the app sets', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect aria-label="Modules" options={modules} value={['orders']} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(within(await list()).getByText('Reports'));
    expect(onChange).toHaveBeenCalledWith(['orders', 'reports'], expect.anything());
    expect(screen.getByRole('combobox')).toHaveTextContent('Orders');
    expect(screen.getByRole('combobox')).not.toHaveTextContent('Reports');
  });

  it('clearable: a button removes every value, and onChange gets an empty list', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Modules"
        options={modules}
        defaultValue={['orders', 'reports']}
        onChange={onChange}
        clearable
        placeholder="Choose"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith([], expect.anything());
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose');
  });

  it('searchable: filters the options, shows emptyText, and calls onSearch', async () => {
    const onSearch = vi.fn();
    render(
      <MultiSelect
        aria-label="Modules"
        options={modules}
        searchable
        onSearch={onSearch}
        emptyText="No modules found"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await list();
    await userEvent.keyboard('rep');
    expect(onSearch).toHaveBeenLastCalledWith('rep');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Reports']);
    await userEvent.keyboard('zz');
    expect(screen.getByText('No modules found')).toBeInTheDocument();
  });

  it('a disabled option is marked and can not be chosen', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Modules"
        options={[...modules, { value: 'settings', label: 'Settings', disabled: true }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const option = within(await list()).getByRole('option', { name: 'Settings' });
    expect(option).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(within(option).getByText('Settings'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled and readOnly: neither opens; read-only keeps focus', async () => {
    const { rerender } = render(<MultiSelect aria-label="Modules" options={modules} disabled />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(<MultiSelect aria-label="Modules" options={modules} readOnly />);
    const field = screen.getByRole('combobox');
    expect(field).toHaveAttribute('aria-readonly', 'true');
    await userEvent.tab();
    expect(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('a form submits the chosen values under the name', () => {
    render(
      <form data-testid="form">
        <MultiSelect
          aria-label="Modules"
          name="modules"
          options={modules}
          defaultValue={['orders', 'reports']}
        />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data.get('modules')).toBe('orders,reports');
  });

  it('className and style go to the root; other attributes and ref go to the field', () => {
    const ref = createRef<HTMLDivElement>();
    const onBlur = vi.fn();
    const { container } = render(
      <MultiSelect
        ref={ref}
        aria-label="Modules"
        options={modules}
        id="modules"
        aria-invalid="true"
        aria-describedby="modules-error"
        onBlur={onBlur}
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const field = screen.getByRole('combobox');
    expect(ref.current).toBe(field);
    expect(field).toHaveAttribute('id', 'modules');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field.getAttribute('aria-describedby')).toMatch(/^modules-error /);
    field.focus();
    field.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild).toHaveClass('mgs-multi-select', 'custom');
    expect(container.firstElementChild).toHaveStyle({ marginTop: '4px' });
  });

  it('warns in development without an accessible name, and when two options share a value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<MultiSelect options={[...modules, { value: 'orders', label: 'Orders 2' }]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('the same value'));
  });

  it('the checkboxes in the list have a border that can be seen (read from the bridge)', () => {
    const bridge = styleSource('src/styles/rsuite-bridge.scss');
    expect(bridge).toMatch(
      /\.rs-picker-popup \{\s*--rs-checkbox-border: var\(--mgs-color-border-control\)/,
    );
    // The dark list is lighter than the page: its own, lighter border.
    expect(bridge).toMatch(
      /\.rs-theme-dark\) \.rs-picker-popup \{\s*--rs-checkbox-border: var\(--rs-gray-300\)/,
    );
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
