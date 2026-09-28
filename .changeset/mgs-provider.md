---
'@mgs/ui': minor
---

`MgsProvider` replaces `CustomProvider`. Wrap the app once, at its root:
`<MgsProvider theme="light" locale="en-GB"><App /></MgsProvider>`.

- `theme`: `light` (default), `dark` or `high-contrast`.
- `locale`: `en-GB` (default: `dd/MM/yyyy`, 24-hour time, weeks start on Monday) or `en-US` (`MM/dd/yyyy`, 12-hour
  time, weeks start on Sunday). The locale sets the language of built-in texts and the default date and time formats of
  every picker.
- RSuite's click ripple is turned off for every component (it ignored the "reduce motion" setting).

**Migrating from `CustomProvider`:**

| `CustomProvider`                                            | `MgsProvider`                                          |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `<CustomProvider theme="dark">`                             | `<MgsProvider theme="dark">`                           |
| `locale={enGB}` / `locale={enUS}` (from `rsuite/locales`)   | `locale="en-GB"` / `locale="en-US"`                    |
| no `theme` (no theme class)                                 | `theme` defaults to `light`                            |
| `formatDate`, `parseDate`                                   | not available: the locale sets the formats             |
| `rtl`, `classPrefix`, `iconClassPrefix`, `components`, `csp`, `disableRipple`, `disableInlineStyles`, `toastContainer` | not available                                          |
