import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { styleSource } from '../../test/styleSource';
import * as stories from './Radio.stories';

const allStories = composeStories(stories);
const styles = styleSource('src/components/Radio/Radio.scss');
const mixins = styleSource('src/styles/_mixins.scss');

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error a radio stands for a value */}
    <Radio>Label</Radio>
    {/* @ts-expect-error values are strings */}
    <Radio value={1}>Label</Radio>
    {/* @ts-expect-error the RadioGroup holds the value; a Radio has no checked */}
    <Radio value="a" checked>
      Label
    </Radio>
    {/* @ts-expect-error the RadioGroup holds the value; a Radio has no defaultChecked */}
    <Radio value="a" defaultChecked>
      Label
    </Radio>
    {/* @ts-expect-error the RadioGroup has onChange */}
    <Radio value="a" onChange={() => {}}>
      Label
    </Radio>
    {/* @ts-expect-error the RadioGroup has the name */}
    <Radio value="a" name="delivery">
      Label
    </Radio>
    {/* @ts-expect-error HTML has no read-only radio; use disabled */}
    <Radio value="a" readOnly>
      Label
    </Radio>
    {/* @ts-expect-error RSuite's color is hidden; the colour comes from the theme */}
    <Radio value="a" color="red">
      Label
    </Radio>
    {/* @ts-expect-error RSuite's inline is hidden; RadioGroup has orientation */}
    <Radio value="a" inline>
      Label
    </Radio>
    {/* @ts-expect-error RSuite's inputRef is hidden; ref points at the <input> */}
    <Radio value="a" inputRef={createRef()}>
      Label
    </Radio>
    {/* @ts-expect-error RSuite's inputProps is hidden; attributes go to the <input> directly */}
    <Radio value="a" inputProps={{}}>
      Label
    </Radio>
  </>
);

/** Counts the classes, pseudo-classes and attribute selectors of a selector; :not() counts as what is inside it. */
const parts = (selector: string) => selector.match(/[.:[](?!not\()/g)?.length ?? 0;

/** The selector of the first rule in Radio.scss that starts with `start`. */
function selectorOf(start: string) {
  const rule = styles.slice(styles.indexOf(start));
  return rule.slice(0, rule.indexOf('{')).replace(/\s+/g, ' ');
}

/** The declarations of the first rule in Radio.scss that starts with `start`. */
function declarationsOf(start: string) {
  const rule = styles.slice(styles.indexOf(start));
  return rule.slice(rule.indexOf('{') + 1, rule.indexOf('}'));
}

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('Radio stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('Radio', () => {
  it('renders a native radio, named by its label, selected when the group has its value', () => {
    render(
      <RadioGroup aria-label="Delivery" defaultValue="express">
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );
    const standard = screen.getByRole('radio', { name: 'Standard' });
    const express = screen.getByRole('radio', { name: 'Express' });
    expect(standard.tagName).toBe('INPUT');
    expect(standard).toHaveAttribute('type', 'radio');
    expect(standard).toHaveAttribute('value', 'standard');
    expect(standard).not.toBeChecked();
    expect(express).toBeChecked();
    expect(standard.closest('label')).toHaveClass('mgs-radio');
    // The native state is what screen readers hear: no ARIA repeats it.
    expect(express).not.toHaveAttribute('aria-checked');
    expect(express).not.toHaveAttribute('aria-disabled');
    expect(express).not.toHaveAttribute('aria-labelledby');
  });

  it('clicking the label selects it', async () => {
    render(
      <RadioGroup aria-label="Delivery">
        <Radio value="standard">Standard</Radio>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText('Standard'));
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('disabled: not selectable, and marked on the root for styling', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Delivery" onChange={onChange}>
        <Radio value="standard">Standard</Radio>
        <Radio value="express" disabled>
          Express
        </Radio>
      </RadioGroup>,
    );
    const express = screen.getByRole('radio', { name: 'Express' });
    expect(express).toBeDisabled();
    expect(express.closest('label')).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('Express'));
    expect(express).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('without a label: named by aria-label, or by other text through aria-labelledby', () => {
    render(
      <RadioGroup aria-label="Default address">
        <Radio value="office" aria-label="Head office is the default" />
        <span id="warehouse">Warehouse</span>
        <Radio value="warehouse" aria-labelledby="warehouse" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Head office is the default' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Warehouse' })).toBeInTheDocument();
  });

  it('className and style go to the root; other attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    render(
      <RadioGroup aria-label="Delivery">
        <Radio
          ref={ref}
          value="standard"
          id="standard"
          aria-describedby="standard-help"
          data-testid="standard"
          onFocus={onFocus}
          className="custom"
          style={{ marginTop: 4 }}
        >
          Standard
        </Radio>
      </RadioGroup>,
    );
    const radio = screen.getByTestId('standard');
    const root = radio.closest('label');
    expect(ref.current).toBe(radio);
    expect(radio.tagName).toBe('INPUT');
    expect(radio).toHaveAttribute('id', 'standard');
    expect(radio).toHaveAttribute('aria-describedby', 'standard-help');
    radio.focus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass('mgs-radio', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(radio).not.toHaveClass('custom');
  });

  it('warns in development when it is not inside a RadioGroup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Radio value="standard">Standard</Radio>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must be inside a RadioGroup'));
  });

  it('warns once in development when radios have no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup aria-label="Delivery">
        <Radio value="standard" />
        <Radio value="express" />
      </RadioGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('does not warn when it has a label, aria-label, aria-labelledby, a title or an id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup aria-label="Delivery">
        <Radio value="a">Label</Radio>
        <Radio value="b" aria-label="Label" />
        <Radio value="c" aria-labelledby="other" />
        <Radio value="d" title="Label" />
        <Radio value="e" id="outside" />
      </RadioGroup>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('the invalid rule is more specific than the hover rule, so hover keeps the error border (read from the styles)', () => {
    const hover = selectorOf('.mgs-radio:hover');
    const invalid = selectorOf(".mgs-radio-group[aria-invalid='true']");
    // The count below is only right for plain selectors: :is() and :where() follow other rules.
    expect(hover + invalid).not.toMatch(/:(is|where)\(/);
    expect(parts(invalid)).toBeGreaterThan(parts(hover));
    // They compete for the same property.
    expect(declarationsOf('.mgs-radio:hover')).toContain('border-color:');
    expect(declarationsOf(".mgs-radio-group[aria-invalid='true']")).toContain('border-color:');
  });

  it('the dot is drawn with borders, which forced-colors mode keeps (read from the styles)', () => {
    expect(styles).toContain("@include mixins.radio-circle('mgs-radio')");
    const circle = mixins.slice(mixins.indexOf('@mixin radio-circle'));
    const after = circle.slice(circle.indexOf('&::after {'));
    const dot = after.slice(0, after.indexOf('}'));
    expect(dot).toContain('solid currentColor');
    expect(dot).not.toContain('background');
  });

  it('does not accept RSuite props or the props the group owns (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
