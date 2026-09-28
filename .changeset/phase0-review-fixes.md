---
'@mgs/ui': minor
---

Fixes from the phase 0 review:

- **Theme overrides in dark mode:** overriding `--mgs-color-primary` or `--mgs-color-danger` (and their hover, pressed
  and on- tokens) on `:root` now applies in dark mode too, not only in light.
- **Loading spinner contrast:** the moving arc uses each variant's text colour, 4.8:1 or more in every theme (it was
  nearly invisible on high-contrast primary buttons and faint on light secondary ones).
- **Secondary buttons** have a 1px edge in the input border colour, so they stay visible on white cards.
- **Reduced motion:** with the system's "reduce motion" setting, MGS and RSuite components stop animating transitions
  and spinners turn more slowly.
- **Content Security Policy:** icons no longer inject a `<style>` tag at runtime inside `MgsProvider`; their styles
  ship in `@mgs/ui/styles.css`.
- **MgsProvider** removes its theme class from `<body>` when the last provider unmounts. The docs now cover server
  rendering (Next.js: set `data-theme` on `<html>`) and explain why a single section can't have its own theme.
- **IconButton** can be named with `aria-labelledby` instead of `aria-label` (one of the two is required). Its icon is
  now hidden by a wrapper, so custom icon components that don't accept `aria-hidden` are hidden too.
- **Types:** `Input`, `PasswordInput` and `VisuallyHidden` no longer accept `width`, `height` or `color`, which RSuite
  read as CSS style props instead of passing them on. The published type files are about 100 KB smaller.
- **Package:** `@mgs/ui/package.json` is exported, and `engines` asks for Node 20 or later. The README documents the
  requirements (ES modules, `skipLibCheck` for now, Next.js, CSP).
