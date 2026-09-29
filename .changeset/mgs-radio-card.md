---
'@mgs/ui': minor
---

Add `RadioCard`: a radio shown as a card, for options that need a line of explanation (plans, roles, user types).

**RadioCard** (type `RadioCardProps`):

- `value` (required), `children` (the title), `description` (details under the title), `icon` (decorative) and
  `disabled`.
- Lives in the existing `RadioGroup`, like `Radio`: the group holds `value`, `onChange`, `name`, `required` and
  `orientation`, and the keyboard, `aria-invalid` and Reset work the same. There is no separate group component.
- The whole card is the click target. It shows the same radio circle as `Radio`, and a thicker primary border when
  selected.
- In a vertical group the cards fill the width; in a horizontal group they share the row equally and wrap.
- The title names the radio for screen readers and the description describes it.
- The focus ring is around the whole card; borders reach 3:1 contrast in every theme; the selected card stays visible
  in forced-colors mode (Windows High Contrast).
- `className` and `style` go to the root `<label>`; every other attribute, and `ref`, go to the `<input>`.

Coming from RSuite's RadioTile:

| RSuite                           | MGS                                                      |
| -------------------------------- | -------------------------------------------------------- |
| `<RadioTileGroup>`               | `<RadioGroup>`                                           |
| `<RadioTileGroup inline>`        | `<RadioGroup orientation="horizontal">`                  |
| `<RadioTile label="Team">`       | `<RadioCard>Team</RadioCard>`                            |
| `children` (the description)     | `description`                                            |
| `icon`                           | `icon` (same)                                            |
| `checked`, `onChange`, `name`    | on the `RadioGroup`: `value`, `onChange`, `name`         |
| `value` as a string or number    | a string                                                 |
| check mark in the corner         | the radio circle at the start of the card                |

**Checkbox, Radio:** in forced-colors mode (Windows High Contrast), a disabled control and its label use the system's
grey.

New token `--mgs-font-weight-bold` (700), used by the card's title.

Internal: Radio and RadioCard share the circle and its dot (one Sass mixin). Radio looks the same as before.
