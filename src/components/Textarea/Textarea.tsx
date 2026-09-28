import { forwardRef } from 'react';
import { Textarea as RSuiteTextarea } from 'rsuite';
import { useInputGroupDisabled } from '../InputGroup/context';
import type { TextareaProps } from './types';
import './Textarea.scss';

/**
 * A multi-line text field. Label it with `<label htmlFor>` and `id` (or `aria-label`).
 *
 * @example
 * <label htmlFor="notes">Notes</label>
 * <Textarea id="notes" autosize minRows={2} maxRows={6} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autosize = false, disabled, readOnly, onFocus, onBlur, onKeyDown, ...rest },
  ref,
) {
  const groupDisabled = useInputGroupDisabled();
  return (
    <RSuiteTextarea
      ref={ref}
      {...rest}
      disabled={disabled || groupDisabled}
      autosize={autosize}
      // RSuite doesn't let users resize by default; a fixed-height textarea can be dragged taller.
      resize={autosize ? 'none' : 'vertical'}
      readOnly={readOnly}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      // RSuite drops focus, blur and keydown handlers on read-only fields; `inputProps` go straight to the element.
      {...(readOnly && { inputProps: { onFocus, onBlur, onKeyDown } })}
      className={className ? `mgs-textarea ${className}` : 'mgs-textarea'}
    />
  );
});
