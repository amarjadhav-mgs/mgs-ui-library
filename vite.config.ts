import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Stories and tests import '@mgs/ui' exactly like apps do; here it points at the source.
    alias: [{ find: /^@mgs\/ui$/, replacement: resolve(import.meta.dirname, 'src/index.ts') }],
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    // Consumers minify in their own builds; readable output + maps make debugging easier.
    minify: false,
    sourcemap: true,
    rolldownOptions: {
      // rsuite and @rsuite/icons are dependencies: apps get them installed, so they aren't bundled. Only the exact
      // 'rsuite' import is external; 'rsuite/dist/rsuite.css' is bundled into styles.css.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'rsuite', /^@rsuite\/icons\//],
      output: {
        // Marks every component as a Client Component for React Server Components (Next.js App Router).
        banner: "'use client';",
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
