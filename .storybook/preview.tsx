import type { Preview } from '@storybook/react-vite';
import { MgsProvider, type MgsTheme } from '@mgs/ui';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'MGS theme',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'high-contrast', title: 'High contrast' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => (
      <MgsProvider theme={context.globals.theme as MgsTheme}>
        <div style={{ padding: 16, background: 'var(--mgs-color-surface)' }}>
          <Story />
        </div>
      </MgsProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Show axe violations as failures in the Accessibility panel.
      test: 'error',
    },
  },
};

export default preview;
