import { forwardRef, type ChangeEvent, type MouseEvent } from 'react';
import { useDevWarning } from '../../internal/devWarning';
import type { SwitchProps } from './types';
import './Switch.scss';

/**
 * An on/off control for a setting that takes effect immediately ("Email notifications"). For a choice that is saved
 * with a form, use a Checkbox.
 *
 * Built by MGS on a native `<input type="checkbox" role="switch">` instead of on RSuite's Toggle, which drops the
 * app's `aria-label`, points `ref` at the wrapper, and while `loading` still lets an uncontrolled toggle change.
 *
 * `className` and `style` go to the root element (the `<label>`); every other attribute, and `ref`, go to the `<input>`.
 *
 * @example
 * <Switch checked={notify} onChange={setNotify}>Email notifications</Switch>
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    children,
    checked,
    defaultChecked,
    onChange,
    size = 'md',
    loading = false,
    disabled = false,
    className,
    style,
    onClick,
    ...rest
  },
  ref,
) {
  const hasLabel =
    children !== undefined && children !== null && children !== false && children !== '';
  useDevWarning(
    !hasLabel &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined &&
      rest.title === undefined &&
      // With an id, a <label htmlFor> elsewhere may name it.
      rest.id === undefined,
    'a Switch without a label needs an accessible name: add children, aria-label or aria-labelledby.',
  );
  // React's own warning for this never shows: the <input> always gets the handler below.
  useDevWarning(
    checked !== undefined && onChange === undefined && !disabled,
    'a Switch with `checked` and no `onChange` can never change: add onChange, or use defaultChecked.',
  );

  // While loading, the switch isn't `disabled`, so it keeps keyboard focus; the click (also the one a label click or
  // Space makes) is cancelled, so the native checkbox doesn't change.
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (loading) event.preventDefault();
    else onClick?.(event);
  };

  return (
    <label
      className={className ? `mgs-switch ${className}` : 'mgs-switch'}
      style={style}
      data-size={size}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
    >
      <span className="mgs-switch__control">
        <input
          ref={ref}
          {...rest}
          type="checkbox"
          // The native checked state is the switch's state: no aria-checked, which could disagree with it.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role, jsx-a11y/role-has-required-aria-props
          role="switch"
          className="mgs-switch__input"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-busy={loading || undefined}
          onClick={handleClick}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            // React reports a change on the click itself, before the cancelled click puts the checkbox back.
            if (!loading) onChange?.(event.target.checked, event);
          }}
        />
        {/* The track and thumb that are drawn; the <input> is invisible, on top of them. */}
        <span className="mgs-switch__track" aria-hidden="true">
          <span className="mgs-switch__thumb" />
        </span>
      </span>
      {hasLabel && <span className="mgs-switch__label">{children}</span>}
    </label>
  );
});
