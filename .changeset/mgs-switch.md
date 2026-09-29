---
'@mgs/ui': minor
---

Add `Switch`: an on/off control for settings that take effect at once. It replaces RSuite's `Toggle`.

**Switch** (types `SwitchProps`, `SwitchSize`), built by MGS on a native checkbox with `role="switch"`:

- `checked`, `defaultChecked` and `onChange(checked, event)`: the new state comes first, so `onChange={setActive}`
  works directly.
- `size` (`sm | md | lg`, default `md`), `disabled`, `value`, and `loading`: a spinner on the thumb, `aria-busy`, and
  clicks and keys are ignored while the switch keeps keyboard focus.
- The text inside `<Switch>` is its label. Without visible text (a table row), set `aria-label` or
  `aria-labelledby`; a console warning in development tells you when the name is missing.
- `aria-invalid="true"` gives the error border.
- `className` and `style` go to the root `<label>`; every other attribute, and `ref`, go to the `<input>`.
- The click target is the whole track, at least 24px high; the track reaches 3:1 contrast in every theme; the state
  is shown by where the thumb is, also in forced-colors mode (Windows High Contrast).

Coming from RSuite's Toggle:

| RSuite                                  | MGS                                                           |
| --------------------------------------- | ------------------------------------------------------------- |
| `<Toggle>`                              | `<Switch>`                                                    |
| `label="…"`                             | the children: `<Switch>Email notifications</Switch>`          |
| `labelPlacement="start"`                | not available; lay out your own text and use `aria-labelledby` |
| `checkedChildren`, `unCheckedChildren`  | not available: no text inside the track (see below)           |
| `ariaLabel`, or an `aria-label` that RSuite dropped | `aria-label`                                      |
| `readOnly`                              | `disabled`                                                    |
| `color`, `plaintext`, `locale`          | not available; colours come from the theme                    |
| `size="xs"`, `size="xl"`                | `sm`, `lg`                                                    |

Text inside the track ("On" / "Off") is not supported yet: both existing apps use it in a few places. Show the state
as text next to the switch, or ask for it as a new prop.
