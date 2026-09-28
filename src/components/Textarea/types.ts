import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import type { InputSize } from '../Input/types';

/** Every native `<textarea>` attribute except the ones MGS defines below. */
type NativeTextareaProps = Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'value' | 'defaultValue' | 'onChange' | 'color'
>;

export interface TextareaProps extends NativeTextareaProps {
  /** Size, the same scale as `Input`. @default 'md' */
  size?: InputSize;
  /** The value, for a controlled textarea. Use with `onChange`. */
  value?: string;
  /** The starting value, for an uncontrolled textarea. */
  defaultValue?: string;
  /** Called on every change, with the new value first. */
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Can't be focused or edited, and isn't submitted with a form. @default false */
  disabled?: boolean;
  /** Can be focused, selected and copied, but not edited; submitted with a form. @default false */
  readOnly?: boolean;
  /** Visible lines of text, when `autosize` is off. Users can drag the height. @default 3 */
  rows?: number;
  /** Grow and shrink with the text, between `minRows` and `maxRows`. @default false */
  autosize?: boolean;
  /** Smallest height, in lines, with `autosize`. */
  minRows?: number;
  /** Largest height, in lines, with `autosize`; longer text scrolls. */
  maxRows?: number;
}
