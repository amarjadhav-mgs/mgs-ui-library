/** A composed story (from `composeStories`) with a `play` function. */
interface PlayableStory {
  play?: unknown;
  run: (context?: { canvasElement?: HTMLElement }) => Promise<void>;
}

/** The stories that have a `play` function, as `[name, story]` pairs for `it.each`. */
export function storiesWithPlay<T extends PlayableStory>(
  stories: Record<string, T>,
): [string, T][] {
  return Object.entries(stories).filter(([, story]) => story.play);
}

/**
 * Renders a story and runs its `play` function, as Storybook's Interactions panel does.
 * `run()` renders outside Testing Library's cleanup, so the story gets its own container, removed afterwards.
 */
export async function playStory(story: PlayableStory) {
  const canvasElement = document.body.appendChild(document.createElement('div'));
  try {
    await story.run({ canvasElement });
  } finally {
    canvasElement.remove();
  }
}
