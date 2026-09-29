import { forwardRef, useImperativeHandle, useRef, type ChangeEvent } from 'react';
import { useDevWarning } from '../../internal/devWarning';
import { useIsomorphicLayoutEffect } from '../../internal/useIsomorphicLayoutEffect';
import { useCheckboxGroup } from '../CheckboxGroup/context';
import type { CheckboxProps } from './types';
import './Checkbox.scss';

/**
 * A box to check or uncheck: one yes/no choice, or one of several options in a `CheckboxGroup`.
 *
 * Built by MGS on a native `<input type="checkbox">` instead of on RSuite's Checkbox, which always overwrites
 * `aria-labelledby` (a checkbox without a visible label can't be named by other text), points `ref` at a wrapper
 * `<div>`, and has a 16px click target when there is no label.
 *
 * `className` and `style` go to the root element (the `<label>`); every other attribute, and `ref`, go to the `<input>`.
 *
 * @example
 * <Checkbox checked={subscribed} onChange={setSubscribed}>Send me product updates</Checkbox>
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    children,
    checked,
    defaultChecked,
    onChange,
    indeterminate = false,
    value,
    disabled: disabledProp = false,
    name,
    className,
    style,
    ...rest
  },
  ref,
) {
  const group = useCheckboxGroup();
  // A checkbox with a value belongs to the group's value. One without (a "Select all" box) only shares `disabled`.
  const member = group !== null && value !== undefined ? group : null;
  const disabled = disabledProp || (group?.disabled ?? false);

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // HTML has no `indeterminate` attribute, only the DOM property. Set before paint, so no other state flashes, and
  // after every render: the browser clears the property when the user clicks the checkbox.
  useIsomorphicLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  const hasLabel =
    children !== undefined && children !== null && children !== false && children !== '';
  useDevWarning(
    !hasLabel &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined &&
      rest.title === undefined &&
      // With an id, a <label htmlFor> elsewhere may name it.
      rest.id === undefined,
    'a Checkbox without a label needs an accessible name: add children, aria-label or aria-labelledby.',
  );
  // React's own warning for this never shows: the <input> always gets the handler below.
  useDevWarning(
    checked !== undefined && onChange === undefined && !member && !disabled,
    'a Checkbox with `checked` and no `onChange` can never change: add onChange, or use defaultChecked.',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // The click cleared it; it stays what the app sets, also when nothing renders again.
    event.target.indeterminate = indeterminate;
    onChange?.(event.target.checked, event);
    if (member && value !== undefined) member.toggle(value, event.target.checked, event);
  };

  return (
    <label
      className={className ? `mgs-checkbox ${className}` : 'mgs-checkbox'}
      style={style}
      data-disabled={disabled || undefined}
    >
      <span className="mgs-checkbox__control">
        <input
          ref={inputRef}
          {...rest}
          type="checkbox"
          className="mgs-checkbox__input"
          name={name ?? member?.name}
          value={value}
          disabled={disabled}
          {...(member
            ? { checked: member.value.includes(value as string) }
            : { checked, defaultChecked })}
          onChange={handleChange}
        />
        {/* The box that is drawn; the <input> is invisible, on top of it, and larger (24 × 24px, WCAG 2.5.8). */}
        <span className="mgs-checkbox__box" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <path className="mgs-checkbox__mark mgs-checkbox__mark--check" d="M3.5 8.5l3 3 6-6.5" />
            <path className="mgs-checkbox__mark mgs-checkbox__mark--dash" d="M4 8h8" />
          </svg>
        </span>
      </span>
      {hasLabel && <span className="mgs-checkbox__label">{children}</span>}
    </label>
  );
});
