---
'@mgs/ui': minor
---

Add `AutoComplete`: a text field that suggests texts while the user types.

**AutoComplete** (type `AutoCompleteProps`), built on RSuite's AutoComplete:

- `suggestions` is a list of texts. The value is the text in the field, so other values than the suggestions are
  allowed.
- `value`, `defaultValue` and `onChange(value, event)`, called on every key and when a suggestion is chosen;
  `onSelect(value, event)` only when a suggestion is chosen.
- `filter` (on by default) shows only the suggestions that contain the typed text. Set `filter={false}` when the app
  or the server already picks the right suggestions.
- `size` (`sm | md | lg`), `disabled`, `readOnly` (no suggestions), and every native `<input>` attribute.
- `className` and `style` go to the root element; every other attribute, and `ref`, go to the `<input>`, so
  `<label htmlFor>` works.
- Fixed: RSuite pointed `aria-activedescendant` at an option that doesn't exist while the list is closed.

Coming from RSuite's AutoComplete:

| RSuite                                  | MGS                                        |
| --------------------------------------- | ------------------------------------------ |
| `data` (texts or objects)               | `suggestions` (texts)                      |
| `filterBy={() => true}`                 | `filter={false}`                           |
| `inputRef`                              | `ref`                                      |
| `onSelect(value, item, event)`          | `onSelect(value, event)`                   |
| `selectOnEnter`, `placement`, `renderOption`, `open`, `plaintext` | not available    |
