---
'@mgs/ui': minor
---

`DateRangePicker` now has an MGS API, and RSuite's date rules are removed. **Breaking** for code that used the RSuite
props, the date rules (`after`, `afterToday`, `allowedDays`, `allowedMaxDays`, `allowedRange`, `before`,
`beforeToday`, `combine`) or RSuite's `DateRange` type.

**DateRangePicker** (types `DateRangePickerProps`, `DateRange`, `DateRangePreset`; function `dateRangePresets`), built
on RSuite's DateRangePicker:

- `value` (`[start, end] | null`), `defaultValue` and `onChange(value, event)`: the value comes first, so
  `onChange={setPeriod}` works directly. Clearing gives `null`.
- `onChange` gives the start as the first moment of its day and the end as the last moment of its day, and is called
  for a whole range only, not for the steps on the way while the user types.
- The format comes from the locale of `MgsProvider`; the two dates are separated by an en dash
  (`18/09/2026 – 24/09/2026`).
- `minDate`, `maxDate` and `isDateDisabled(date)` say which days can be chosen. A typed range that starts or ends
  outside them is marked invalid and not given to `onChange`.
- `presets` (`{ label, value }`) are shortcuts in the calendar; without them there are none. `dateRangePresets()`
  gives Today, Yesterday, Last 7 days, Last 30 days, This month and Last month.
- Two calendars side by side with the shortcuts beside them; below 640px, one calendar with the shortcuts under it.
- `clearable` (off by default), `loading`, `disabled`, `readOnly`, `required`, `size` (`sm | md | lg`),
  `placeholder`, `open`, `defaultOpen`, `onOpenChange(open)`.
- `name`: a form submits the range as `2026-09-18/2026-09-24`, in the user's own time zone.
- Always full width, like Input: the layout sets the width.
- In an empty field, typing starts at the first part of the start date, after Tab and after a click (with RSuite
  alone it started at the last year).
- Works in a `FormField`, which names it and shows its error.
- `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.

Coming from RSuite's DateRangePicker:

| RSuite                                               | MGS                                                  |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `format="dd/MM/yyyy"`                                | the locale of `MgsProvider`                          |
| `shouldDisableDate={beforeToday()}`                  | `minDate={new Date()}`                               |
| `shouldDisableDate={afterToday()}`                   | `maxDate={new Date()}`                               |
| `shouldDisableDate={allowedRange(a, b)}`             | `minDate={a} maxDate={b}`                            |
| `shouldDisableDate={combine(…)}`, `(date) => …`      | `minDate`, `maxDate` and `isDateDisabled` together   |
| `shouldDisableDate={allowedMaxDays(7)}`              | not available yet: check the range in `onChange`     |
| `ranges={[{ label, value, placement }]}`             | `presets={[{ label, value }]}`                       |
| `ranges={[]}` (to remove RSuite's shortcuts)         | nothing: there are no shortcuts without presets      |
| `character=" ~ "`                                    | always an en dash                                    |
| `showOneCalendar`                                    | automatic below 640px                                |
| `cleanable` (on by default)                          | `clearable` (off by default)                         |
| `block`                                              | always full width                                    |
| `onOpen`, `onClose`                                  | `onOpenChange(open)`                                 |
| `label="Period"` (text inside the field)             | a `<label>`, `aria-label` or a `FormField`           |
| `container`, `placement`, `appearance`, `plaintext`, `editable`, `hoverRange`, `oneTap`, `isoWeek`, `showWeekNumbers`, `showHeader`, `renderCell`, `onOk` | not available |
