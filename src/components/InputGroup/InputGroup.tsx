import { forwardRef } from 'react';
import { InputGroup as RSuiteInputGroup } from 'rsuite';
import type { InputGroupAddonProps, InputGroupButtonProps, InputGroupProps } from './types';

const withClass = (base: string, className?: string) => (className ? `${base} ${className}` : base);

/**
 * An input with text, icons or buttons attached to it. The input keeps its own label.
 *
 * Separate components (`InputGroupAddon`, `InputGroupButton`) instead of RSuite's `InputGroup.Addon`: a Next.js Server
 * Component can render a client component but can't read a property of one.
 *
 * @example
 * <label htmlFor="amount">Amount (₹)</label>
 * <InputGroup>
 *   <InputGroupAddon>₹</InputGroupAddon>
 *   <Input id="amount" />
 * </InputGroup>
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { className, ...rest },
  ref,
) {
  return (
    <RSuiteInputGroup ref={ref} {...rest} className={withClass('mgs-input-group', className)} />
  );
});

/** Text or an icon attached to the input in an `InputGroup`. */
export const InputGroupAddon = forwardRef<HTMLSpanElement, InputGroupAddonProps>(
  function InputGroupAddon({ className, ...rest }, ref) {
    return (
      <RSuiteInputGroup.Addon
        ref={ref}
        {...rest}
        className={withClass('mgs-input-group__addon', className)}
      />
    );
  },
);

/** A button attached to the input in an `InputGroup`. Give an icon-only button an `aria-label`. */
export const InputGroupButton = forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  function InputGroupButton({ className, type = 'button', ...rest }, ref) {
    return (
      <RSuiteInputGroup.Button
        ref={ref}
        {...rest}
        type={type}
        // The click ripple is motion that ignores "reduce motion"; MGS buttons don't use it.
        ripple={false}
        className={withClass('mgs-input-group__button', className)}
      />
    );
  },
);
