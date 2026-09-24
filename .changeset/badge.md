---
'@mgs/ui': minor
---

Add `Badge` (RSuite 6) and its `BadgeProps` type.

The MGS theme gives default badges (no `color`) a red that meets WCAG AA contrast with their white text: 4.8:1 in
light mode (RSuite's default is 3.7:1) and 4.65:1 in dark mode (RSuite's is 3.6:1). Only badges change; RSuite's
error text colour is untouched.
