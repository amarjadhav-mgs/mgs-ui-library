import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Button,
  DatePicker,
  type MgsLocale,
  MgsProvider,
  type MgsTheme,
  PlusIcon,
  TimePicker,
} from '@mgs/ui';
import { source } from '../../stories/shared';

const locales: MgsLocale[] = ['en-GB', 'en-US', 'en-IN'];

// Storybook already wraps every story in an MgsProvider with the toolbar's theme (.storybook/preview.tsx). The stories
// below nest one to show a locale, and pass the toolbar's theme so the two providers never disagree.
const toolbarTheme = (globals: Record<string, unknown>) => globals.theme as MgsTheme;

function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>{children}</div>
  );
}

const meta = {
  title: 'Foundation/MgsProvider',
  component: MgsProvider,
  // Docs come from MgsProvider.mdx.
  tags: ['!autodocs'],
  parameters: {
    controls: { include: ['theme', 'locale'] },
  },
  argTypes: {
    theme: {
      // The toolbar's Theme switch is this prop on the app's MgsProvider; a second control would fight it.
      control: false,
      description:
        'Colour theme for every component. Use the Theme switch in the toolbar to try it.',
      table: {
        type: { summary: "'light' | 'dark' | 'high-contrast'" },
        defaultValue: { summary: "'light'" },
      },
    },
    locale: {
      control: 'inline-radio',
      options: locales,
      description: 'Language and date/time formats for every component.',
      table: {
        type: { summary: "'en-GB' | 'en-US' | 'en-IN'" },
        defaultValue: { summary: "'en-GB'" },
      },
    },
  },
} satisfies Meta<typeof MgsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change the locale: the placeholders and the calendar follow it. The theme is the toolbar's Theme switch. */
export const Playground: Story = {
  args: { locale: 'en-GB' },
  parameters: source(`<MgsProvider locale="en-GB">
  <App />
</MgsProvider>`),
  render: (args, { globals }) => (
    <MgsProvider {...args} theme={toolbarTheme(globals)}>
      <Row>
        <DatePicker aria-label="Due date" />
        <TimePicker aria-label="Start time" />
      </Row>
    </MgsProvider>
  ),
};

/** Wrap the whole app once, at its root. */
export const Basic: Story = {
  parameters: source(`import { MgsProvider } from '@mgs/ui';
import '@mgs/ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <MgsProvider theme="light" locale="en-GB">
    <App />
  </MgsProvider>,
);`),
  render: (_args, { globals }) => (
    <MgsProvider theme={toolbarTheme(globals)} locale="en-GB">
      <Row>
        <DatePicker aria-label="Due date" />
        <Button variant="primary" leftIcon={<PlusIcon />}>
          New order
        </Button>
      </Row>
    </MgsProvider>
  ),
};

/**
 * The same form in each locale: the date and time formats, placeholders, week start and calendar texts follow the
 * locale. A user setting stored by the app can choose the theme and locale at runtime.
 */
export const Advanced: Story = {
  name: 'Advanced examples',
  parameters: source(`// Theme and locale from the signed-in user's settings
const { theme, locale } = useUserSettings();

<MgsProvider theme={theme} locale={locale}>
  <App />
</MgsProvider>`),
  render: (_args, { globals }) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {locales.map((locale) => (
        <section key={locale} aria-label={`Locale ${locale}`}>
          <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>
            <code>locale="{locale}"</code>
          </h3>
          <MgsProvider theme={toolbarTheme(globals)} locale={locale}>
            <Row>
              <DatePicker aria-label={`Due date (${locale})`} />
              <TimePicker aria-label={`Start time (${locale})`} />
            </Row>
          </MgsProvider>
        </section>
      ))}
    </div>
  ),
};

/**
 * The provider adds no elements of its own: focus order and names come from the components inside it. Tab reaches the
 * date input, whose placeholder shows the locale's format.
 */
export const Accessibility: Story = {
  parameters: source(`<MgsProvider locale="en-US">
  <DatePicker aria-label="Due date" />
</MgsProvider>`),
  render: (_args, { globals }) => (
    <MgsProvider theme={toolbarTheme(globals)} locale="en-US">
      <DatePicker aria-label="Due date" />
    </MgsProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: 'Due date' });
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('placeholder', 'MM/dd/yyyy');
  },
};
