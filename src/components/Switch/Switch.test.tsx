import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { compiledRules } from '../../test/compiledStyle';
import { playStory, storiesWithPlay } from '../../test/stories';
import { styleSource } from '../../test/styleSource';
import * as stories from './Switch.stories';

const allStories = composeStories(stories);
const rules = compiledRules('src/components/Switch/Switch.scss');

/** The declarations of the compiled rule with exactly this selector, outside any condition or inside the given one. */
const declarations = (selector: string, condition = '') =>
  rules.find((rule) => rule.selector === selector && rule.condition === condition)?.declarations ??
  '';

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error HTML has no read-only checkbox; use disabled */}
    <Switch readOnly>Label</Switch>
    {/* @ts-expect-error RSuite's color is hidden; the colour comes from the theme */}
    <Switch color="green">Label</Switch>
    {/* @ts-expect-error RSuite's plaintext is hidden */}
    <Switch plaintext>Label</Switch>
    {/* @ts-expect-error RSuite's label is hidden; the label is the children */}
    <Switch label="Label" />
    {/* @ts-expect-error RSuite's labelPlacement is hidden */}
    <Switch labelPlacement="start">Label</Switch>
    {/* @ts-expect-error RSuite's checkedChildren is hidden: no text inside the track */}
    <Switch checkedChildren="On">Label</Switch>
    {/* @ts-expect-error RSuite's unCheckedChildren is hidden: no text inside the track */}
    <Switch unCheckedChildren="Off">Label</Switch>
    {/* @ts-expect-error xs and xl are not in the MGS size scale */}
    <Switch size="xs">Label</Switch>
    {/* @ts-expect-error always a switch */}
    <Switch role="tooltip">Label</Switch>
    {/* @ts-expect-error values are strings */}
    <Switch value={1}>Label</Switch>
  </>
);

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('Switch stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Switch', () => {
  it('renders a native checkbox with the switch role, off, size md, named by its label', () => {
    const { container } = render(<Switch>Email notifications</Switch>);
    const control = screen.getByRole('switch', { name: 'Email notifications' });
    expect(control.tagName).toBe('INPUT');
    expect(control).toHaveAttribute('type', 'checkbox');
    expect(control).not.toBeChecked();
    expect(container.firstElementChild?.tagName).toBe('LABEL');
    expect(container.firstElementChild).toHaveClass('mgs-switch');
    expect(container.firstElementChild).toHaveAttribute('data-size', 'md');
    // The native state is what screen readers hear: no ARIA repeats it.
    expect(control).not.toHaveAttribute('aria-checked');
    expect(control).not.toHaveAttribute('aria-disabled');
    expect(control).not.toHaveAttribute('aria-busy');
  });

  it.each(['sm', 'md', 'lg'] as const)('size %s is marked for the styles', (size) => {
    const { container } = render(<Switch size={size}>Label</Switch>);
    expect(container.firstElementChild).toHaveAttribute('data-size', size);
  });

  it('clicking the label turns it on, and onChange gets the new state first, then the event', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>Email notifications</Switch>);
    await userEvent.click(screen.getByText('Email notifications'));
    expect(screen.getByRole('switch')).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ type: 'change' }));
    await userEvent.click(screen.getByText('Email notifications'));
    expect(onChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ type: 'change' }));
  });

  it('checked: stays what the app sets', async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange}>
        Label
      </Switch>,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('Space turns it on and off', async () => {
    render(<Switch>Label</Switch>);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('disabled: not focusable, not changeable, and marked on the root for styling', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Switch disabled onChange={onChange}>
        Label
      </Switch>,
    );
    const control = screen.getByRole('switch');
    expect(control).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('Label'));
    await userEvent.tab();
    expect(control).not.toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('loading: busy, focusable, and clicks and Space change nothing, also when uncontrolled', async () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Switch loading defaultChecked onChange={onChange} onClick={onClick}>
        Account active
      </Switch>,
    );
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('aria-busy', 'true');
    expect(control).toBeEnabled();
    expect(container.firstElementChild).toHaveAttribute('data-loading', 'true');
    await userEvent.tab();
    expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(control).toBeChecked();
    await userEvent.click(screen.getByText('Account active'));
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a form submits name=value when on, "on" without a value, and nothing when off', () => {
    render(
      <form data-testid="form">
        <Switch name="email" value="yes" defaultChecked>
          Email
        </Switch>
        <Switch name="sms" defaultChecked>
          SMS
        </Switch>
        <Switch name="push" value="yes">
          Push
        </Switch>
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect([...data.entries()]).toEqual([
      ['email', 'yes'],
      ['sms', 'on'],
    ]);
  });

  it('without a label: named by aria-label, or by other text through aria-labelledby', () => {
    render(
      <>
        <Switch aria-label="Orders module" />
        <span id="module">Invoices module</span>
        <Switch aria-labelledby="module" />
      </>,
    );
    expect(screen.getByRole('switch', { name: 'Orders module' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Invoices module' })).toBeInTheDocument();
  });

  it('className and style go to the root; other attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    const { container } = render(
      <Switch
        ref={ref}
        id="notify"
        name="notify"
        aria-describedby="notify-help"
        data-testid="notify"
        onFocus={onFocus}
        className="custom"
        style={{ marginTop: 4 }}
      >
        Notify
      </Switch>,
    );
    const control = screen.getByTestId('notify');
    const root = container.firstElementChild;
    expect(ref.current).toBe(control);
    expect(control.tagName).toBe('INPUT');
    expect(control).toHaveAttribute('id', 'notify');
    expect(control).toHaveAttribute('aria-describedby', 'notify-help');
    control.focus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('mgs-switch', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(control).not.toHaveClass('custom');
  });

  it('warns once in development when switches have no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Switch />
        <Switch />
      </>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('warns in development when checked is set without onChange, unless it is disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <Switch checked disabled>
        Shown only
      </Switch>,
    );
    expect(warn).not.toHaveBeenCalled();
    rerender(<Switch checked>Stuck</Switch>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('can never change'));
  });

  describe('styles, as compiled', () => {
    it('the state is shown by where the thumb is, not only by colour', () => {
      const off = declarations('.mgs-switch__thumb');
      const on = declarations('.mgs-switch__input:checked + .mgs-switch__track .mgs-switch__thumb');
      expect(off).toContain('inset-inline-start:');
      expect(on).toContain('inset-inline-start:');
      expect(on).not.toBe(off);
    });

    it('the thumb is drawn with borders and the track has a border, which forced-colors mode keeps', () => {
      expect(declarations('.mgs-switch__thumb')).toContain('solid currentColor');
      expect(declarations('.mgs-switch__thumb')).not.toContain('background');
      expect(declarations('.mgs-switch__track')).toContain('border: 1px solid transparent');
      expect(declarations('.mgs-switch__track', '@media (forced-colors: active)')).toContain(
        'border-color: ButtonText',
      );
    });

    it('the loading spinner keeps turning with reduced motion, like the other spinners', () => {
      const motion = styleSource('src/styles/motion.scss');
      expect(motion).toContain('.mgs-switch__thumb::after');
    });
  });

  it('does not accept RSuite props (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
