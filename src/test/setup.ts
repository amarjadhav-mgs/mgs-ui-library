import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import preview from '../../.storybook/preview';
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Stories rendered in tests get the same decorators (RSuite CustomProvider) as in Storybook.
setProjectAnnotations(preview);

afterEach(() => {
  cleanup();
});
