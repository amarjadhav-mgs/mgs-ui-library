import { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../../icons';
import { TextInput } from '../Input/Input';
import { InputGroup, InputGroupButton } from '../InputGroup';
import type { PasswordInputProps } from './types';

/**
 * A password field with a button that shows or hides the password.
 *
 * Built by MGS instead of on RSuite's PasswordInput, which puts `aria-*`, `required` and `disabled` on a wrapper instead
 * of the `<input>`, keeps its toggle out of the Tab order, and forces `autoComplete="off"`.
 *
 * @example
 * <label htmlFor="password">Password</label>
 * <PasswordInput id="password" autoComplete="current-password" />
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, style, size, disabled, autoComplete = 'current-password', ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    return (
      <InputGroup
        inside
        size={size}
        disabled={disabled}
        className={className ? `mgs-password-input ${className}` : 'mgs-password-input'}
        style={style}
      >
        <TextInput
          ref={ref}
          {...rest}
          disabled={disabled}
          autoComplete={autoComplete}
          type={visible ? 'text' : 'password'}
        />
        {/* A toggle button: its name stays the same and aria-pressed says whether the password is shown. */}
        <InputGroupButton
          className="mgs-password-input__toggle"
          aria-label="Show password"
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((shown) => !shown)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroup>
    );
  },
);
