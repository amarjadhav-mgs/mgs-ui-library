import {
  useId,
  useImperativeHandle,
  useRef,
  type FocusEvent,
  type ForwardedRef,
  type MouseEvent,
} from 'react';
import { useInputGroupDisabled } from '../components/InputGroup/context';
import type { DateFieldBaseProps } from '../components/DatePicker/types';

/** What RSuite's pickers give as their ref: an object, not an element. */
interface PickerHandle {
  target?: HTMLElement | null;
}

/**
 * Makes RSuite select the first part of the date or time in the field, to type into.
 *
 * RSuite types into the part it has selected, and it selects one only on a click or an arrow key. After Tab, the
 * first digit would go to the year ("24092026" gives 04/09/2026). So the caret goes into the first part, and "arrow
 * left" makes RSuite select it: like a native date field, which starts at its first part.
 */
function selectFirstPart(input: HTMLInputElement) {
  if (input.ownerDocument.activeElement !== input || input.value === '') return;
  input.setSelectionRange(1, 1);
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
}

/**
 * What DatePicker, DateRangePicker and TimePicker share: the MGS props they have in common, turned into the props of
 * RSuite's date pickers. The rest of the props is returned untouched, for the component to pass on.
 * Internal: not exported from '@mgs/ui'.
 */
export function useDateField<P extends DateFieldBaseProps>(
  {
    placeholder,
    size = 'md',
    clearable = false,
    loading = false,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name,
    open,
    defaultOpen,
    onOpenChange,
    id: idProp,
    className,
    onFocus,
    onBlur,
    onMouseDown,
    ...rest
  }: P,
  ref: ForwardedRef<HTMLInputElement>,
  baseClassName: string,
) {
  const groupDisabled = useInputGroupDisabled();
  const disabled = disabledProp || groupDisabled;
  const generatedId = useId();

  const picker = useRef<PickerHandle>(null);
  useImperativeHandle(ref, () => picker.current?.target as HTMLInputElement, []);
  // Whether the mouse was pressed on the field since it last lost the focus.
  const pressed = useRef(false);

  return {
    name,
    disabled,
    /** Props for the RSuite picker. */
    fieldProps: {
      // RSuite types its ref as its own handle object.
      ref: picker as never,
      id: idProp ?? generatedId,
      className: className ? `${baseClassName} ${className}` : baseClassName,
      placeholder,
      size,
      cleanable: clearable,
      loading,
      disabled,
      readOnly,
      // RSuite passes ARIA attributes to the <input>, and everything else to the element around it.
      'aria-required': required || undefined,
      'aria-readonly': readOnly || undefined,
      // Only when set: RSuite takes the mere presence of `open` as "the app controls the popup".
      ...(open !== undefined && { open }),
      ...(defaultOpen !== undefined && { defaultOpen }),
      onMouseDown: (event: MouseEvent<HTMLDivElement>) => {
        pressed.current = true;
        onMouseDown?.(event);
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        pressed.current = false;
        onBlur?.(event);
      },
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        onFocus?.(event);
        const input: unknown = event.target;
        if (!(input instanceof HTMLInputElement) || readOnly) return;
        if (pressed.current) {
          // After a press of the mouse, RSuite selects the part that was clicked. But a click on an empty field
          // lands beside the format, and RSuite selects the last part. Nobody means to start with the year: the
          // caret goes to the start before RSuite looks at it (this listener runs before React's).
          if (input.value !== '') return;
          input.addEventListener('click', () => input.setSelectionRange(0, 0), { once: true });
          return;
        }
        // After Tab. In the next frame: RSuite first replaces the placeholder with the format.
        requestAnimationFrame(() => {
          const { selectionStart, selectionEnd, value } = input;
          const untouched =
            selectionStart === selectionEnd ||
            (selectionStart === 0 && selectionEnd === value.length);
          if (untouched) selectFirstPart(input);
        });
      },
      onOpen: () => onOpenChange?.(true),
      onClose: () => onOpenChange?.(false),
      // Full width, like Input: the layout sets the width.
      block: true,
    },
    rest,
  };
}
