---
'@mgs/ui': minor
---

`DatePicker` now has an MGS API. **Breaking** for code that used the RSuite props.

**DatePicker** (types `DatePickerProps`, `DatePreset`), built on RSuite's DatePicker:

- `value` (`Date | null`), `defaultValue` and `onChange(value, event)`: the value comes first, so
  `onChange={setDue}` works directly. Clearing gives `null`.
- `onChange` is called for a whole date only. RSuite alone also reports the steps on the way while the user types
  (an invalid date, the years 2, 20 and 202).
- The format comes from the locale of `MgsProvider`: `dd/MM/yyyy` in `en-GB` and `en-IN`, `MM/dd/yyyy` in `en-US`.
  There is no `format` prop.
- `withTime` adds the time: 24-hour, or 12-hour in `en-US`.
- `minDate`, `maxDate` and `isDateDisabled(date)` say which days can be chosen. A typed date outside them is marked
  invalid and not given to `onChange`.
- `presets` (`{ label, value }`) are shortcuts in the calendar. Without them there are none.
- `clearable` (off by default), `loading`, `disabled`, `readOnly`, `required`, `size` (`sm | md | lg`),
  `placeholder`.
- `name`: a form submits the date as `2026-09-24` (`2026-09-24T14:30` with a time), in the user's own time zone.
- `open`, `defaultOpen` and `onOpenChange(open)`.
- Always full width, like Input: the layout sets the width.
- After Tab, typing starts at the first part of the date (with RSuite alone the first digit went to the year).
- Works in a `FormField`, which names it and shows its error.
- `className` and `style` go to the root element; `id`, `aria-*` and `ref` go to the `<input>`.

Coming from RSuite's DatePicker:

| RSuite                                          | MGS                                              |
| ----------------------------------------------- | ------------------------------------------------ |
| `format="dd/MM/yyyy"`                           | the locale of `MgsProvider`                      |
| `format="dd/MM/yyyy HH:mm"`                     | `withTime`                                       |
| `shouldDisableDate={beforeToday()}`             | `minDate={new Date()}`                           |
| `shouldDisableDate={(date) => …}`               | `isDateDisabled={(date) => …}`                   |
| `ranges={[{ label, value }]}`                   | `presets={[{ label, value }]}`                   |
| `ranges={[]}` (to remove "today", "yesterday")  | nothing: there are no shortcuts without presets  |
| `cleanable` (on by default)                     | `clearable` (off by default)                     |
| `oneTap`                                        | always, for a date without a time                |
| `block`                                         | always full width                                |
| `onOpen`, `onClose`                             | `onOpenChange(open)`                             |
| `label="Due date"` (text inside the field)      | a `<label>`, `aria-label` or a `FormField`       |
| `showMeridiem`                                  | the locale: 12-hour in `en-US`                   |
| `container`, `placement`, `appearance`, `plaintext`, `editable`, `isoWeek`, `showWeekNumbers`, `limitStartYear`, `limitEndYear`, `hideHours`, `hideMinutes`, `renderCell` | not available |
