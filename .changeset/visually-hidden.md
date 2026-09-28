---
'@mgs/ui': minor
---

Add `VisuallyHidden`: text that screen readers read but the screen doesn't show, for context sighted users get from
the layout. `<Button>Edit <VisuallyHidden>invoice INV-204</VisuallyHidden></Button>` is read as "Edit invoice
INV-204". Renders a `<span>`; every native `<span>` attribute works and `ref` points at it.
