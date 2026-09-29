import { createContext, useContext, type ChangeEvent } from 'react';

/**
 * What a CheckboxGroup passes to the checkboxes inside it, however deeply nested.
 * Internal: read by Checkbox, not exported from '@mgs/ui'.
 */
export interface CheckboxGroupContextValue {
  /** The values of the checked checkboxes. */
  value: string[];
  /** Adds or removes a checkbox's value. */
  toggle: (value: string, checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  name?: string;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

/** The surrounding CheckboxGroup, or `null` for a checkbox on its own. */
export const useCheckboxGroup = () => useContext(CheckboxGroupContext);
