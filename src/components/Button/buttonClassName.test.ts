import { describe, expect, it } from 'vitest';
import { buttonClassName } from './buttonClassName';

describe('buttonClassName', () => {
  it('returns the default button classes', () => {
    expect(buttonClassName()).toBe('mgs-button mgs-button--primary mgs-button--md');
  });

  it('applies options and appends className', () => {
    expect(
      buttonClassName({ variant: 'secondary', size: 'lg', fullWidth: true, className: 'x' }),
    ).toBe('mgs-button mgs-button--secondary mgs-button--lg mgs-button--full-width x');
  });
});
