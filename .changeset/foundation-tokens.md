---
'@mgs/ui': minor
---

Add the MGS design token foundation: primitive tokens, semantic tokens per theme (`--mgs-color-primary`,
`--mgs-color-danger`, `--mgs-color-focus-ring`, `--mgs-color-border-control`, text/surface/border neutrals,
`--mgs-space-*`, `--mgs-radius-*`), and a bridge that passes them on to RSuite. Customize the theme with `--mgs-*`
tokens instead of `--rs-*` variables.

- Light theme: no visual change.
- Dark theme: the MGS brand blue now applies (RSuite's cyan before). Primary buttons, and today's and the selected
  date in calendars, use the light-theme brand fill with white text (5.2:1; RSuite's cyan was 3:1). Links and the focus
  ring use a lighter blue (7.3:1). The default badge uses the same danger red as light (4.8:1).
- High-contrast theme: unchanged. It stays RSuite's accessibility theme.
