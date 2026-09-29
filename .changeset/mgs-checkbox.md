---
'@mgs/ui': minor
---

Add `Checkbox` and `CheckboxGroup`, built by MGS on the native checkbox.

**Checkbox** (type `CheckboxProps`):

- `checked`, `defaultChecked` and `onChange(checked, event)`: the new state comes first, so `onChange={setSubscribed}`
  works directly.
- `indeterminate` shows a dash for "Select all" when only some items are selected; screen readers announce "mixed".
- `value` is what the checkbox stands for in a `CheckboxGroup`, and what a form submits with `name`. `disabled`.
- The text inside `<Checkbox>` is its label. Without visible text (a table row), set `aria-label` or
  `aria-labelledby`; a console warning in development tells you when the name is missing.
- `aria-invalid="true"` gives the error border, as on the text fields.
- `className` and `style` go to the root `<label>`; every other attribute, and `ref`, go to the `<input>`.
- The click target is at least 24 × 24px, the box border reaches 3:1 contrast in every theme, and the focus ring is
  outside the box.

**CheckboxGroup** (types `CheckboxGroupProps`, `CheckboxGroupOrientation`):

- `value`, `defaultValue` and `onChange(value, event)`, where the value is a `string[]` in the order checked.
- `orientation` (`vertical` by default, or `horizontal`), `disabled` (every checkbox), `name` (a form submits one
  `name=value` per checked checkbox).
- Reaches its checkboxes however deeply they are nested. A checkbox without a `value` (a "Select all" box) isn't part
  of the group's value.
- Renders `role="group"`: name it with `aria-labelledby` or `aria-label`.
- A form's Reset button puts an uncontrolled group back to its `defaultValue`.

Coming from RSuite's Checkbox:

| RSuite                                    | MGS                                                    |
| ----------------------------------------- | ------------------------------------------------------ |
| `onChange(value, checked, event)`         | `onChange(checked, event)`                             |
| `inputRef`, `inputProps`                  | `ref` and the attributes go to the `<input>` directly  |
| `readOnly`                                | `disabled` (HTML has no read-only checkbox)            |
| `color`, `plaintext`, `as`                | not available; colours come from the theme             |
| `value` as a string or number             | a string                                               |
| `<CheckboxGroup inline>`                  | `<CheckboxGroup orientation="horizontal">`             |
