---
'@mgs/ui': minor
---

`@mgs/ui` components are now RSuite 6 components with the MGS theme.

- **Breaking:** the custom `Button` and the `--mgs-*` design tokens are removed. `Button`, `IconButton`,
  `ButtonGroup`, `ButtonToolbar` and `CustomProvider` (and their props types) are re-exported from RSuite; import them
  from `@mgs/ui`.
- `@mgs/ui/styles.css` contains RSuite's styles plus the MGS theme: brand blue and danger red palettes that meet WCAG
  AA contrast, and a fully opaque focus ring.
- `rsuite` is a dependency, installed automatically with `@mgs/ui`.
