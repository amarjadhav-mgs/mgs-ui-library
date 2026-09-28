---
'@mgs/ui': minor
---

Fixes from the phase 1 UI review:

- **Focus on buttons inside a field:** PasswordInput's Show password button and InputGroup buttons with `inside` now
  show their own focus ring (RSuite removed it), so keyboard users can tell them from the text field.
- **Read-only fields** have a quieter background (new token `--mgs-color-surface-readonly`) and the normal cursor, so
  they no longer look editable. Text keeps full contrast.
- **InputGroup add-ons** have MGS padding and a divider line from the input, in every theme (high contrast included).
- **Search fields in an InputGroup** hide the browser's own clear button, so there is only one ✕.
- **InputGroup `disabled`** now reaches MGS inputs and buttons however deeply they are nested, not only direct children.
- **Secondary buttons:** the edge is quieter when disabled, and not drawn in high contrast, which has its own border.
- **IconButtonProps** is an interface again, so apps can extend it and wrap IconButton: `aria-label` is required, and
  `aria-labelledby` can be added to point at visible text.
