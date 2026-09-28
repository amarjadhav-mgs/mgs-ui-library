---
'@mgs/ui': minor
---

`Input`, `Textarea` and `PasswordInput` are MGS components, with their own `InputProps`, `TextareaProps` and
`PasswordInputProps` types (plus `InputSize` and `InputType`).

- **All three:** `value` / `defaultValue` / `onChange(value, event)`, `size` (`sm | md | lg`, the same heights as
  Button), `disabled`, `readOnly`; every native attribute and `ref` go to the `<input>` / `<textarea>`. Read-only fields
  now call `onFocus`, `onBlur` and `onKeyDown` (RSuite dropped them).
- **Invalid fields:** set `aria-invalid="true"` for an error border that meets 3:1 contrast in every theme (new token
  `--mgs-color-border-error`); inside an `InputGroup`, the group's border turns red.
- **Input:** `type` is `text | email | tel | url | search`.
- **Textarea:** `rows` (default 3, users can drag it taller), or `autosize` with `minRows` / `maxRows`.
- **PasswordInput** is built by MGS: labels, `aria-*`, `required` and `disabled` reach the `<input>`; the Show
  password button is in the Tab order, with `aria-pressed`; `autoComplete` defaults to `current-password` and can be
  `new-password`.

**Migrating from the RSuite API:**

| RSuite                                              | MGS                                                          |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `size="xs"`                                         | `size="sm"`                                                  |
| `type="password"` / `"number"` / `"date"` on Input  | `PasswordInput`; the number and date components              |
| `plaintext`                                         | `readOnly`                                                   |
| `onPressEnter`                                      | a `<form>` (Enter submits) or `onKeyDown`                    |
| `inputRef`                                          | `ref` (it points at the `<input>`)                           |
| `htmlSize`                                          | not available: width comes from the layout                   |
| Textarea `resize`                                   | vertical by default; `style={{ resize: 'none' }}` to turn off |
| PasswordInput `visible`, `defaultVisible`, `onVisibleChange`, `startIcon`, `endIcon`, `renderVisibilityIcon` | not available |
