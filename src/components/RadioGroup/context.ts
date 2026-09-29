import { createContext, useContext, type ChangeEvent } from 'react';

/**
 * What a RadioGroup passes to the radios inside it, however deeply nested.
 * Internal: read by Radio, not exported from '@mgs/ui'.
 */
export interface RadioGroupContextValue {
  /** The value of the selected radio, or `null` when none is selected. */
  value: string | null;
  /** Selects a radio. */
  select: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** The shared `name` that makes the radios one group for the browser: arrow keys, Tab and forms. */
  name: string;
  disabled: boolean;
  required: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** The surrounding RadioGroup, or `null` when there is none. */
export const useRadioGroup = () => useContext(RadioGroupContext);
