import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { devWarning, useDevWarning } from '../../internal/devWarning';
import { useFormReset } from '../../internal/useFormReset';
import { RadioGroupContext, type RadioGroupContextValue } from './context';
import type { RadioGroupProps } from './types';
import './RadioGroup.scss';

/**
 * Several radios that answer one question, where exactly one can be selected. Its value is the selected radio's.
 * Name the group with `aria-labelledby` (the id of its visible heading) or `aria-label`.
 *
 * Built by MGS instead of on RSuite's RadioGroup, which gives its radios no shared `name` unless the app sets one:
 * without it, browsers don't treat them as one group, so arrow keys don't move between the options.
 *
 * @example
 * <p id="delivery">Delivery</p>
 * <RadioGroup aria-labelledby="delivery" name="delivery" value={delivery} onChange={setDelivery}>
 *   <Radio value="standard">Standard</Radio>
 *   <Radio value="express">Express</Radio>
 * </RadioGroup>
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    children,
    value: valueProp,
    defaultValue,
    onChange,
    orientation = 'vertical',
    disabled = false,
    name: nameProp,
    required = false,
    className,
    ...rest
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue ?? null);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledValue;

  const generatedName = useId();
  const name = nameProp ?? generatedName;

  const groupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => groupRef.current as HTMLDivElement, []);

  // A form's Reset button puts the radios back to how they started. An uncontrolled group goes back to its starting
  // value too, so its value stays what the screen shows. (A controlled group's value belongs to the app.)
  const startValue = useRef(uncontrolledValue);
  useFormReset(groupRef, () => setUncontrolledValue(startValue.current), !controlled);

  // A form submits the radios under their name, also a generated one ("_r_0_=express").
  useEffect(() => {
    if (nameProp === undefined && groupRef.current?.closest('form')) {
      devWarning(
        'a RadioGroup inside a <form> needs a name: without it, the form submits the value under a generated name.',
      );
    }
  }, [nameProp]);

  useDevWarning(
    rest['aria-label'] === undefined && rest['aria-labelledby'] === undefined,
    'a RadioGroup needs an accessible name: add aria-labelledby (the id of its heading) or aria-label.',
  );

  const context = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      name,
      disabled,
      required,
      select(itemValue: string, event: ChangeEvent<HTMLInputElement>) {
        if (!controlled) setUncontrolledValue(itemValue);
        onChange?.(itemValue, event);
      },
    }),
    [value, name, disabled, required, controlled, onChange],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        ref={groupRef}
        {...rest}
        role="radiogroup"
        aria-required={required || undefined}
        className={className ? `mgs-radio-group ${className}` : 'mgs-radio-group'}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
