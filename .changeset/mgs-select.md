---
'@mgs/ui': minor
---

Add `Select`: a field that opens a list to choose one option from. It replaces RSuite's `SelectPicker` and
`InputPicker`.

**Select** (types `SelectProps`, `SelectOption`), built on RSuite's SelectPicker:

- `options` is a list of `{ value, label, disabled?, group? }`. Values are strings.
- `value` (`string | null`), `defaultValue` and `onChange(value, event)`: the value comes first, so
  `onChange={setStatus}` works directly. Clearing gives `null`.
- `searchable` (off by default) with `onSearch(text)` for searching on the server, and `emptyText` for the text shown
  when there are no options.
- `clearable` (off by default), `loading`, `disabled`, `readOnly`, `size` (`sm | md | lg`), `placeholder`, `name`.
- `open`, `defaultOpen` and `onOpenChange(open)`.
- Always full width, like Input: the layout sets the width.
- A list of more than 100 options draws only the options in view.
- Name it with `aria-labelledby` or `aria-label`; a console warning in development tells you when the name is
  missing, and when two options have the same value.
- `aria-invalid="true"` gives the error border. Your `aria-describedby` (an error text) is read before the chosen
  value.
- `className` and `style` go to the root element; every other attribute, and `ref`, go to the field.
- The field's border reaches 3:1 contrast in every theme (RSuite's is 1.3:1 in light).

Coming from RSuite's SelectPicker:

| RSuite                                       | MGS                                                        |
| -------------------------------------------- | ---------------------------------------------------------- |
| `data`, `labelKey`, `valueKey`               | `options` with `value` and `label`                         |
| `disabledItemValues={['sms']}`               | `disabled: true` on the option                             |
| `groupBy="state"`                            | `group: 'Maharashtra'` on the option                       |
| `cleanable` (on by default)                  | `clearable` (off by default)                               |
| `searchable` (on by default)                 | `searchable` (off by default)                              |
| `block`                                      | always full width                                          |
| `onOpen`, `onClose`                          | `onOpenChange(open)`                                       |
| `locale={{ noResultsText }}`                 | `emptyText`                                                |
| `virtualized`                                | automatic above 100 options                                |
| values of any type                           | strings; `null` for no value                               |
| `renderOption`, `renderValue`, `renderExtraFooter` | not available yet                                     |
| `container`, `placement`, `appearance`, `menuMaxHeight`, `popupStyle` | not available                     |
