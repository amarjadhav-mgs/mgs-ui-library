import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  AutoComplete,
  Button,
  Checkbox,
  CheckboxGroup,
  FormField,
  Input,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Textarea,
} from '@mgs/ui';
import { source } from '../../stories/shared';

const form = { maxWidth: 420 } as const;

const countries = [
  { value: 'in', label: 'India' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
];
const modules = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'reports', label: 'Reports' },
];

const meta = {
  title: 'Patterns/FormField',
  component: FormField,
  // Docs come from FormField.mdx.
  tags: ['!autodocs'],
  args: { label: 'Email', children: <Input type="email" /> },
  parameters: {
    // Only the MGS API; native <div> attributes also work but would flood the table.
    controls: { include: ['label', 'help', 'error', 'required', 'controlId'] },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The visible label. It names the control for screen readers.',
      table: { type: { summary: 'ReactNode' } },
    },
    help: {
      control: 'text',
      description: 'A hint under the control.',
      table: { type: { summary: 'ReactNode' } },
    },
    error: {
      control: 'text',
      description: 'The error message. While it is set, the control is marked invalid.',
      table: { type: { summary: 'ReactNode' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required, for the eye and for screen readers.',
      table: { defaultValue: { summary: 'false' } },
    },
    controlId: {
      control: 'text',
      description: 'The `id` of the control. Without it, one is generated.',
    },
    children: {
      control: false,
      description: 'The control: one MGS component.',
      table: { type: { summary: 'ReactElement' } },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any prop in the Controls panel. */
export const Playground: Story = {
  args: {
    label: 'Email',
    help: 'We use it for invoices',
    error: '',
    required: false,
  },
  render: (args) => (
    <div style={form}>
      <FormField {...args}>
        <Input type="email" autoComplete="email" />
      </FormField>
    </div>
  ),
};

export const Basic: Story = {
  parameters: source(`<FormField label="Email" help="We use it for invoices">
  <Input type="email" name="email" autoComplete="email" />
</FormField>`),
  render: () => (
    <div style={form}>
      <FormField label="Email" help="We use it for invoices">
        <Input type="email" name="email" autoComplete="email" />
      </FormField>
    </div>
  ),
};

/** `required` marks the field; `error` shows the message, marks the control invalid and gives it the error border. */
export const Validation: Story = {
  parameters: source(`<FormField label="Company name" required>
  <Input name="company" />
</FormField>

<FormField label="Email" error="Enter an email like name@company.com" required>
  <Input type="email" defaultValue="asha@" />
</FormField>

<FormField
  label="Password"
  help="At least 12 characters"
  error="The password is too short"
>
  <PasswordInput defaultValue="secret" />
</FormField>`),
  render: () => (
    <Stack gap="lg" style={form}>
      <FormField label="Company name" required>
        <Input name="company" />
      </FormField>
      <FormField label="Email" error="Enter an email like name@company.com" required>
        <Input type="email" defaultValue="asha@" />
      </FormField>
      <FormField label="Password" help="At least 12 characters" error="The password is too short">
        <PasswordInput defaultValue="secret" autoComplete="new-password" />
      </FormField>
    </Stack>
  ),
};

/** Every MGS control works in a FormField. Each is connected to the label in the way that fits it. */
export const Controls: Story = {
  parameters: source(`<FormField label="Name"><Input /></FormField>
<FormField label="Notes"><Textarea /></FormField>
<FormField label="Quantity"><NumberInput min={0} /></FormField>
<FormField label="City"><AutoComplete suggestions={cities} /></FormField>
<FormField label="Country"><Select options={countries} /></FormField>
<FormField label="Modules"><MultiSelect options={modules} /></FormField>
<FormField label="Delivery">
  <RadioGroup>
    <Radio value="standard">Standard</Radio>
    <Radio value="express">Express</Radio>
  </RadioGroup>
</FormField>
<FormField label="Notify me by">
  <CheckboxGroup>
    <Checkbox value="email">Email</Checkbox>
    <Checkbox value="sms">SMS</Checkbox>
  </CheckboxGroup>
</FormField>
<FormField label="Terms"><Checkbox>I accept the terms of service</Checkbox></FormField>
<FormField label="Notifications"><Switch>Email me about new orders</Switch></FormField>`),
  render: () => (
    <Stack gap="lg" style={form}>
      <FormField label="Name">
        <Input autoComplete="name" />
      </FormField>
      <FormField label="Notes">
        <Textarea />
      </FormField>
      <FormField label="Quantity">
        <NumberInput min={0} />
      </FormField>
      <FormField label="City">
        <AutoComplete suggestions={['Mumbai', 'Nashik', 'Pune']} />
      </FormField>
      <FormField label="Country">
        <Select options={countries} placeholder="Choose a country" />
      </FormField>
      <FormField label="Modules">
        <MultiSelect options={modules} placeholder="Choose modules" />
      </FormField>
      <FormField label="Delivery">
        <RadioGroup name="delivery" defaultValue="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </FormField>
      <FormField label="Notify me by">
        <CheckboxGroup name="channels">
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </CheckboxGroup>
      </FormField>
      <FormField label="Terms">
        <Checkbox name="terms">I accept the terms of service</Checkbox>
      </FormField>
      <FormField label="Notifications">
        <Switch name="notify">Email me about new orders</Switch>
      </FormField>
    </Stack>
  ),
};

/**
 * A whole form built from `@mgs/ui` only: fields in a `Stack`, validation on submit, errors on the fields they
 * belong to, and focus on the first field with an error.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters:
    source(`const [values, setValues] = useState({ name: '', country: null, plan: null, terms: false });
const [errors, setErrors] = useState({});

<form noValidate onSubmit={(event) => {
  event.preventDefault();
  const next = validate(values);
  setErrors(next);
  const first = Object.keys(next)[0];
  if (first) document.getElementById(first)?.focus();
}}>
  <Stack gap="lg">
    <FormField label="Company name" controlId="name" error={errors.name} required>
      <Input name="name" value={values.name} onChange={(name) => setValues({ ...values, name })} />
    </FormField>
    <FormField label="Country" controlId="country" error={errors.country} required>
      <Select name="country" options={countries} value={values.country}
        onChange={(country) => setValues({ ...values, country })} />
    </FormField>
    <FormField label="Plan" error={errors.plan} required>
      <RadioGroup name="plan" value={values.plan} onChange={(plan) => setValues({ ...values, plan })}>
        <Radio value="basic">Basic</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
    </FormField>
    <FormField label="Terms" controlId="terms" error={errors.terms} required>
      <Checkbox name="terms" checked={values.terms} onChange={(terms) => setValues({ ...values, terms })}>
        I accept the terms of service
      </Checkbox>
    </FormField>
    <Stack direction="row" gap="sm" justify="end">
      <Button>Cancel</Button>
      <Button type="submit" variant="primary">Create account</Button>
    </Stack>
  </Stack>
</form>`),
  render: function Render() {
    const [values, setValues] = useState<{
      name: string;
      country: string | null;
      plan: string | null;
      terms: boolean;
    }>({ name: '', country: null, plan: null, terms: false });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);

    const validate = () => {
      const next: Record<string, string> = {};
      if (values.name.trim() === '') next.name = 'Enter the company name';
      if (values.country === null) next.country = 'Choose a country';
      if (values.plan === null) next.plan = 'Choose a plan';
      if (!values.terms) next.terms = 'Accept the terms to create the account';
      return next;
    };

    return (
      <form
        noValidate
        aria-label="Create account"
        style={form}
        onSubmit={(event) => {
          event.preventDefault();
          const next = validate();
          setErrors(next);
          setSaved(Object.keys(next).length === 0);
          const first = ['name', 'country', 'terms'].find((id) => id in next);
          if (first) document.getElementById(first)?.focus();
        }}
      >
        <Stack gap="lg">
          <FormField label="Company name" controlId="name" error={errors.name} required>
            <Input
              name="name"
              autoComplete="organization"
              value={values.name}
              onChange={(name) => setValues({ ...values, name })}
            />
          </FormField>
          <FormField label="Country" controlId="country" error={errors.country} required>
            <Select
              name="country"
              options={countries}
              placeholder="Choose a country"
              value={values.country}
              onChange={(country) => setValues({ ...values, country })}
            />
          </FormField>
          <FormField label="Plan" error={errors.plan} required>
            <RadioGroup
              name="plan"
              orientation="horizontal"
              value={values.plan}
              onChange={(plan) => setValues({ ...values, plan })}
            >
              <Radio value="basic">Basic</Radio>
              <Radio value="team">Team</Radio>
              <Radio value="business">Business</Radio>
            </RadioGroup>
          </FormField>
          <FormField label="Terms" controlId="terms" error={errors.terms} required>
            <Checkbox
              name="terms"
              checked={values.terms}
              onChange={(terms) => setValues({ ...values, terms })}
            >
              I accept the terms of service
            </Checkbox>
          </FormField>
          <Stack direction="row" gap="sm" justify="end">
            <Button>Cancel</Button>
            <Button type="submit" variant="primary">
              Create account
            </Button>
          </Stack>
          {saved && <output style={{ fontSize: 14 }}>Account created</output>}
        </Stack>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const submit = canvas.getByRole('button', { name: 'Create account' });
    const name = canvas.getByRole('textbox', { name: /Company name/ });
    const country = canvas.getByRole('combobox', { name: /Country/ });
    const plan = canvas.getByRole('radiogroup', { name: /Plan/ });
    const terms = canvas.getByRole('checkbox', { name: 'I accept the terms of service' });

    await userEvent.click(submit);
    await expect(name).toHaveFocus();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAccessibleDescription('Enter the company name');
    await expect(country).toHaveAccessibleDescription(/Choose a country/);
    await expect(plan).toHaveAccessibleDescription('Choose a plan');
    await expect(terms).toHaveAccessibleDescription('Accept the terms to create the account');

    await userEvent.type(name, 'Acme Traders');
    await userEvent.click(country);
    await userEvent.click(await page.findByRole('option', { name: 'India' }));
    await userEvent.click(canvas.getByRole('radio', { name: 'Team' }));
    await userEvent.click(terms);
    await userEvent.click(submit);
    await expect(canvas.getByText('Account created')).toBeInTheDocument();
    await expect(name).not.toHaveAttribute('aria-invalid');
    await expect(canvas.queryByText('Choose a country')).not.toBeInTheDocument();
  },
};

/**
 * The label names the control, the error and the help describe it, and `required` is said too. A click on the label
 * focuses the control.
 */
export const Accessibility: Story = {
  parameters:
    source(`<FormField label="Email" help="We use it for invoices" error="Enter an email" required>
  <Input type="email" />
</FormField>

<FormField label="Country" required>
  <Select options={countries} />
</FormField>`),
  render: () => (
    <Stack gap="lg" style={form}>
      <FormField label="Email" help="We use it for invoices" error="Enter an email" required>
        <Input type="email" autoComplete="email" />
      </FormField>
      <FormField label="Country" required>
        <Select options={countries} placeholder="Choose a country" />
      </FormField>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole('textbox', { name: /Email/ });
    await expect(email).toBeRequired();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    // The error is read before the help.
    await expect(email).toHaveAccessibleDescription('Enter an email We use it for invoices');
    await userEvent.tab();
    await expect(email).toHaveFocus();

    const country = canvas.getByRole('combobox', { name: /Country/ });
    await expect(country).toHaveAttribute('aria-required', 'true');
    await userEvent.tab();
    await expect(country).toHaveFocus();
  },
};
