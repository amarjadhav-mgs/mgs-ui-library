---
'@mgs/ui': minor
---

`ButtonGroup` has an MGS API, `Stack` is new, and `ButtonToolbar` is removed.

**ButtonGroup** (types `ButtonGroupProps`, `ButtonGroupOrientation`), built on RSuite's ButtonGroup:

- `size` and `disabled` apply to every button in the group; `orientation` (`horizontal` by default, or `vertical`);
  `fullWidth` fills the container with buttons of equal width.
- Renders `role="group"`: name it with `aria-label` or `aria-labelledby`; a console warning in development tells you
  when the name is missing.
- The focused button is drawn above its neighbours, so its focus ring is not covered.

**Stack** (types `StackProps`, `StackGap`), built by MGS:

- Lays out its children in a `column` (default) or a `row`, with `gap` from the MGS spacing scale
  (`none | xs | sm | md | lg | xl`, default `md`), `align`, `justify` and `wrap`.
- A plain `<div>` with no look of its own; every native attribute works, so a toolbar is
  `<Stack direction="row" role="toolbar" aria-label="…">`.

Migration:

| Before (RSuite's API)                         | Now                                                           |
| --------------------------------------------- | ------------------------------------------------------------- |
| `<ButtonGroup vertical>`                      | `<ButtonGroup orientation="vertical">`                        |
| `<ButtonGroup justified>` or `block`          | `<ButtonGroup fullWidth>`                                     |
| `<ButtonGroup divided>`                       | not available                                                 |
| `<ButtonToolbar aria-label="…">`              | `<Stack direction="row" gap="sm" role="toolbar" aria-label="…">` |
| `<Stack spacing={8}>` (RSuite)                | `<Stack gap="sm">`                                            |
| `<Stack alignItems="center" justifyContent="space-between">` | `<Stack align="center" justify="between">`     |
| `<Stack direction="row">` as the default      | `column` is the default: set `direction="row"`                |
| `<Stack divider>`, `<Stack.Item>`             | not available                                                 |
