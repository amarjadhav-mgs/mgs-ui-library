import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio, RadioCard, RadioGroup, UserIcon } from '@mgs/ui';
import { resetDevWarnings } from '../../internal/devWarning';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import { compiledRules, specificity } from '../../test/compiledStyle';
import * as stories from './RadioCard.stories';

const allStories = composeStories(stories);
const rules = compiledRules('src/components/RadioCard/RadioCard.scss');

/** The compiled rule with exactly this selector, outside any condition or inside the given one. */
function find(selector: string, condition = '') {
  const rule = rules.find((r) => r.selector === selector && r.condition === condition);
  expect(rule, `no rule ${selector}${condition && ` in ${condition}`}`).toBeDefined();
  return rule as (typeof rules)[number];
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error a card stands for a value */}
    <RadioCard>Title</RadioCard>
    {/* @ts-expect-error values are strings */}
    <RadioCard value={1}>Title</RadioCard>
    {/* @ts-expect-error the RadioGroup holds the value; a RadioCard has no checked */}
    <RadioCard value="a" checked>
      Title
    </RadioCard>
    {/* @ts-expect-error the RadioGroup has onChange */}
    <RadioCard value="a" onChange={() => {}}>
      Title
    </RadioCard>
    {/* @ts-expect-error the RadioGroup has the name */}
    <RadioCard value="a" name="plan">
      Title
    </RadioCard>
    {/* @ts-expect-error RSuite's label is hidden; the title is the children */}
    <RadioCard value="a" label="Title" />
    {/* @ts-expect-error HTML has no read-only radio; use disabled */}
    <RadioCard value="a" readOnly>
      Title
    </RadioCard>
    {/* @ts-expect-error one size */}
    <RadioCard value="a" size="lg">
      Title
    </RadioCard>
    {/* @ts-expect-error RSuite's as is hidden */}
    <RadioCard value="a" as="div">
      Title
    </RadioCard>
  </>
);

afterEach(() => {
  vi.restoreAllMocks();
  resetDevWarnings();
});

describe('RadioCard stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('RadioCard', () => {
  it('renders a native radio named by the title and described by the description', () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="team">
        <RadioCard value="basic" description="5 users">
          Basic
        </RadioCard>
        <RadioCard value="team" description="25 users">
          Team
        </RadioCard>
      </RadioGroup>,
    );
    const basic = screen.getByRole('radio', { name: 'Basic' });
    const team = screen.getByRole('radio', { name: 'Team' });
    expect(basic.tagName).toBe('INPUT');
    expect(basic).toHaveAttribute('type', 'radio');
    expect(basic).toHaveAccessibleDescription('5 users');
    expect(basic).not.toBeChecked();
    expect(team).toBeChecked();
    expect(basic.closest('label')).toHaveClass('mgs-radio-card');
    expect(basic.closest('label')).not.toHaveAttribute('data-checked');
    expect(team.closest('label')).toHaveAttribute('data-checked', 'true');
    // The native state is what screen readers hear: no ARIA repeats it.
    expect(team).not.toHaveAttribute('aria-checked');
    expect(team).not.toHaveAttribute('aria-disabled');
  });

  it('without a description it has none, and points at nothing', () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioCard value="basic">Basic</RadioCard>
      </RadioGroup>,
    );
    const basic = screen.getByRole('radio', { name: 'Basic' });
    expect(basic).not.toHaveAttribute('aria-describedby');
    expect(basic).toHaveAccessibleDescription('');
  });

  it('clicking anywhere on the card selects it, and the group reports the value', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Plan" onChange={onChange}>
        <RadioCard value="basic" description="5 users">
          Basic
        </RadioCard>
        <RadioCard value="team" description="25 users">
          Team
        </RadioCard>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText('25 users'));
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('team', expect.objectContaining({ type: 'change' }));
  });

  it('works in one group with plain radios: one value, arrow keys through both', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Plan" defaultValue="basic" onChange={onChange}>
        <RadioCard value="basic">Basic</RadioCard>
        <Radio value="none">No plan</Radio>
      </RadioGroup>,
    );
    const [card, radio] = screen.getAllByRole<HTMLInputElement>('radio');
    expect(card.name).toBe(radio.name);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(radio).toBeChecked();
    expect(card).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('none', expect.anything());
  });

  it('disabled: not selectable, by itself or through the group', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RadioGroup aria-label="Plan" onChange={onChange}>
        <RadioCard value="basic">Basic</RadioCard>
        <RadioCard value="team" disabled description="Not available">
          Team
        </RadioCard>
      </RadioGroup>,
    );
    const team = screen.getByRole('radio', { name: 'Team' });
    expect(team).toBeDisabled();
    expect(team.closest('label')).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('Not available'));
    expect(team).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <RadioGroup aria-label="Plan" disabled>
        <RadioCard value="basic">Basic</RadioCard>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Basic' })).toBeDisabled();
  });

  it('the icon is decorative: hidden from screen readers, and not part of the name', () => {
    render(
      <RadioGroup aria-label="User type">
        <RadioCard value="internal" icon={<UserIcon data-testid="icon" />}>
          Internal user
        </RadioCard>
      </RadioGroup>,
    );
    expect(screen.getByTestId('icon').closest('.mgs-radio-card__icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Internal user' })).toBeInTheDocument();
  });

  it("the app's aria-label or aria-labelledby names it; its aria-describedby is kept before the description", () => {
    render(
      <RadioGroup aria-label="Plan">
        <span id="other-name">Plan for small teams</span>
        <span id="other-help">Billed per month</span>
        <RadioCard value="a" aria-label="Basic plan" description="5 users">
          Basic
        </RadioCard>
        <RadioCard
          value="b"
          aria-labelledby="other-name"
          aria-describedby="other-help"
          description="25 users"
        >
          Team
        </RadioCard>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Basic plan' })).toHaveAccessibleDescription(
      '5 users',
    );
    expect(screen.getByRole('radio', { name: 'Plan for small teams' })).toHaveAccessibleDescription(
      'Billed per month 25 users',
    );
  });

  it('className and style go to the root; other attributes and ref go to the <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <RadioGroup aria-label="Plan">
        <RadioCard
          ref={ref}
          value="basic"
          id="basic"
          data-testid="basic"
          className="custom"
          style={{ marginTop: 4 }}
        >
          Basic
        </RadioCard>
      </RadioGroup>,
    );
    const radio = screen.getByTestId('basic');
    const root = radio.closest('label');
    expect(ref.current).toBe(radio);
    expect(radio).toHaveAttribute('id', 'basic');
    expect(root).toHaveClass('mgs-radio-card', 'custom');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(radio).not.toHaveClass('custom');
  });

  it('warns in development when it is not inside a RadioGroup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<RadioCard value="basic">Basic</RadioCard>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must be inside a RadioGroup'));
  });

  it('warns in development when it has no title and no other name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup aria-label="Plan">
        <RadioCard value="a" description="5 users" />
        <RadioCard value="b" aria-label="Team" description="25 users" />
      </RadioGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
  });

  it('a card with only a description is named by it, and not described by it too', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup aria-label="Plan">
        <RadioCard value="a" description="5 users" />
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: '5 users' });
    expect(radio).not.toHaveAttribute('aria-describedby');
    expect(radio).not.toHaveAttribute('aria-labelledby');
  });

  it('does not warn when the app names it: aria-label, aria-labelledby, a title or an id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <RadioGroup aria-label="Plan">
        <RadioCard value="a" aria-label="Basic" />
        <RadioCard value="b" aria-labelledby="other" />
        <RadioCard value="c" title="Team" />
        <RadioCard value="d" id="outside" />
      </RadioGroup>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  describe('styles, as compiled', () => {
    const card = '.mgs-radio-card';
    const checked = ':has(.mgs-radio-card__input:checked)';
    const hover = find(`${card}:hover:not([data-disabled])`);
    const selected = find(`${card}${checked}`);
    const invalid = find(`.mgs-radio-group[aria-invalid=true] ${card}:not([data-disabled])`);
    const invalidSelected = find(
      `.mgs-radio-group[aria-invalid=true] ${card}:not([data-disabled])${checked}`,
    );

    it('the selected border comes from the <input>, like the circle', () => {
      expect(selected.declarations).toContain('border-color: var(--mgs-color-primary)');
      expect(selected.declarations).toContain('box-shadow: inset');
    });

    it('data-checked is used only where :has() is missing, so a stale value never draws a border', () => {
      const fromReact = rules.filter((rule) => rule.selector.includes('[data-checked]'));
      expect(fromReact.length).toBeGreaterThan(0);
      for (const rule of fromReact) expect(rule.condition).toBe('@supports not selector(:has(*))');
    });

    it('the focus ring is around the card, with :focus-within where :has() is missing', () => {
      const ring = find(`${card}:has(.mgs-radio-card__input:focus-visible)`);
      const fallback = find(`${card}:focus-within`, '@supports not selector(:has(*))');
      expect(ring.declarations).toContain('outline:');
      expect(fallback.declarations).toBe(ring.declarations);
      expect(rules.some((r) => r.selector === `${card}:focus-within` && r.condition === '')).toBe(
        false,
      );
    });

    it('the error border wins over hover and selected: a more specific rule for the same property', () => {
      for (const rule of [hover, selected, invalid]) {
        expect(rule.declarations).toContain('border-color:');
      }
      expect(specificity(invalid.selector)).toBeGreaterThan(specificity(hover.selector));
      expect(specificity(invalid.selector)).toBeGreaterThan(specificity(selected.selector));
    });

    it('a selected card in an invalid group keeps its thicker border, in the error colour', () => {
      expect(invalid.declarations).not.toContain('box-shadow');
      expect(invalidSelected.declarations).toContain(
        'box-shadow: inset 0 0 0 1px var(--mgs-color-border-error)',
      );
      expect(specificity(invalidSelected.selector)).toBeGreaterThan(specificity(selected.selector));
    });

    it('sets only the gap variable on the group, so it never competes with the group rules', () => {
      const gap = find('.mgs-radio-group:has(.mgs-radio-card)');
      expect(gap.declarations).toBe('--mgs-choice-gap: var(--mgs-space-sm);');
      const group = compiledRules('src/components/RadioGroup/RadioGroup.scss');
      for (const rule of group.filter((r) => r.declarations.includes('gap:'))) {
        expect(rule.declarations).toContain('gap: var(--mgs-choice-gap,');
      }
    });

    it('forced colours: a disabled card uses the system grey', () => {
      const disabled = find(`${card}[data-disabled]`, '@media (forced-colors: active)');
      expect(disabled.declarations).toMatch(/GrayText/i);
    });
  });

  it('does not accept RSuite props or the props the group owns (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
