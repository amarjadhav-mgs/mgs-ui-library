---
'@mgs/ui': minor
---

`InputGroup` is an MGS component, with two separate parts: `InputGroupAddon` (text or an icon) and `InputGroupButton`
(a button, `type="button"` by default). Types: `InputGroupProps`, `InputGroupAddonProps`, `InputGroupButtonProps`.

- `InputGroup`: `size` (`sm | md | lg`), `disabled` (disables everything inside), `inside` (add-ons inside the border).
- The parts are separate exports, so they also work when rendered by Next.js Server Components.
- `aria-invalid="true"` on the input turns the group's border red.

**Migrating from the RSuite API:**

| RSuite                      | MGS                                   |
| --------------------------- | ------------------------------------- |
| `<InputGroup.Addon>`        | `<InputGroupAddon>`                   |
| `<InputGroup.Button>`       | `<InputGroupButton>`                  |
| `size="xs"`                 | `size="sm"`                           |
| `InputGroup.Button` `appearance`, `color`, `size` | not available: the group styles the button |
