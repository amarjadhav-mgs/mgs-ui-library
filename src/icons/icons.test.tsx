import type { ComponentType } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as publicApi from '@mgs/ui';
import * as mgsIcons from './index';
import { axeViolations } from '../test/axe';
import * as stories from './Icons.stories';

const icons = Object.entries(mgsIcons) as [string, ComponentType][];
const publicExports = new Map<string, unknown>(Object.entries(publicApi));

describe('MGS icons', () => {
  it('are all exported from @mgs/ui with an ...Icon name', () => {
    for (const [name, Icon] of icons) {
      expect(name).toMatch(/^[A-Z]\w*Icon$/);
      expect(publicExports.get(name)).toBe(Icon);
    }
  });

  it.each(icons)('%s renders a decorative 1em svg in currentColor', (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('gallery has no axe violations', async () => {
    const { Gallery } = composeStories(stories);
    const { container } = render(<Gallery />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
