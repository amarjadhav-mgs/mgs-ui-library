---
'@mgs/ui': minor
---

`TimePicker` now has an MGS API. **Breaking** for code that used the RSuite props or a `Date` as the value.

**TimePicker** (type `TimePickerProps`), built on RSuite's DatePicker with a time format:

- The value is 24-hour text: `value` (`'14:30'` or `null`), `defaultValue` and `onChange(value, event)`. A time of
  day has no day and no time zone, so it isn't a `Date`.
- The locale of `MgsProvider` sets what the user sees: `14:30` in `en-GB` and `en-IN`, `02:30 PM` in `en-US`. There
  is no `format` prop.
- `onChange` is called for a whole time only, not while the user types.
- `minuteStep`: `15` offers 00, 15, 30 and 45 in the list.
- No "now" shortcut.
- `clearable` (off by default), `loading`, `disabled`, `readOnly`, `required`, `size` (`sm | md | lg`),
  `placeholder`, `open`, `defaultOpen`, `onOpenChange(open)`.
- `name`: a form submits the time as `14:30`, whatever the locale.
- Always full width, like Input: the layout sets the width.
- In an empty field, typing starts at the hours, after Tab and after a click.
- Works in a `FormField`, which names it and shows its error.
- `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.

Coming from RSuite's TimePicker:

| RSuite                                       | MGS                                         |
| -------------------------------------------- | ------------------------------------------- |
| `value={new Date(2026, 8, 24, 14, 30)}`      | `value="14:30"`                             |
| `format="HH:mm"`, `showMeridiem`             | the locale of `MgsProvider`                 |
| `hideMinutes={(minute) => minute % 15 !== 0}` | `minuteStep={15}`                           |
| `cleanable` (on by default)                  | `clearable` (off by default)                |
| `block`                                      | always full width                           |
| `onOpen`, `onClose`                          | `onOpenChange(open)`                        |
| `label="Start time"` (text inside the field) | a `<label>`, `aria-label` or a `FormField`  |
| seconds (`format="HH:mm:ss"`), `hideHours`, `container`, `placement`, `appearance`, `plaintext`, `editable`, `onOk` | not available |
