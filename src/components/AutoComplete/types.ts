import type { ComponentPropsWithoutRef, SyntheticEvent } from 'react';
import type { InputSize } from '../Input/types';

/**
 * Every native `<input>` attribute except the ones MGS defines below, `type` and `role` (a text field that is a
 * combobox), the ARIA attributes the AutoComplete sets itself to describe its list, and `width`, `height` and
 * `color`: RSuite reads those names as CSS style props.
 */
type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'role'
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onSelect'
  | 'list'
  | 'aria-autocomplete'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-activedescendant'
  | 'color'
  | 'width'
  | 'height'
>;

export interface AutoCompleteProps extends NativeInputProps {
  /** The texts to suggest. The user can also type a text that isn't one of them. */
  suggestions: string[];
  /** The text, for a controlled field. Use with `onChange`. */
  value?: string;
  /** The starting text, for an uncontrolled field. */
  defaultValue?: string;
  /** Called on every change, typed or chosen from the list, with the new text first. */
  onChange?: (value: string, event: SyntheticEvent) => void;
  /** Called when the user chooses a suggestion, with its text. `onChange` is called too. */
  onSelect?: (value: string, event: SyntheticEvent) => void;
  /**
   * Shows only the suggestions that contain the typed text. Set it to `false` when the app already gives the right
   * suggestions for the text (from the server). @default true
   */
  filter?: boolean;
  /** Size, the same scale as Input and Button. @default 'md' */
  size?: InputSize;
  /** Can't be focused or edited, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused, selected and copied, but not edited; submitted with a form. No suggestions. @default false */
  readOnly?: boolean;
}
