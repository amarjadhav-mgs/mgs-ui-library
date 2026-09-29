import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AutoComplete, InputGroup } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './AutoComplete.stories';

const allStories = composeStories(stories);
const cities = ['Mumbai', 'Nagpur', 'Nashik', 'Pune'];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error suggestions are required */}
    <AutoComplete aria-label="City" />
    {/* @ts-expect-error RSuite's data is hidden; use suggestions */}
    <AutoComplete aria-label="City" data={cities} />
    {/* @ts-expect-error suggestions are texts, not objects */}
    <AutoComplete aria-label="City" suggestions={[{ value: 'pune', label: 'Pune' }]} />
    {/* @ts-expect-error the value is a text */}
    <AutoComplete aria-label="City" suggestions={cities} value={1} />
    {/* @ts-expect-error RSuite's filterBy is hidden; use filter={false} and give the right suggestions */}
    <AutoComplete aria-label="City" suggestions={cities} filterBy={() => true} />
    {/* @ts-expect-error RSuite's selectOnEnter is hidden */}
    <AutoComplete aria-label="City" suggestions={cities} selectOnEnter={false} />
    {/* @ts-expect-error RSuite's inputRef is hidden; ref points at the <input> */}
    <AutoComplete aria-label="City" suggestions={cities} inputRef={createRef()} />
    {/* @ts-expect-error RSuite's placement is hidden */}
    <AutoComplete aria-label="City" suggestions={cities} placement="topStart" />
    {/* @ts-expect-error RSuite's renderOption is hidden */}
    <AutoComplete aria-label="City" suggestions={cities} renderOption={() => null} />
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <AutoComplete aria-label="City" suggestions={cities} size="xs" />
  </>
);

const optionTexts = () => screen.queryAllByRole('option').map((option) => option.textContent);

describe('AutoComplete stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('AutoComplete', () => {
  it('renders a text input that is a combobox of size md, named by its label', () => {
    const { container } = render(
      <>
        <label htmlFor="city">City</label>
        <AutoComplete id="city" suggestions={cities} />
      </>,
    );
    const field = screen.getByRole('combobox', { name: 'City' });
    expect(field.tagName).toBe('INPUT');
    expect(field).toHaveAttribute('aria-autocomplete', 'list');
    expect(field).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('.mgs-auto-complete')).toContainElement(field);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('suggests the texts that contain what is typed, whatever the case', async () => {
    render(<AutoComplete aria-label="City" suggestions={cities} />);
    await userEvent.type(screen.getByRole('combobox'), 'NA');
    await screen.findByRole('listbox');
    expect(optionTexts()).toEqual(['Nagpur', 'Nashik']);
  });

  it('onChange gets the text first on every key; choosing calls onSelect and onChange', async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <AutoComplete
        aria-label="City"
        suggestions={cities}
        onChange={onChange}
        onSelect={onSelect}
      />,
    );
    const field = screen.getByRole('combobox');
    await userEvent.type(field, 'pu');
    expect(onChange).toHaveBeenLastCalledWith('pu', expect.anything());
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole('option', { name: 'Pune' }));
    expect(onSelect).toHaveBeenCalledWith('Pune', expect.anything());
    expect(onChange).toHaveBeenLastCalledWith('Pune', expect.anything());
    expect(field).toHaveValue('Pune');
  });

  it('accepts a text that is not a suggestion', async () => {
    const onChange = vi.fn();
    render(<AutoComplete aria-label="City" suggestions={cities} onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'Kolhapur');
    expect(screen.getByRole('combobox')).toHaveValue('Kolhapur');
    expect(onChange).toHaveBeenLastCalledWith('Kolhapur', expect.anything());
    expect(optionTexts()).toEqual([]);
  });

  it('keyboard: arrows move, Enter chooses, and focus stays in the field', async () => {
    render(<AutoComplete aria-label="City" suggestions={cities} />);
    const field = screen.getByRole('combobox');
    await userEvent.type(field, 'n');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(field).toHaveValue('Nagpur');
    expect(field).toHaveFocus();
  });

  it('names the active option only while the arrow keys are on one that exists', async () => {
    render(<AutoComplete aria-label="City" id="city" suggestions={cities} defaultValue="Pune" />);
    const field = screen.getByRole('combobox');
    // RSuite alone points at "city-opt-Pune" here, while the list is closed.
    expect(field).not.toHaveAttribute('aria-activedescendant');
    await userEvent.clear(field);
    await userEvent.type(field, 'n');
    await screen.findByRole('listbox');
    expect(field).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowDown}');
    const active = field.getAttribute('aria-activedescendant');
    expect(active).toBe('city-opt-Nagpur');
    expect(document.getElementById(active as string)).toHaveTextContent('Nagpur');
    await userEvent.keyboard('{Enter}');
    expect(field).not.toHaveAttribute('aria-activedescendant');
  });

  it('filter={false}: shows every suggestion the app gives', async () => {
    render(
      <AutoComplete
        aria-label="Email"
        suggestions={['asha@gmail.com', 'asha@yahoo.com']}
        filter={false}
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), 'xyz');
    await screen.findByRole('listbox');
    expect(optionTexts()).toEqual(['asha@gmail.com', 'asha@yahoo.com']);
  });

  it('the same suggestion twice is shown once', async () => {
    render(<AutoComplete aria-label="City" suggestions={['Pune', 'Pune', 'Mumbai']} />);
    await userEvent.type(screen.getByRole('combobox'), 'u');
    await screen.findByRole('listbox');
    expect(optionTexts()).toEqual(['Pune', 'Mumbai']);
  });

  it('value: stays what the app sets', async () => {
    const onChange = vi.fn();
    render(<AutoComplete aria-label="City" suggestions={cities} value="Pu" onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'n');
    expect(onChange).toHaveBeenCalledWith('Pun', expect.anything());
    expect(screen.getByRole('combobox')).toHaveValue('Pu');
  });

  it('disabled: not focusable or editable; also inside a disabled InputGroup', async () => {
    const { rerender } = render(
      <AutoComplete aria-label="City" suggestions={cities} disabled defaultValue="Pune" />,
    );
    const field = screen.getByRole('combobox');
    expect(field).toBeDisabled();
    await userEvent.type(field, 'x');
    expect(field).toHaveValue('Pune');
    rerender(
      <InputGroup disabled>
        <AutoComplete aria-label="City" suggestions={cities} />
      </InputGroup>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('readOnly: focusable, not editable, and suggests nothing', async () => {
    render(<AutoComplete aria-label="City" suggestions={cities} readOnly defaultValue="Pu" />);
    const field = screen.getByRole('combobox');
    await userEvent.tab();
    expect(field).toHaveFocus();
    await userEvent.keyboard('n');
    expect(field).toHaveValue('Pu');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('a form submits name=text', () => {
    render(
      <form data-testid="form">
        <AutoComplete aria-label="City" name="city" suggestions={cities} defaultValue="Pune" />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect([...data.entries()]).toEqual([['city', 'Pune']]);
  });

  it('className and style go to the root; input attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    const { container } = render(
      <AutoComplete
        ref={ref}
        suggestions={cities}
        id="city"
        name="city"
        required
        placeholder="e.g. Pune"
        maxLength={40}
        aria-label="City"
        aria-invalid="true"
        aria-describedby="city-error"
        onBlur={onBlur}
        className="custom"
        style={{ marginTop: 4 }}
      />,
    );
    const field = screen.getByRole('combobox');
    const root = container.querySelector('.mgs-auto-complete');
    expect(ref.current).toBe(field);
    expect(field).toHaveAttribute('id', 'city');
    expect(field).toBeRequired();
    expect(field).toHaveAttribute('placeholder', 'e.g. Pune');
    expect(field).toHaveAttribute('maxlength', '40');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', 'city-error');
    field.focus();
    field.blur();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
