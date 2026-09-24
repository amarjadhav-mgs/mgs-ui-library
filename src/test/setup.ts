import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import preview from '../../.storybook/preview';

// Stories rendered in tests get the same decorators (RSuite CustomProvider) as in Storybook.
setProjectAnnotations(preview);

afterEach(() => {
  cleanup();
});
