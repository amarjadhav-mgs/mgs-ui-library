import { createRef } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input, InputGroup, InputGroupAddon, InputGroupButton, SearchIcon } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './InputGroup.stories';

const allStories = composeStories(stories);

/** An Input wrapped in a component, so it isn't a direct child of the group. */
function NestedInput() {
  return <Input aria-label="Nested input" />;
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error xs is not in the MGS size scale */}
    <InputGroup size="xs" />
    {/* @ts-expect-error RSuite reads color as a CSS style prop */}
    <InputGroup color="red" />
    {/* @ts-expect-error parts are separate components (InputGroupAddon), not InputGroup.Addon */}
    <InputGroup.Addon />
    {/* @ts-expect-error the group styles the button; no variant */}
    <InputGroupButton appearance="primary" />
  </>
);

describe('InputGroup stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('InputGroup', () => {
  it('renders a group of size md around the input and add-ons', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon>₹</InputGroupAddon>
        <Input aria-label="Amount" />
      </InputGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group).toHaveClass('mgs-input-group');
    expect(group).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('₹')).toHaveClass('mgs-input-group__addon');
    expect(group).toContainElement(screen.getByLabelText('Amount'));
  });

  it("the input takes the group's size", () => {
    render(
      <InputGroup size="lg">
        <Input aria-label="Amount" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Amount')).toHaveAttribute('data-size', 'lg');
  });

  it('disabled disables the input and the buttons', () => {
    render(
      <InputGroup disabled>
        <Input aria-label="Project" />
        <InputGroupButton>Search</InputGroupButton>
      </InputGroup>,
    );
    expect(screen.getByLabelText('Project')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  it('disabled reaches inputs and buttons however deeply they are nested (RSuite only did direct children)', () => {
    render(
      <InputGroup disabled>
        <>
          <NestedInput />
          <div>
            <InputGroupButton>Search</InputGroupButton>
          </div>
        </>
      </InputGroup>,
    );
    expect(screen.getByLabelText('Nested input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  it('inside puts the add-ons inside the border', () => {
    const { container } = render(
      <InputGroup inside>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <Input aria-label="Search" />
      </InputGroup>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-inside', 'true');
  });

  it('InputGroupButton is a type="button" button that calls onClick', async () => {
    const onClick = vi.fn();
    render(
      <InputGroup>
        <Input aria-label="Project" />
        <InputGroupButton onClick={onClick}>Search</InputGroupButton>
      </InputGroup>,
    );
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('mgs-input-group__button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards refs and native attributes to the group, add-on and button', () => {
    const groupRef = createRef<HTMLDivElement>();
    const addonRef = createRef<HTMLSpanElement>();
    const buttonRef = createRef<HTMLButtonElement>();
    render(
      <InputGroup ref={groupRef} className="custom" data-testid="group">
        <InputGroupAddon ref={addonRef} id="unit">
          kg
        </InputGroupAddon>
        <Input aria-label="Weight" aria-describedby="unit" />
        <InputGroupButton ref={buttonRef} aria-label="Clear weight">
          ×
        </InputGroupButton>
      </InputGroup>,
    );
    expect(groupRef.current).toBe(screen.getByTestId('group'));
    expect(screen.getByTestId('group')).toHaveClass('mgs-input-group', 'custom');
    expect(addonRef.current).toBe(screen.getByText('kg'));
    expect(buttonRef.current).toBe(screen.getByRole('button', { name: 'Clear weight' }));
    // An add-on can describe the input it belongs to.
    expect(screen.getByLabelText('Weight')).toHaveAccessibleDescription('kg');
  });

  it('does not accept RSuite props or dot-notation parts (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
