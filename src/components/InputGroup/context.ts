import { createContext, useContext } from 'react';

/**
 * What an InputGroup passes to the controls inside it, however deeply nested. RSuite only passes `disabled` to its
 * direct children (by cloning them), so an Input inside a fragment or a wrapper component stayed enabled.
 * Internal: read by Input, PasswordInput, Textarea and InputGroupButton, not exported from '@mgs/ui'.
 */
export const InputGroupContext = createContext<{ disabled?: boolean }>({});

/** The `disabled` of the surrounding InputGroup, if any. */
export const useInputGroupDisabled = () => useContext(InputGroupContext).disabled ?? false;
