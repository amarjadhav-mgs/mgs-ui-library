import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  BellIcon,
  Button,
  EmailIcon,
  RadioCard,
  RadioGroup,
  UserIcon,
  UsersIcon,
  WarningIcon,
} from '@mgs/ui';
import { column, labelStyle, source } from '../../stories/shared';

// Error messages: the text and icon carry the meaning (the error colour for text comes with FormField).
const errorText = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  margin: '4px 0 0',
  fontSize: 13,
} as const;

const heading = { ...labelStyle, margin: '0 0 4px' } as const;
const wide = { display: 'grid', gap: 16, maxWidth: 560 } as const;

const plans = [
  { value: 'basic', name: 'Basic', details: '5 users, 10 GB storage, email support' },
  { value: 'team', name: 'Team', details: '25 users, 100 GB storage, phone support' },
  {
    value: 'business',
    name: 'Business',
    details: 'Unlimited users, 1 TB storage, a named contact',
  },
];

const meta = {
  title: 'Components/RadioCard',
  component: RadioCard,
  // Docs come from RadioCard.mdx.
  tags: ['!autodocs'],
  args: { value: 'team' },
  parameters: {
    // Only the MGS API; native <input> attributes also work but would flood the table.
    controls: { include: ['value', 'children', 'description', 'icon', 'disabled'] },
  },
  argTypes: {
    value: {
      control: 'text',
      description: "What the card stands for: the `RadioGroup`'s value when it is selected.",
      table: { type: { summary: 'string' } },
    },
    children: {
      control: 'text',
      description: 'The title of the card. It names the radio for screen readers.',
    },
    description: {
      control: 'text',
      description: 'More about the option, under the title.',
      table: { type: { summary: 'ReactNode' } },
    },
    icon: {
      control: false,
      description: 'A decorative icon before the title.',
      table: { type: { summary: 'ReactNode' } },
    },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or selected.",
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof RadioCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. The second card is the one the controls change. */
export const Playground: Story = {
  args: {
    value: 'team',
    children: 'Team',
    description: '25 users, 100 GB storage, phone support',
    disabled: false,
  },
  render: (args) => (
    <div style={column}>
      <div>
        <p id="playground-plan" style={heading}>
          Plan
        </p>
        <RadioGroup aria-labelledby="playground-plan" defaultValue="basic">
          <RadioCard value="basic" description="5 users, 10 GB storage, email support">
            Basic
          </RadioCard>
          <RadioCard {...args} />
        </RadioGroup>
      </div>
    </div>
  ),
};

/** A RadioCard is always inside a `RadioGroup`, which holds the value. */
export const Basic: Story = {
  parameters: source(`<p id="plan">Plan</p>
<RadioGroup aria-labelledby="plan" name="plan" defaultValue="basic">
  <RadioCard value="basic" description="5 users, 10 GB storage, email support">Basic</RadioCard>
  <RadioCard value="team" description="25 users, 100 GB storage, phone support">Team</RadioCard>
</RadioGroup>`),
  render: () => (
    <div style={column}>
      <div>
        <p id="basic-plan" style={heading}>
          Plan
        </p>
        <RadioGroup aria-labelledby="basic-plan" name="plan" defaultValue="basic">
          <RadioCard value="basic" description="5 users, 10 GB storage, email support">
            Basic
          </RadioCard>
          <RadioCard value="team" description="25 users, 100 GB storage, phone support">
            Team
          </RadioCard>
        </RadioGroup>
      </div>
    </div>
  ),
};

/** Selected, disabled, and invalid (`aria-invalid="true"` on the group). */
export const States: Story = {
  parameters: source(`<RadioGroup aria-label="States" defaultValue="selected">
  <RadioCard value="unselected" description="Not chosen">Unselected</RadioCard>
  <RadioCard value="selected" description="The chosen option">Selected</RadioCard>
  <RadioCard value="disabled" disabled description="Not available on this contract">Disabled</RadioCard>
</RadioGroup>

<RadioGroup aria-label="Disabled and selected" disabled defaultValue="selected">
  <RadioCard value="selected" description="Chosen, and can't be changed">Disabled, selected</RadioCard>
</RadioGroup>

<RadioGroup aria-label="Invalid" aria-invalid="true" aria-describedby="plan-error">
  <RadioCard value="basic" description="5 users">Basic</RadioCard>
  <RadioCard value="team" description="25 users">Team</RadioCard>
</RadioGroup>
<p id="plan-error">Choose a plan</p>`),
  render: () => (
    <div style={column}>
      <RadioGroup aria-label="States" defaultValue="selected">
        <RadioCard value="unselected" description="Not chosen">
          Unselected
        </RadioCard>
        <RadioCard value="selected" description="The chosen option">
          Selected
        </RadioCard>
        <RadioCard value="disabled" disabled description="Not available on this contract">
          Disabled
        </RadioCard>
      </RadioGroup>
      <RadioGroup aria-label="Disabled and selected" disabled defaultValue="selected">
        <RadioCard value="selected" description="Chosen, and can't be changed">
          Disabled, selected
        </RadioCard>
      </RadioGroup>
      <div>
        <RadioGroup aria-label="Invalid" aria-invalid="true" aria-describedby="states-plan-error">
          <RadioCard value="basic" description="5 users">
            Basic
          </RadioCard>
          <RadioCard value="team" description="25 users">
            Team
          </RadioCard>
        </RadioGroup>
        <p id="states-plan-error" style={errorText}>
          <WarningIcon /> Choose a plan
        </p>
      </div>
    </div>
  ),
};

/** An icon before the title. It is decorative: the title says what the option is. */
export const WithIcon: Story = {
  name: 'With icon',
  parameters: source(`<RadioGroup aria-label="User type" defaultValue="internal">
  <RadioCard value="internal" icon={<UserIcon />} description="Works for the company; signs in with a company account">
    Internal user
  </RadioCard>
  <RadioCard value="external" icon={<UsersIcon />} description="A customer or partner; invited by email">
    External user
  </RadioCard>
</RadioGroup>`),
  render: () => (
    <div style={column}>
      <RadioGroup aria-label="User type" defaultValue="internal">
        <RadioCard
          value="internal"
          icon={<UserIcon />}
          description="Works for the company; signs in with a company account"
        >
          Internal user
        </RadioCard>
        <RadioCard
          value="external"
          icon={<UsersIcon />}
          description="A customer or partner; invited by email"
        >
          External user
        </RadioCard>
      </RadioGroup>
    </div>
  ),
};

/** A title alone, for short options. */
export const TitleOnly: Story = {
  name: 'Title only',
  parameters:
    source(`<RadioGroup aria-label="Notify me by" orientation="horizontal" defaultValue="email">
  <RadioCard value="email" icon={<EmailIcon />}>Email</RadioCard>
  <RadioCard value="push" icon={<BellIcon />}>Push notification</RadioCard>
</RadioGroup>`),
  render: () => (
    <div style={wide}>
      <RadioGroup aria-label="Notify me by" orientation="horizontal" defaultValue="email">
        <RadioCard value="email" icon={<EmailIcon />}>
          Email
        </RadioCard>
        <RadioCard value="push" icon={<BellIcon />}>
          Push notification
        </RadioCard>
      </RadioGroup>
    </div>
  ),
};

/** Next to each other: the cards share the row equally, and wrap onto the next line when the row gets too narrow. */
export const Horizontal: Story = {
  parameters:
    source(`<RadioGroup aria-labelledby="plan" orientation="horizontal" defaultValue="team">
  <RadioCard value="basic" description="5 users, 10 GB storage">Basic</RadioCard>
  <RadioCard value="team" description="25 users, 100 GB storage">Team</RadioCard>
  <RadioCard value="business" description="Unlimited users, 1 TB storage">Business</RadioCard>
</RadioGroup>`),
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <p id="horizontal-plan" style={heading}>
        Plan
      </p>
      <RadioGroup aria-labelledby="horizontal-plan" orientation="horizontal" defaultValue="team">
        <RadioCard value="basic" description="5 users, 10 GB storage">
          Basic
        </RadioCard>
        <RadioCard value="team" description="25 users, 100 GB storage">
          Team
        </RadioCard>
        <RadioCard value="business" description="Unlimited users, 1 TB storage">
          Business
        </RadioCard>
      </RadioGroup>
    </div>
  ),
};

/**
 * Choosing a plan in a form: cards from an array, a required choice validated on submit, and the error linked to the
 * group with `aria-describedby`.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`const [plan, setPlan] = useState<string | null>(null);
const [error, setError] = useState('');

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  setError(plan === null ? 'Choose a plan' : '');
}}>
  <p id="plan">Plan</p>
  <RadioGroup
    aria-labelledby="plan"
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? 'plan-error' : undefined}
    name="plan"
    required
    value={plan}
    onChange={setPlan}
  >
    {plans.map((plan) => (
      <RadioCard key={plan.value} value={plan.value} description={plan.details}>
        {plan.name}
      </RadioCard>
    ))}
  </RadioGroup>
  {error && <p id="plan-error">{error}</p>}

  <Button type="submit" variant="primary">Assign plan</Button>
</form>`),
  render: function Render() {
    const [plan, setPlan] = useState<string | null>(null);
    const [error, setError] = useState('');
    return (
      <form
        noValidate
        aria-label="Assign plan"
        style={column}
        onSubmit={(event) => {
          event.preventDefault();
          setError(plan === null ? 'Choose a plan' : '');
        }}
      >
        <div>
          <p id="advanced-plan" style={heading}>
            Plan
          </p>
          <RadioGroup
            aria-labelledby="advanced-plan"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'advanced-plan-error' : undefined}
            name="plan"
            required
            value={plan}
            onChange={setPlan}
          >
            {plans.map((option) => (
              <RadioCard key={option.value} value={option.value} description={option.details}>
                {option.name}
              </RadioCard>
            ))}
          </RadioGroup>
          {error && (
            <p id="advanced-plan-error" style={errorText}>
              <WarningIcon /> {error}
            </p>
          )}
        </div>
        <div>
          <Button type="submit" variant="primary">
            Assign plan
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Plan' });
    const submit = canvas.getByRole('button', { name: 'Assign plan' });
    await userEvent.click(submit);
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    const team = canvas.getByRole('radio', { name: 'Team' });
    await userEvent.click(team);
    await expect(team).toBeChecked();
    await expect(team).toHaveAccessibleDescription('25 users, 100 GB storage, phone support');
    await userEvent.click(submit);
    await expect(group).not.toHaveAttribute('aria-invalid');
  },
};

/** The title is the radio's name and the description its description; Tab and the arrow keys work as for Radio. */
export const Accessibility: Story = {
  parameters: source(`<RadioGroup aria-label="Plan" defaultValue="basic">
  <RadioCard value="basic" description="5 users, 10 GB storage">Basic</RadioCard>
  <RadioCard value="team" disabled description="Not available on this contract">Team</RadioCard>
  <RadioCard value="business" description="Unlimited users, 1 TB storage">Business</RadioCard>
</RadioGroup>`),
  render: () => (
    <div style={column}>
      <RadioGroup aria-label="Plan" defaultValue="basic">
        <RadioCard value="basic" description="5 users, 10 GB storage">
          Basic
        </RadioCard>
        <RadioCard value="team" disabled description="Not available on this contract">
          Team
        </RadioCard>
        <RadioCard value="business" description="Unlimited users, 1 TB storage">
          Business
        </RadioCard>
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const basic = canvas.getByRole('radio', { name: 'Basic' });
    const business = canvas.getByRole('radio', { name: 'Business' });
    await expect(basic).toHaveAccessibleDescription('5 users, 10 GB storage');
    await userEvent.tab();
    await expect(basic).toHaveFocus();
    // The disabled card is skipped.
    await userEvent.keyboard('{ArrowDown}');
    await expect(business).toHaveFocus();
    await expect(business).toBeChecked();
    await expect(basic).not.toBeChecked();
  },
};
