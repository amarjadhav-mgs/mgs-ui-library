import { forwardRef, type ChangeEvent } from 'react';
import { useDevWarning } from '../../internal/devWarning';
import { useRadioGroup } from '../RadioGroup/context';
import type { RadioProps } from './types';
import './Radio.scss';

/**
 * One option of a `RadioGroup`. The group owns the value: a Radio has no `checked` or `onChange` of its own, and must
 * be inside a `RadioGroup`.
 *
 * Built by MGS on a native `<input type="radio">` instead of on RSuite's Radio, which always overwrites
 * `aria-labelledby` (without a label, with an id that doesn't exist), points `ref` at a wrapper `<div>`, and has a
 * 16px click target when there is no label.
 *
 * `className` and `style` go to the root element (the `<label>`); every other attribute, and `ref`, go to the `<input>`.
 *
 * @example
 * <RadioGroup aria-label="Delivery" value={delivery} onChange={setDelivery}>
 *   <Radio value="standard">Standard</Radio>
 *   <Radio value="express">Express</Radio>
 * </RadioGroup>
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { children, value, disabled: disabledProp = false, className, style, ...rest },
  ref,
) {
  const group = useRadioGroup();
  const disabled = disabledProp || (group?.disabled ?? false);

  useDevWarning(
    group === null,
    'a Radio must be inside a RadioGroup: the group holds the value and makes the arrow keys work.',
  );
  const hasLabel =
    children !== undefined && children !== null && children !== false && children !== '';
  useDevWarning(
    !hasLabel &&
      rest['aria-label'] === undefined &&
      rest['aria-labelledby'] === undefined &&
      rest.title === undefined &&
      // With an id, a <label htmlFor> elsewhere may name it.
      rest.id === undefined,
    'a Radio without a label needs an accessible name: add children, aria-label or aria-labelledby.',
  );

  return (
    <label
      className={className ? `mgs-radio ${className}` : 'mgs-radio'}
      style={style}
      data-disabled={disabled || undefined}
    >
      <span className="mgs-radio__control">
        <input
          ref={ref}
          {...rest}
          type="radio"
          className="mgs-radio__input"
          name={group?.name}
          value={value}
          disabled={disabled}
          required={group?.required}
          // Outside a group (a mistake, warned about above) it is a plain radio that the browser manages.
          {...(group && {
            checked: group.value === value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => group.select(value, event),
          })}
        />
        {/* The circle that is drawn; the <input> is invisible, on top of it, and larger (24 × 24px, WCAG 2.5.8). */}
        <span className="mgs-radio__circle" aria-hidden="true" />
      </span>
      {hasLabel && <span className="mgs-radio__label">{children}</span>}
    </label>
  );
});
