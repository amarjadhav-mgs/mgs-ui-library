import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DatePicker, MgsProvider, PlusIcon, TimePicker } from '@mgs/ui';
import { axeViolations } from '../../test/axe';
import { playStory, storiesWithPlay } from '../../test/stories';
import * as stories from './MgsProvider.stories';

const allStories = composeStories(stories);

/** A dark provider, optionally with a second provider nested inside. */
function NestedProviders({ showInner }: { showInner: boolean }) {
  return (
    <MgsProvider theme="dark">
      {showInner && <MgsProvider theme="dark" locale="en-US" />}
    </MgsProvider>
  );
}

// Type-level test, never rendered: `npm run typecheck` fails if any of these becomes accepted.
const rejectedProps = () => (
  <>
    {/* @ts-expect-error RSuite's classPrefix is hidden */}
    <MgsProvider classPrefix="x">A</MgsProvider>
    {/* @ts-expect-error right-to-left is not supported yet */}
    <MgsProvider rtl>B</MgsProvider>
    {/* @ts-expect-error date formats come from the locale */}
    <MgsProvider formatDate={() => ''}>C</MgsProvider>
    {/* @ts-expect-error only the MGS locales are accepted */}
    <MgsProvider locale="fr-FR">D</MgsProvider>
  </>
);

// The theme class lives on <body>, outside Testing Library's cleanup.
afterEach(() => {
  document.body.className = '';
});

describe('MgsProvider stories', () => {
  it.each(Object.entries(allStories))('%s has no axe violations', async (_name, Story) => {
    const { container } = render(<Story />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each(storiesWithPlay(allStories))('%s interactions pass', async (_name, Story) => {
    await expect(playStory(Story)).resolves.toBeUndefined();
  });
});

describe('MgsProvider', () => {
  it('renders its children and no element of its own', () => {
    const { container } = render(
      <MgsProvider>
        <p>Content</p>
      </MgsProvider>,
    );
    expect(container.innerHTML).toBe('<p>Content</p>');
  });

  it('uses the light theme by default', () => {
    render(<MgsProvider>App</MgsProvider>);
    expect(document.body).toHaveClass('rs-theme-light');
  });

  it('switches the theme class on <body> and removes the previous one', () => {
    const { rerender } = render(<MgsProvider theme="dark">App</MgsProvider>);
    expect(document.body).toHaveClass('rs-theme-dark');
    rerender(<MgsProvider theme="high-contrast">App</MgsProvider>);
    expect(document.body).toHaveClass('rs-theme-high-contrast');
    expect(document.body).not.toHaveClass('rs-theme-dark');
  });

  it('en-GB (the default): dd/MM/yyyy and 24-hour time', () => {
    render(
      <MgsProvider>
        <DatePicker label="Date" />
        <TimePicker label="Time" />
      </MgsProvider>,
    );
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', 'dd/MM/yyyy');
    expect(screen.getByLabelText('Time')).toHaveAttribute('placeholder', 'HH:mm');
  });

  it('en-US: MM/dd/yyyy and 12-hour time', () => {
    render(
      <MgsProvider locale="en-US">
        <DatePicker label="Date" />
        <TimePicker label="Time" />
      </MgsProvider>,
    );
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', 'MM/dd/yyyy');
    expect(screen.getByLabelText('Time')).toHaveAttribute('placeholder', 'hh:mm aa');
  });

  it('en-IN: dd/MM/yyyy and 24-hour time, like en-GB', () => {
    render(
      <MgsProvider locale="en-IN">
        <DatePicker label="Date" />
        <TimePicker label="Time" />
      </MgsProvider>,
    );
    expect(screen.getByLabelText('Date')).toHaveAttribute('placeholder', 'dd/MM/yyyy');
    expect(screen.getByLabelText('Time')).toHaveAttribute('placeholder', 'HH:mm');
  });

  it('removes the theme class from <body> when the last provider unmounts', () => {
    const { unmount } = render(<MgsProvider theme="dark">App</MgsProvider>);
    expect(document.body).toHaveClass('rs-theme-dark');
    unmount();
    expect(document.body).not.toHaveClass('rs-theme-dark');
  });

  it('keeps the theme class while another provider is still mounted (nested providers)', () => {
    const { rerender } = render(<NestedProviders showInner />);
    rerender(<NestedProviders showInner={false} />);
    expect(document.body).toHaveClass('rs-theme-dark');
  });

  it('icons inside it inject no <style> tag (CSP-safe; their styles are in styles.css)', () => {
    render(
      <MgsProvider>
        <PlusIcon />
      </MgsProvider>,
    );
    expect(document.head.querySelector('style[data-insert-css="rsuite-icons"]')).toBeNull();
  });

  it('does not accept RSuite props or other locales (checked by TypeScript at compile time)', () => {
    expect(rejectedProps).toBeTypeOf('function');
  });
});
