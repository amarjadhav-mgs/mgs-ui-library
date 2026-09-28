---
'@mgs/ui': minor
---

Add `NumberInput` and the `en-IN` locale.

**NumberInput** (types `NumberInputProps`, `NumberInputChangeEvent`), built by MGS:

- The value is a `number`, or `null` when empty: `value`, `defaultValue`, `onChange(value, event)`. Never a string.
- `min`, `max`, `step` (default 1), `decimals` (rounds and shows that many places, e.g. 2 for money; `0` for whole
  numbers), `grouping` (thousands separators while not focused, default on), `prefix` / `suffix` (`₹`, `kg`, `%`),
  `controls` (− + buttons, default on, each at least 24 × 24px), `size`, `disabled`, `readOnly`.
- Shows the number formatted for the locale when not focused (`54,999.00`), and plainly while editing. Pasted text
  keeps just the number (`₹1,234.50` → 1234.5, `12 kg` → 12); letters are ignored; up to 15 digits.
- Leaving the field, or pressing Enter before the form submits, rounds to `decimals` (half away from zero:
  1.005 → 1.01) and limits the value to `min` / `max`. A value the app changes while the field is focused is shown.
- With a `name`, forms submit the raw number (`54999.5`) through a hidden input. With React Hook Form, use
  `Controller`.
- A WAI-ARIA spinbutton: ↑ ↓, Page Up / Down (10 steps), Home / End; screen readers hear the value with its unit
  (`₹54,999.00`, `12 units`) and its limits. The mouse wheel never changes the value. Phones get a decimal (or number)
  keyboard.

**`MgsProvider locale="en-IN"`:** dates and times as `en-GB` (`dd/MM/yyyy`, 24-hour, weeks from Monday), and Indian
number grouping (`12,34,567.50`) in NumberInput.

Also: an `InputGroup` inside a disabled `InputGroup` is disabled too (NumberInput and PasswordInput are input groups).
