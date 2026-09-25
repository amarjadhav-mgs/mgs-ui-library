---
'@mgs/ui': minor
---

`Button` and `IconButton` are now MGS components (built on RSuite's Button), and `@mgs/ui` exports a curated set of
icons.

**Button:** `variant` (`primary | secondary | danger | ghost | link`, default `secondary`), `size` (`sm | md | lg`,
default `md`), `disabled`, `loading`, `fullWidth`, `leftIcon`, `rightIcon`, plus every native `<button>` attribute;
`ref` is forwarded.

- Every variant meets WCAG AA contrast in the light, dark and high-contrast themes, including hover and pressed.
- `loading` sets `aria-busy`, ignores clicks and Enter/Space (a submit button doesn't submit), and keeps the button's
  width, accessible name and keyboard focus.
- The focus ring is drawn outside the button, so it is visible on primary buttons.
- No click ripple (it ignored the "reduce motion" setting).

**IconButton:** the icon is the child, and `aria-label` is required:
`<IconButton aria-label="Delete order" variant="danger"><TrashIcon /></IconButton>`. Supports `variant` (not `link`),
`size`, `disabled` and `loading` like Button.

**Icons:** `PlusIcon`, `EditIcon`, `TrashIcon`, `SearchIcon`, `FilterIcon`, `ChevronDownIcon`, `WarningIcon`,
`UserIcon` and 26 more, from `@mgs/ui`. `@rsuite/icons` is now a dependency; don't import it directly.

Theme fixes for RSuite buttons: red buttons keep WCAG AA contrast on hover and press in dark mode and have readable
text in high contrast; the pressed default button in dark mode is readable.

**Migrating from the RSuite Button API:**

| RSuite                                        | MGS                                                            |
| --------------------------------------------- | -------------------------------------------------------------- |
| `appearance="primary"`                        | `variant="primary"`                                            |
| `appearance="default"`                        | `variant="secondary"` (the default)                            |
| `appearance="primary" color="red"`            | `variant="danger"`                                             |
| `appearance="ghost"` / `"link"`               | `variant="ghost"` / `"link"`                                   |
| `appearance="subtle"`, other `color`s         | not available: pick one of the variants                        |
| `startIcon` / `endIcon`                       | `leftIcon` / `rightIcon`                                       |
| `block`                                       | `fullWidth`                                                    |
| `size="xs"`                                   | `size="sm"`                                                    |
| `href`, `as`                                  | not available: use a link for navigation                       |
| `active`, `toggleable`, `onToggle`            | pass `aria-pressed` and handle `onClick`                       |
| `<IconButton icon={<X />} />`                 | `<IconButton aria-label="…"><X /></IconButton>`                |
| `circle`, `placement`, IconButton with text   | not available: use `Button` with `leftIcon` for icon + text    |
| `import X from '@rsuite/icons/X'`             | the matching `...Icon` from `@mgs/ui` (see the Icons gallery)  |
