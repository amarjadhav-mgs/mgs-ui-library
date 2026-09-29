import type { ComponentPropsWithoutRef, SyntheticEvent } from 'react';
import type { InputSize } from '../Input/types';

/** One option of a Select. */
export interface SelectOption {
  /** What the option stands for: the Select's value when it is chosen. Different for every option. */
  value: string;
  /** The text shown in the list and, when chosen, in the field. */
  label: string;
  /** Shown, but can't be chosen. @default false */
  disabled?: boolean;
  /** The heading this option is listed under. Options with the same `group` are shown together. */
  group?: string;
}

/**
 * Every native attribute of the field (a `<div role="combobox">`) except the ones MGS defines below, and `role` and
 * the ARIA attributes the Select sets itself to describe its list.
 */
type NativeSelectProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  | 'role'
  | 'children'
  | 'defaultValue'
  | 'onChange'
  | 'onSelect'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-activedescendant'
  | 'aria-disabled'
>;

export interface SelectProps extends NativeSelectProps {
  /** The options to choose from. */
  options: SelectOption[];
  /** The value of the chosen option, for a controlled Select; `null` when none is chosen. Use with `onChange`. */
  value?: string | null;
  /** The value chosen at the start, for an uncontrolled Select. */
  defaultValue?: string;
  /** Called when the user chooses an option, or clears the field (`null`), with the value first. */
  onChange?: (value: string | null, event: SyntheticEvent) => void;
  /** Shown while no option is chosen. Not a label. */
  placeholder?: string;
  /** Size, the same scale as Input and Button. @default 'md' */
  size?: InputSize;
  /** A search box above the list, for lists too long to scan. @default false */
  searchable?: boolean;
  /**
   * Called with the text the user types in the search box, and with `''` when the list closes: load matching
   * `options` from the server. The Select still filters the options it has by their label.
   */
  onSearch?: (text: string) => void;
  /**
   * Shown in the list when there are no options, or none match the search: "No projects found", or why the options
   * couldn't be loaded. Without it, the text comes from the locale of `MgsProvider`.
   */
  emptyText?: string;
  /** A button in the field that removes the chosen value. For values that may be empty. @default false */
  clearable?: boolean;
  /** Busy: the options are being loaded. Shows a spinner in the field. @default false */
  loading?: boolean;
  /** Can't be focused or opened, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused and read, but not opened or changed; submitted with a form. @default false */
  readOnly?: boolean;
  /** The `name` a form submits the value with. */
  name?: string;
  /** Whether the list is open, for a controlled list. Use with `onOpenChange`. */
  open?: boolean;
  /** Whether the list starts open. @default false */
  defaultOpen?: boolean;
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
}
