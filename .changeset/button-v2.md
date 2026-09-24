---
'@mgs/ui': minor
---

Button improvements, plus new `IconButton` and `buttonClassName`.

- Loading shows a centered spinner over the content, so the width no longer changes; the label stays the accessible name.
- Focus ring now uses `outline`, so it stays visible in Windows High Contrast mode.
- Long labels are truncated with an ellipsis instead of overflowing.
- Hover styles only apply on devices that can hover.
- New `IconButton` component: square, `aria-label` required.
- New `buttonClassName()` helper to style links as buttons.
- New optional tokens `--mgs-button-radius` and `--mgs-button-font-weight`.
- **Breaking:** the `--mgs-focus-ring` token is replaced by `--mgs-color-focus-ring`, `--mgs-focus-ring-width` and `--mgs-focus-ring-offset`.
