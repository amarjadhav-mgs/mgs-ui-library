import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Checkbox,
  CheckboxGroup,
  FormField,
  Input,
  MultiSelect,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { compiledRules } from '../../test/compiledStyle';
import { playStory, storiesWithPlay } from '../../test/stories';
import { styleSource } from '../../test/styleSource';
import * as stories from './FormField.stories';

const allStories = composeStories(stories);
const options = [
  { value: 'in', label: 'India' },
  { value: 'gb', label: 'United Kingdom' },
];

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error a field needs a label */}
    <FormField>
      <Input />
    </FormField>
    {/* @ts-expect-error a field needs a control */}
    <FormField label="Name" />
    {/* @ts-expect-error one control, not text */}
    <FormField label="Name">text</FormField>
    {/* @ts-expect-error one control, not several */}
    <FormField label="Name">
      <Input />
      <Input />
    </FormField>
    {/* @ts-expect-error the error is a message, not a flag; RSuite's errorMessage is hidden */}
    <FormField label="Name" errorMessage="Required">
      <Input />
    </FormField>
    {/* @ts-expect-error RSuite's controlId on FormGroup became controlId here, a string */}
    <FormField label="Name" controlId={1}>
      <Input />
    </FormField>
  </>
);

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('FormField stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('FormField', () => {
  it('names a text field with a <label htmlFor>, and gives it a generated id', async () => {
    const { container } = render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    const label = screen.getByText('Email');
    expect(container.firstElementChild).toHaveClass('mgs-form-field');
    expect(label.tagName).toBe('LABEL');
    expect(input.id).not.toBe('');
    expect(label).toHaveAttribute('for', input.id);
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toBeRequired();
    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  it("uses controlId, or the control's own id", () => {
    render(
      <>
        <FormField label="Email" controlId="email">
          <Input />
        </FormField>
        <FormField label="Phone">
          <Input id="phone" />
        </FormField>
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('id', 'email');
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveAttribute('id', 'phone');
  });

  it('help describes the control', () => {
    render(
      <FormField label="Email" help="We use it for invoices">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription('We use it for invoices');
    expect(screen.getByText('We use it for invoices')).toHaveClass('mgs-form-field__help');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('error marks the control invalid, is read before the help, and goes away with the error', () => {
    const { container, rerender } = render(
      <FormField label="Email" help="We use it for invoices" error="Enter an email">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter an email We use it for invoices');
    expect(container.firstElementChild).toHaveAttribute('data-invalid', 'true');
    // The icon is decorative; the text is the message.
    const message = container.querySelector('.mgs-form-field__error');
    expect(message?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(
      <FormField label="Email" help="We use it for invoices" error="">
        <Input />
      </FormField>,
    );
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('We use it for invoices');
    expect(container.firstElementChild).not.toHaveAttribute('data-invalid');
    expect(screen.queryByText('Enter an email')).not.toBeInTheDocument();
  });

  it("keeps the control's own description, first", () => {
    render(
      <>
        <span id="unit">in kilograms</span>
        <FormField label="Weight" help="Without the pallet">
          <Input aria-describedby="unit" />
        </FormField>
      </>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      'in kilograms Without the pallet',
    );
  });

  it('required: a mark for the eye, hidden from screen readers, and the control is required', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['Textarea', <Textarea key="c" />, 'textbox'],
    ['NumberInput', <NumberInput key="c" />, 'spinbutton'],
  ] as const)('%s: named by the label, described by the error', (_name, control, role) => {
    render(
      <FormField label="Field" error="Not right" required>
        {control}
      </FormField>,
    );
    const field = screen.getByRole(role, { name: 'Field' });
    expect(field).toHaveAccessibleDescription('Not right');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toBeRequired();
  });

  it.each([
    ['Select', <Select key="c" options={options} />],
    ['MultiSelect', <MultiSelect key="c" options={options} />],
  ] as const)(
    '%s: named through aria-labelledby, required through aria-required, focused by a click on the label',
    async (_name, control) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <FormField label="Country" error="Choose a country" required>
          {control}
        </FormField>,
      );
      const field = screen.getByRole('combobox', { name: 'Country' });
      const label = screen.getByText('Country');
      expect(label.tagName).toBe('LABEL');
      expect(label).not.toHaveAttribute('for');
      expect(field).toHaveAttribute('aria-required', 'true');
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription(/^Choose a country/);
      await userEvent.click(label);
      expect(field).toHaveFocus();
      // The field has a name, so its own warning stays quiet.
      expect(warn).not.toHaveBeenCalled();
    },
  );

  it('RadioGroup: the label is the heading of the group, not a <label>', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <FormField label="Delivery" error="Choose a delivery option" required>
        <RadioGroup name="delivery">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </FormField>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Delivery' });
    expect(screen.getByText('Delivery').tagName).toBe('SPAN');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Choose a delivery option');
    expect(group).not.toHaveAttribute('id');
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeRequired();
    expect(warn).not.toHaveBeenCalled();
  });

  it('CheckboxGroup: named and described; a group has no invalid or required state', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <FormField label="Notify me by" error="Choose at least one" required>
        <CheckboxGroup>
          <Checkbox value="email">Email</Checkbox>
        </CheckboxGroup>
      </FormField>,
    );
    const group = screen.getByRole('group', { name: 'Notify me by' });
    expect(group).toHaveAccessibleDescription('Choose at least one');
    expect(group).not.toHaveAttribute('aria-invalid');
    expect(group).not.toHaveAttribute('required');
    expect(screen.getByRole('checkbox', { name: 'Email' })).not.toBeRequired();
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ['Checkbox', <Checkbox key="c">I accept the terms</Checkbox>, 'checkbox'],
    ['Switch', <Switch key="c">I accept the terms</Switch>, 'switch'],
  ] as const)('%s: keeps its own label; the field label is a heading', (_name, control, role) => {
    render(
      <FormField label="Terms" error="Accept the terms" required>
        {control}
      </FormField>,
    );
    const field = screen.getByRole(role, { name: 'I accept the terms' });
    expect(screen.getByText('Terms').tagName).toBe('SPAN');
    expect(field).not.toHaveAttribute('aria-labelledby');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Accept the terms');
    expect(field).toBeRequired();
  });

  it('forwards ref, native attributes, className and style to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FormField
        ref={ref}
        label="Email"
        data-testid="field"
        className="custom"
        style={{ marginTop: 4 }}
      >
        <Input />
      </FormField>,
    );
    const root = screen.getByTestId('field');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('mgs-form-field', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
  });

  describe('styles', () => {
    const rules = compiledRules('src/patterns/FormField/FormField.scss');
    const themes = styleSource('src/styles/themes.scss');

    it('the error text has its own colour token, set by MGS in every theme', () => {
      const error = rules
        .filter((rule) => rule.selector === '.mgs-form-field__error')
        .map((rule) => rule.declarations)
        .join(' ');
      expect(error).toContain('color: var(--mgs-color-text-error)');
      // RSuite's error text fails contrast (3.7:1 in light, 2.9:1 in high contrast).
      expect(themes).not.toContain('--mgs-color-text-error: var(--rs-text-error)');
      expect(themes.match(/--mgs-color-text-error:/g)).toHaveLength(3);
    });
  });

  it('does not accept a missing label or control (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
