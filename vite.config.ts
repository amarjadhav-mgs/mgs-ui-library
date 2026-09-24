import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Used by Storybook (via @storybook/react-vite) and Vitest.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
