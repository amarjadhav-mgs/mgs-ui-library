import { createElement, type FunctionComponent } from 'react';
import { render } from '@testing-library/react';

/** A composed story (from `composeStories`): a component, maybe with a `play` function. */
type PlayableStory = FunctionComponent & {
  play?: (context?: { canvasElement?: HTMLElement }) => Promise<void>;
};

/** The stories that have a `play` function, as `[name, story]` pairs for `it.each`. */
export function storiesWithPlay<T extends { play?: unknown }>(
  stories: Record<string, T>,
): [string, T][] {
  return Object.entries(stories).filter(([, story]) => story.play);
}

/**
 * Renders a story and runs its `play` function, as Storybook's Interactions panel does.
 * The story is rendered with Testing Library, so its cleanup unmounts it after the test: nothing stays mounted
 * (a story's `run()` renders outside that cleanup and never unmounts, which leaks providers and effects between tests).
 */
export async function playStory(story: PlayableStory) {
  const { container } = render(createElement(story));
  await story.play?.({ canvasElement: container });
}
