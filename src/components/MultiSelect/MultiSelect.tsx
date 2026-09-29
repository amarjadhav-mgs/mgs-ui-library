import { forwardRef, useId, useImperativeHandle, useMemo, useRef } from 'react';
import { CheckPicker } from 'rsuite';
import { useDevWarning } from '../../internal/devWarning';
import { useInputGroupDisabled } from '../InputGroup/context';
import type { MultiSelectProps } from './types';
import './MultiSelect.scss';

/** Lists with more options than this draw only the options in view, so opening stays fast. */
const VIRTUALIZE_FROM = 100;

/** What RSuite's picker gives as its ref: an object, not an element. */
interface PickerHandle {
  target?: HTMLElement | null;
}

/**
 * A field that opens a list of checkboxes to choose several options from. Its value is the list of the chosen
 * options' values. The field shows the chosen labels and how many there are; the list stays open while choosing.
 * Name it with `aria-labelledby` (the id of its visible label) or `aria-label`.
 *
 * Built on RSuite's CheckPicker, which provides the list, its position, the keyboard and the search. It has the same
 * props as `Select`, with a list as its value.
 *
 * `className` and `style` go to the root element; every other attribute, and `ref`, go to the field (the combobox).
 *
 * @example
 * <span id="tags-label">Tags</span>
 * <MultiSelect aria-labelledby="tags-label" options={tags} value={chosen} onChange={setChosen} />
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect(
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
    'a MultiSelect needs an accessible name: add aria-labelledby (the id of its label) or aria-label.',
  );
  useDevWarning(
    new Set(options.map((option) => option.value)).size !== options.length,
    'two options of a MultiSelect have the same value: give every option a different value.',
  );

  return (
    <CheckPicker<string>
      // RSuite types its ref as its own handle object.
      ref={picker as never}
      {...rest}
      id={id}
      // RSuite points aria-labelledby at its own label element, which MGS doesn't render: only the app's name counts.
      aria-labelledby={rest['aria-labelledby']}
      // The chosen values are the field's description in RSuite; the app's (an error, a hint) is read before it.
      aria-describedby={describedBy ? `${describedBy} ${id}-describe` : `${id}-describe`}
      aria-readonly={readOnly || undefined}
      className={className ? `mgs-multi-select ${className}` : 'mgs-multi-select'}
      data={options}
      groupBy={grouped ? 'group' : undefined}
      disabledItemValues={disabledValues}
      // Long lists only draw the options that are in view.
      virtualized={options.length > VIRTUALIZE_FROM}
      locale={emptyText === undefined ? undefined : { noResultsText: emptyText }}
      value={value}
      defaultValue={defaultValue}
      // Clearing gives an empty list, never null.
      onChange={onChange ? (next, event) => onChange(next ?? [], event) : undefined}
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
      // The chosen options stay where they are in the list: a list that reorders itself is hard to scan.
      sticky={false}
      // Full width, like Input: the layout sets the width.
      block
    />
  );
});
