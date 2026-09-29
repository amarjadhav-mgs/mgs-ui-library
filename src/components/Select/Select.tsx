import { forwardRef, useId, useImperativeHandle, useMemo, useRef } from 'react';
import { SelectPicker } from 'rsuite';
import { useDevWarning } from '../../internal/devWarning';
import { useInputGroupDisabled } from '../InputGroup/context';
import type { SelectProps } from './types';
import './Select.scss';

/** Lists with more options than this draw only the options in view, so opening stays fast. */
const VIRTUALIZE_FROM = 100;

/** What RSuite's picker gives as its ref: an object, not an element. */
interface PickerHandle {
  target?: HTMLElement | null;
}

/**
 * A field that opens a list to choose one option from. Its value is the chosen option's `value`, or `null`.
 * Name it with `aria-labelledby` (the id of its visible label) or `aria-label`: a `<label htmlFor>` can't name it,
 * because the field is not a native form control.
 *
 * Built on RSuite's SelectPicker, which provides the list, its position, the keyboard and the search.
 *
 * `className` and `style` go to the root element; every other attribute, and `ref`, go to the field (the combobox).
 *
 * @example
 * <span id="status-label">Status</span>
 * <Select aria-labelledby="status-label" options={statuses} value={status} onChange={setStatus} />
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    size = 'md',
    searchable = false,
    onSearch,
    emptyText,
    clearable = false,
    loading = false,
    disabled: disabledProp = false,
    readOnly = false,
    open,
    defaultOpen,
    onOpenChange,
    id: idProp,
    className,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const groupDisabled = useInputGroupDisabled();
  const disabled = disabledProp || groupDisabled;
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const picker = useRef<PickerHandle>(null);
  useImperativeHandle(ref, () => picker.current?.target as HTMLDivElement, []);

  const disabledValues = useMemo(
    () => options.filter((option) => option.disabled).map((option) => option.value),
    [options],
  );
  const grouped = useMemo(() => options.some((option) => option.group !== undefined), [options]);

  useDevWarning(
    rest['aria-label'] === undefined && rest['aria-labelledby'] === undefined,
    'a Select needs an accessible name: add aria-labelledby (the id of its label) or aria-label.',
  );
  useDevWarning(
    new Set(options.map((option) => option.value)).size !== options.length,
    'two options of a Select have the same value: give every option a different value.',
  );

  return (
    <SelectPicker<string>
      // RSuite types its ref as its own handle object.
      ref={picker as never}
      {...rest}
      id={id}
      // RSuite points aria-labelledby at its own label element, which MGS doesn't render: only the app's name counts.
      aria-labelledby={rest['aria-labelledby']}
      // The chosen value is the field's description in RSuite; the app's (an error, a hint) is read before it.
      aria-describedby={describedBy ? `${describedBy} ${id}-describe` : `${id}-describe`}
      aria-readonly={readOnly || undefined}
      className={className ? `mgs-select ${className}` : 'mgs-select'}
      data={options}
      groupBy={grouped ? 'group' : undefined}
      disabledItemValues={disabledValues}
      // Long lists only draw the options that are in view.
      virtualized={options.length > VIRTUALIZE_FROM}
      locale={emptyText === undefined ? undefined : { noResultsText: emptyText }}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onSearch={onSearch ? (text: string) => onSearch(text) : undefined}
      placeholder={placeholder}
      size={size}
      searchable={searchable}
      cleanable={clearable}
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      open={open}
      defaultOpen={defaultOpen}
      onOpen={() => onOpenChange?.(true)}
      onClose={() => onOpenChange?.(false)}
      // Full width, like Input: the layout sets the width.
      block
    />
  );
});
