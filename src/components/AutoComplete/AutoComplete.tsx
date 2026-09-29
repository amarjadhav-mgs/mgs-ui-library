import { forwardRef, useId, useMemo, useState, type SyntheticEvent } from 'react';
import { AutoComplete as RSuiteAutoComplete } from 'rsuite';
import { useInputGroupDisabled } from '../InputGroup/context';
import type { AutoCompleteProps } from './types';
import './AutoComplete.scss';

const showAll = () => true;

/**
 * A text field that suggests texts while the user types. The value is the text in the field: the user can choose a
 * suggestion or type something else. For a choice from a fixed list, use `Select`.
 *
 * Built on RSuite's AutoComplete, which provides the list, its position and the keyboard.
 * Label it with `<label htmlFor>` and `id` (or `aria-label`); a placeholder is not a label.
 *
 * `className` and `style` go to the root element; every other attribute, and `ref`, go to the `<input>`.
 *
 * @example
 * <label htmlFor="city">City</label>
 * <AutoComplete id="city" suggestions={cities} value={city} onChange={setCity} />
 */
export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  {
    suggestions,
    value,
    defaultValue,
    onChange,
    onSelect,
    filter = true,
    size = 'md',
    disabled: disabledProp = false,
    readOnly = false,
    id: idProp,
    className,
    ...rest
  },
  ref,
) {
  const groupDisabled = useInputGroupDisabled();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  // The same text twice would be two options with one value.
  const data = useMemo(() => [...new Set(suggestions)], [suggestions]);

  // The suggestion the arrow keys are on. RSuite names the field's own text as the active option, also while the list
  // is closed, and then `aria-activedescendant` points at an element that doesn't exist.
  const [active, setActive] = useState<string | null>(null);

  return (
    <RSuiteAutoComplete
      // The handlers are typed for the <input>; RSuite types them for any element.
      {...(rest as Record<string, unknown>)}
      id={id}
      inputRef={ref}
      aria-activedescendant={active === null ? undefined : `${id}-opt-${active}`}
      className={className ? `mgs-auto-complete ${className}` : 'mgs-auto-complete'}
      // A read-only field suggests nothing.
      data={readOnly ? [] : data}
      filterBy={filter ? undefined : showAll}
      value={value}
      defaultValue={defaultValue}
      onMenuFocus={(focused: string) => setActive(focused)}
      onClose={() => setActive(null)}
      onChange={(next: string, event: SyntheticEvent) => {
        setActive(null);
        onChange?.(next, event);
      }}
      onSelect={(chosen: string, _item, event) => onSelect?.(chosen, event)}
      size={size}
      disabled={disabledProp || groupDisabled}
      readOnly={readOnly}
    />
  );
});
