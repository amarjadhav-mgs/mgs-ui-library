---
'@mgs/ui': minor
---

`Calendar` now has an MGS API, and `DateInput`, `DateRangeInput` and `TimeRangePicker` are removed. **Breaking** for
code that used them or the RSuite props of `Calendar`.

**Calendar** (type `CalendarProps`), built on RSuite's Calendar:

- `value` (`Date | null`), `defaultValue` and `onChange(value)`.
- `onChange` is called when the user chooses a day, not when the user only moves to another month. RSuite alone
  reports both the same way.
- `onMonthChange(month)` gives the first day of the month now on show.
- Only the chosen day looks selected. With RSuite alone the selected day moves along when the month changes.
- Without a value no day is chosen. RSuite alone chooses today.
- `renderDay(date)` for what a day shows under its number; `compact` for smaller days.
- Always has its border.
- `className`, `style`, the other native attributes and `ref` go to the root element.

Coming from RSuite:

| RSuite                                                          | MGS                                                 |
| --------------------------------------------------------------- | --------------------------------------------------- |
| `<Calendar onSelect>`                                           | `onChange`                                          |
| `<Calendar renderCell>`                                         | `renderDay`                                         |
| `<Calendar bordered>`                                           | always                                              |
| `<Calendar cellClassName isoWeek weekStart monthDropdownProps>` | not available                                       |
| `<DateInput>`                                                   | `<DatePicker>`: the date can be typed into it       |
| `<DateRangeInput>`                                              | `<DateRangePicker>`: the range can be typed into it |
| `<TimeRangePicker>`                                             | two `<TimePicker>`: see its Advanced examples       |
