---
'@mgs/ui': minor
---

Add `MultiSelect`: a field that opens a list of checkboxes to choose several options from. It replaces RSuite's
`CheckPicker` and `TagPicker`.

**MultiSelect** (type `MultiSelectProps`), built on RSuite's CheckPicker:

- The same props as `Select` (`options`, `searchable`, `onSearch`, `emptyText`, `clearable`, `loading`, `disabled`,
  `readOnly`, `size`, `placeholder`, `name`, `open`, `onOpenChange`), with a list as its value.
- `value` and `defaultValue` are `string[]`; `onChange(value, event)` gives the values in the order chosen. An empty
  value is `[]`, never `null`.
- The field shows the chosen labels and how many there are, and keeps its height. The list stays open while
  choosing, and the options keep their place in it.
- The border of the checkboxes in the list reaches 3:1 contrast in every theme (RSuite's is 1.4:1 in light).
- With `name`, a form submits the values in one field, separated by commas.

Coming from RSuite:

| RSuite                                   | MGS                                                       |
| ---------------------------------------- | --------------------------------------------------------- |
| `<CheckPicker>`                          | `<MultiSelect>`                                           |
| `<TagPicker>`                            | `<MultiSelect>`: the chosen values are text, not tags yet |
| `sticky` (chosen options move to the top) | not available: options keep their place                  |
| `countable={false}`                      | not available: the count is always shown                  |
| `creatable`                              | not available; a tag input comes later                    |
| the other props                          | as for `Select`                                           |
