import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useDevWarning } from '../../internal/devWarning';
import { CheckboxGroupContext, type CheckboxGroupContextValue } from './context';
import type { CheckboxGroupProps } from './types';
import './CheckboxGroup.scss';

/**
 * Several checkboxes that answer one question, with one value: the list of the checked ones.
 * Name the group with `aria-labelledby` (the id of its visible heading) or `aria-label`.
 *
 * @example
 * <p id="channels">Notify me by</p>
 * <CheckboxGroup aria-labelledby="channels" value={channels} onChange={setChannels}>
 *   <Checkbox value="email">Email</Checkbox>
 *   <Checkbox value="sms">SMS</Checkbox>
 * </CheckboxGroup>
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  {
    children,
    value: valueProp,
    defaultValue = [],
    onChange,
    orientation = 'vertical',
    disabled = false,
    name,
    className,
    ...rest
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledValue;

  const groupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => groupRef.current as HTMLDivElement, []);

  // A form's Reset button puts the checkboxes back to how they started, without telling React. An uncontrolled group
  // goes back to its starting value too, so its value stays what the screen shows. (A controlled group's value
  // belongs to the app.)
  const startValue = useRef(defaultValue);
  useEffect(() => {
    const form = groupRef.current?.closest('form');
    if (!form || controlled) return;
    const reset = () => setUncontrolledValue(startValue.current);
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [controlled]);

  useDevWarning(
    rest['aria-label'] === undefined && rest['aria-labelledby'] === undefined,
    'a CheckboxGroup needs an accessible name: add aria-labelledby (the id of its heading) or aria-label.',
  );

  const context = useMemo<CheckboxGroupContextValue>(
    () => ({
      value,
      disabled,
      name,
      toggle(itemValue: string, checked: boolean, event: ChangeEvent<HTMLInputElement>) {
        const others = value.filter((item) => item !== itemValue);
        const next = checked ? [...others, itemValue] : others;
        if (!controlled) setUncontrolledValue(next);
        onChange?.(next, event);
      },
    }),
    [value, disabled, name, controlled, onChange],
  );

  return (
    <CheckboxGroupContext.Provider value={context}>
      <div
        ref={groupRef}
        {...rest}
        // A <div>, not a <fieldset>: browsers give a fieldset a border, padding and a minimum width that differ
        // between them, and lay out its <legend> in a way CSS can't fully change.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="group"
        className={className ? `mgs-checkbox-group ${className}` : 'mgs-checkbox-group'}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
});
