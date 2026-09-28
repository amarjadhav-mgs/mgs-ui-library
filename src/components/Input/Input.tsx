import { forwardRef } from 'react';
import { Input as RSuiteInput } from 'rsuite';
import type { InputProps } from './types';

/** Input with any native `type`. Internal: PasswordInput uses it for `type="password"`; apps use `Input`. */
export type TextInputProps = Omit<InputProps, 'type'> & { type?: string };

/**
 * The shared implementation of Input and PasswordInput.
 * Internal: not exported from '@mgs/ui'.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, readOnly, onFocus, onBlur, onKeyDown, ...rest },
  ref,
) {
  return (
    <RSuiteInput
      ref={ref}
      {...rest}
      readOnly={readOnly}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      // RSuite drops focus, blur and keydown handlers on read-only inputs, but a read-only input can still be focused
      // and used with the keyboard; `inputProps` go straight to the <input>.
      {...(readOnly && { inputProps: { onFocus, onBlur, onKeyDown } })}
      className={className ? `mgs-input ${className}` : 'mgs-input'}
    />
  );
});

/**
 * A single-line text field. Label it with `<label htmlFor>` and `id` (or `aria-label`); a placeholder is not a label.
 *
 * @example
 * <label htmlFor="email">Email</label>
 * <Input id="email" type="email" value={email} onChange={setEmail} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return <TextInput ref={ref} {...props} />;
});
