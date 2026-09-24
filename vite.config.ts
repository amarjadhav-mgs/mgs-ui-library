import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Marks every component as a Client Component for React Server Components (Next.js App Router).
        banner: "'use client';",
      },
    },
  },
});
