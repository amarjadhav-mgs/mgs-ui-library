import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../test/axe';
import { IconButton } from './IconButton';

const icon = <svg data-testid="icon" />;

describe('IconButton', () => {
  it('is named by aria-label and hides the icon from screen readers', () => {
    render(<IconButton icon={icon} aria-label="Close" />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveClass('mgs-button', 'mgs-button--icon-only', 'mgs-button--primary');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports variant, size, className and ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        icon={icon}
        aria-label="Delete"
        variant="danger"
        size="sm"
        className="x"
      />,
    );
    expect(ref.current).toHaveClass('mgs-button--danger', 'mgs-button--sm', 'x');
  });

  it('calls onClick and blocks it while loading', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<IconButton icon={icon} aria-label="Refresh" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<IconButton icon={icon} aria-label="Refresh" onClick={onClick} loading />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not log the missing-label warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<IconButton icon={icon} aria-label="Close" />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('requires aria-label at the type level', () => {
    // @ts-expect-error aria-label is required
    const element = <IconButton icon={icon} />;
    expect(element).toBeTruthy();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <div>
        <IconButton icon={icon} aria-label="Close" variant="ghost" />
        <IconButton icon={icon} aria-label="Delete" variant="danger" loading />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
