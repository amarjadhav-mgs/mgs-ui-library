import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../test/axe';
import { Button } from './Button';

describe('Button', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its label with default variant and size classes', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('mgs-button', 'mgs-button--primary', 'mgs-button--md');
  });

  it('defaults to type="button" so it does not submit forms', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies variant, size, fullWidth and merges className', () => {
    render(
      <Button variant="danger" size="lg" fullWidth className="custom">
        Delete
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'mgs-button--danger',
      'mgs-button--lg',
      'mgs-button--full-width',
      'custom',
    );
  });

  it('forwards ref to the native button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes native attributes through', () => {
    render(
      <Button data-testid="save" title="Ctrl+S">
        Save
      </Button>,
    );
    expect(screen.getByTestId('save')).toHaveAttribute('title', 'Ctrl+S');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  describe('loading', () => {
    it('is busy and aria-disabled but stays focusable', async () => {
      render(<Button loading>Saving…</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toBeDisabled();

      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('blocks clicks', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Saving…
        </Button>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not submit its form', async () => {
      const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
      render(
        <form onSubmit={(e) => onSubmit(e.nativeEvent as SubmitEvent)}>
          <Button type="submit" loading>
            Saving…
          </Button>
        </form>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('overlays a spinner and keeps the content, so width and accessible name stay the same', () => {
      const { container } = render(
        <Button loading leftIcon={<svg data-testid="icon" />}>
          Save
        </Button>,
      );
      expect(container.querySelector('.mgs-button__spinner')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('mgs-button--loading');
    });

    it('is natively disabled when both loading and disabled', () => {
      render(
        <Button loading disabled>
          Save
        </Button>,
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('icon-only', () => {
    it('warns in development when there is no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button leftIcon={<span>✕</span>} />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
    });

    it('does not warn when aria-label is provided', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button aria-label="Close" leftIcon={<span>✕</span>} />);
      expect(warn).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <div>
        <Button>Save</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button loading>Saving…</Button>
        <Button aria-label="Close" leftIcon={<span>✕</span>} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
