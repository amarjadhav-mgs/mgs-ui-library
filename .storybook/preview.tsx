import type { Preview } from '@storybook/react-vite';
import { CustomProvider } from 'rsuite';
import 'rsuite/dist/rsuite.css';
import '../src/theme/mgs-theme.css';

type Theme = 'light' | 'dark' | 'high-contrast';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'RSuite theme',
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
      <CustomProvider theme={context.globals.theme as Theme}>
        <div style={{ padding: 16, background: 'var(--rs-body)' }}>
          <Story />
        </div>
      </CustomProvider>
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
