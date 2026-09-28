import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Input, PasswordInput } from '@mgs/ui';
import { column, Field, source } from '../../stories/shared';

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  // Docs come from PasswordInput.mdx.
  tags: ['!autodocs'],
  args: { onChange: fn() },
  parameters: {
    controls: { include: ['size', 'autoComplete', 'placeholder', 'disabled', 'readOnly'] },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      description: 'Size, the same scale as Input and Button.',
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    autoComplete: {
      control: 'inline-radio',
      options: ['current-password', 'new-password'],
      description: 'What password managers fill: `new-password` on sign-up and password change.',
      table: { defaultValue: { summary: "'current-password'" } },
    },
    placeholder: { control: 'text', description: 'An example value. Not a label.' },
    disabled: {
      control: 'boolean',
      description: "Can't be focused or edited, including the show button.",
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Focusable, not editable.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: {
      description: '`(value: string, event) => void`: the value comes first.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel; the eye button shows the password. */
export const Playground: Story = {
  args: { size: 'md', autoComplete: 'current-password', disabled: false, readOnly: false },
  render: (args) => (
    <div style={column}>
      <Field label="Password">{(id) => <PasswordInput {...args} id={id} />}</Field>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<label htmlFor="password">Password</label>
<PasswordInput id="password" name="password" />`),
  render: () => (
    <div style={column}>
      <Field label="Password">{(id) => <PasswordInput id={id} name="password" />}</Field>
    </div>
  ),
};

export const States: Story = {
  parameters: source(`<PasswordInput id="password" defaultValue="secret-42" />
<PasswordInput id="current" disabled defaultValue="secret-42" />
<PasswordInput id="new" aria-invalid="true" aria-describedby="new-error" />`),
  render: () => (
    <div style={column}>
      <Field label="Default">{(id) => <PasswordInput id={id} defaultValue="secret-42" />}</Field>
      <Field label="Disabled">
        {(id) => <PasswordInput id={id} disabled defaultValue="secret-42" />}
      </Field>
      <Field label="Invalid">
        {(id) => (
          <>
            <PasswordInput
              id={id}
              autoComplete="new-password"
              defaultValue="abc"
              aria-invalid="true"
              aria-describedby={`${id}-error`}
            />
            <p id={`${id}-error`} style={{ margin: '4px 0 0', fontSize: 13 }}>
              Use at least 8 characters.
            </p>
          </>
        )}
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: source(`<PasswordInput size="sm" aria-label="Small" />
<PasswordInput size="md" aria-label="Medium" />
<PasswordInput size="lg" aria-label="Large" />`),
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8 }}>
          <PasswordInput size={size} aria-label={`Size ${size}`} />
          <Button size={size}>Unlock</Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * A sign-in form (`current-password`) and a change-password form (`new-password`, with the rule linked by
 * `aria-describedby`). Password managers fill the first and suggest a strong password for the second.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`// Sign in
<label htmlFor="user">Email</label>
<Input id="user" type="email" autoComplete="username" />
<label htmlFor="password">Password</label>
<PasswordInput id="password" autoComplete="current-password" />

// Change password
<label htmlFor="new">New password</label>
<PasswordInput
  id="new"
  autoComplete="new-password"
  minLength={8}
  required
  aria-describedby="new-rule"
/>
<p id="new-rule">At least 8 characters.</p>`),
  render: function Render() {
    const [signedIn, setSignedIn] = useState(false);
    return (
      <div
        style={{
          display: 'grid',
          gap: 32,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        <form
          aria-label="Sign in"
          style={column}
          onSubmit={(event) => {
            event.preventDefault();
            setSignedIn(true);
          }}
        >
          <Field label="Email">
            {(id) => <Input id={id} type="email" autoComplete="username" />}
          </Field>
          <Field label="Password">
            {(id) => <PasswordInput id={id} name="password" autoComplete="current-password" />}
          </Field>
          <div>
            <Button type="submit" variant="primary">
              Sign in
            </Button>
          </div>
          <output style={{ fontSize: 14 }}>{signedIn && 'Signed in.'}</output>
        </form>
        <form
          aria-label="Change password"
          style={column}
          onSubmit={(event) => event.preventDefault()}
        >
          <Field label="New password">
            {(id) => (
              <>
                <PasswordInput
                  id={id}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby={`${id}-rule`}
                />
                <p id={`${id}-rule`} style={{ margin: '4px 0 0', fontSize: 13 }}>
                  At least 8 characters.
                </p>
              </>
            )}
          </Field>
          <div>
            <Button type="submit">Change password</Button>
          </div>
        </form>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Password');
    await userEvent.type(password, 'secret-42{Enter}');
    await expect(canvas.getByText('Signed in.')).toBeInTheDocument();
    await expect(canvas.getByLabelText('New password')).toHaveAccessibleDescription(
      'At least 8 characters.',
    );
  },
};

/**
 * Tab reaches the field, then the Show password button; Space or Enter shows and hides the password, and focus stays
 * on the button.
 */
export const Accessibility: Story = {
  parameters: source(`<label htmlFor="password">Password</label>
<PasswordInput id="password" />`),
  render: () => (
    <div style={column}>
      <Field label="Password">{(id) => <PasswordInput id={id} defaultValue="secret-42" />}</Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Password');
    await userEvent.tab();
    await expect(password).toHaveFocus();
    await userEvent.tab();
    const toggle = canvas.getByRole('button', { name: 'Show password' });
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard(' ');
    await expect(password).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(password).toHaveAttribute('type', 'password');
  },
};
