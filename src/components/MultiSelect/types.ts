import type { SyntheticEvent } from 'react';
import type { SelectProps } from '../Select/types';

/** Everything a Select has, except the value, which is a list here. */
type SharedSelectProps = Omit<SelectProps, 'value' | 'defaultValue' | 'onChange'>;

export interface MultiSelectProps extends SharedSelectProps {
  /** The values of the chosen options, for a controlled MultiSelect; `[]` when none is chosen. Use with `onChange`. */
  value?: string[];
  /** The values chosen at the start, for an uncontrolled MultiSelect. @default [] */
  defaultValue?: string[];
  /** Called when the user checks or unchecks an option, or clears the field (`[]`), with the values first. */
  onChange?: (value: string[], event: SyntheticEvent) => void;
}
