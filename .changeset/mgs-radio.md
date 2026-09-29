---
'@mgs/ui': minor
---

Add `Radio` and `RadioGroup`, built by MGS on the native radio.

**RadioGroup** (types `RadioGroupProps`, `RadioGroupOrientation`):

- `value`, `defaultValue` and `onChange(value, event)`. The value is a `string`; a controlled group with nothing
  selected has `value={null}`.
- `orientation` (`vertical` by default, or `horizontal`), `disabled` (every radio), `required`, and `name` for forms.
- The radios always share one `name` (generated when you set none), so the keyboard works: Tab moves into the group at
  the selected radio, and the arrow keys move between the radios and select them.
- Reaches its radios however deeply they are nested (a table, columns).
- Renders `role="radiogroup"`: name it with `aria-labelledby` or `aria-label`. `aria-invalid="true"` on the group gives
  its radios the error border.
- A form's Reset button puts an uncontrolled group back to its `defaultValue`.
- Inside a `<form>`, set `name`: a console warning in development tells you when it is missing.

**Radio** (type `RadioProps`):

- `value` (required), `children` (the label) and `disabled`. The group holds the value: a Radio has no `checked`,
  `onChange` or `name`, and must be inside a `RadioGroup` (a console warning in development says so).
- Without visible text (a table row), set `aria-label` or `aria-labelledby`.
- `className` and `style` go to the root `<label>`; every other attribute, and `ref`, go to the `<input>`.
- The click target is at least 24 × 24px, the circle's border reaches 3:1 contrast in every theme, and the focus ring
  is outside the circle. The selected dot stays visible in forced-colors mode (Windows High Contrast).

Coming from RSuite's Radio:

| RSuite                                       | MGS                                                   |
| -------------------------------------------- | ----------------------------------------------------- |
| `<Radio checked onChange>` on its own        | a `RadioGroup` with `value` and `onChange`            |
| `<RadioGroup inline>`                        | `<RadioGroup orientation="horizontal">`               |
| `<RadioGroup appearance="picker">`           | not available (RSuite deprecated it)                  |
| `inputRef`, `inputProps`                     | `ref` and the attributes go to the `<input>` directly |
| `readOnly`                                   | `disabled` (HTML has no read-only radio)              |
| `color`, `plaintext`, `as`                   | not available; colours come from the theme            |
| `value` as a string or number                | a string                                              |
| nothing selected: `value` is `''` or missing | `value={null}`                                        |

**CheckboxGroup:** a Reset that the form's `onReset` cancels (`preventDefault()`) no longer resets the group.

Internal: Checkbox and Radio now share their layout, target, label and focus styles (one Sass mixin). Checkbox looks
the same as before.
