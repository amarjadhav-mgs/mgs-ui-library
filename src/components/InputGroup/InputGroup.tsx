import { forwardRef, useMemo } from 'react';
import { InputGroup as RSuiteInputGroup } from 'rsuite';
import { InputGroupContext, useInputGroupDisabled } from './context';
import type { InputGroupAddonProps, InputGroupButtonProps, InputGroupProps } from './types';
import './InputGroup.scss';

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
  { className, disabled: disabledProp = false, ...rest },
  ref,
) {
  // RSuite passes disabled only to direct children; the context reaches MGS controls however they're nested. A group
  // inside a disabled group (NumberInput and PasswordInput are groups) is disabled too.
  const parentDisabled = useInputGroupDisabled();
  const disabled = disabledProp || parentDisabled;
  const context = useMemo(() => ({ disabled }), [disabled]);
  return (
    <InputGroupContext.Provider value={context}>
      <RSuiteInputGroup
        ref={ref}
        {...rest}
        disabled={disabled}
        className={withClass('mgs-input-group', className)}
      />
    </InputGroupContext.Provider>
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
  function InputGroupButton({ className, type = 'button', disabled, ...rest }, ref) {
    const groupDisabled = useInputGroupDisabled();
    return (
      <RSuiteInputGroup.Button
        ref={ref}
        {...rest}
        type={type}
        disabled={disabled || groupDisabled}
        // The click ripple is motion that ignores "reduce motion"; MGS buttons don't use it.
        ripple={false}
        className={withClass('mgs-input-group__button', className)}
      />
    );
  },
);
