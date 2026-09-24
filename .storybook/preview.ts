import type { Preview } from '@storybook/react-vite';
import '../src/styles/tokens.scss';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Show axe violations as failures in the Accessibility panel.
      test: 'error',
    },
  },
};

export default preview;
