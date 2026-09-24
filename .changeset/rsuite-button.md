---
'@mgs/ui': minor
---

Adopt RSuite 6 as the component library.

- **Breaking:** the custom `Button` and the `--mgs-*` design tokens are removed. Import components from `rsuite`
  (`import { Button } from 'rsuite'`).
- `@mgs/ui/styles.css` is now the MGS theme for RSuite: brand blue and danger red palettes that meet WCAG AA
  contrast, and a fully opaque focus ring.
- `rsuite` (>=6.2 <7) is a peer dependency.
