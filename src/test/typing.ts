import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Typing into the date and time fields in tests. RSuite moves to the next part of a date in the frame after a key;
// `userEvent.type` doesn't wait for it and keeps a selection of its own, which gave different results from run to run.

export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Presses the keys one by one, a frame apart. */
export async function pressKeys(input: HTMLElement, keys: string) {
  for (const key of keys) {
    fireEvent.keyDown(input, { key });
    await nextFrame();
  }
}

/** Clicks the field, as a user does, and types. */
export async function typeDate(input: HTMLElement, keys: string) {
  await userEvent.click(input);
  await nextFrame();
  await pressKeys(input, keys);
}
