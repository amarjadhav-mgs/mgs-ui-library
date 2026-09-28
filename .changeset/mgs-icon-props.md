---
'@mgs/ui': minor
---

Icons are typed with MGS's own props. Every icon (`PlusIcon`, `TrashIcon`, …) is an `MgsIcon` with `MgsIconProps`:
SVG attributes (`className`, `style`, `width`, `data-*`, …) and a `ref` to the `<svg>`. Both types are exported.

- Icons are always decorative: `aria-hidden="true"` and no `aria-label` (RSuite used to add its own icon name, such as
  "funnel" for `FilterIcon`). They don't accept `aria-label` or `role`; the button or text next to an icon names it.
- Unused icons are still dropped by apps' bundlers.

**Migrating from the RSuite icon props:**

| RSuite icon prop            | MGS                                                          |
| --------------------------- | ------------------------------------------------------------ |
| `size="2em"`                | `style={{ fontSize: '2em' }}` or CSS `font-size` (icons are `1em`) |
| `fill="…"`                  | still works; prefer CSS `color` (icons use `currentColor`)   |
| `rotate`, `flip`            | not available: use a CSS `transform`                         |
| `spin`, `pulse`             | not available: use `loading` on `Button` / `IconButton`      |
| `as`, `aria-label`, `role`  | not available                                                |
