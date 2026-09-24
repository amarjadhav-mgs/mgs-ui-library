---
'@mgs/ui': patch
---

Remove `.scss` side-effect imports from published type declarations, which caused TS2882 errors in apps with `skipLibCheck: false`.
