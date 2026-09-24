# @mgs/ui

MGS reusable React UI component library.

## Using the library

```bash
npm install @mgs/ui
```

```tsx
import { Button } from '@mgs/ui';
import '@mgs/ui/styles.css';

<Button variant="primary">Save</Button>;
```

### Theming

All design values are CSS custom properties (`--mgs-*`). Override them in your app:

```css
:root {
  --mgs-color-primary: #16a34a;
}
```

Library styles live in the `mgs` cascade layer, so your own CSS always wins without `!important`.

## Developing

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # Storybook at http://localhost:6006
```

| Script                    | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Storybook (component playground + docs)         |
| `npm test`                | Unit + accessibility tests (Vitest)             |
| `npm run test:watch`      | Tests in watch mode                             |
| `npm run lint`            | Lint with oxlint                                |
| `npm run format`          | Format with Prettier                            |
| `npm run typecheck`       | TypeScript check                                |
| `npm run build`           | Build the library into `dist/`                  |
| `npm run build-storybook` | Build static Storybook into `storybook-static/` |
| `npm run changeset`       | Record a change for the next release            |

A pre-commit hook (Husky + lint-staged) lints and formats staged files automatically.

## Adding a component

```
src/components/Input/
  Input.types.ts     # props (write this first)
  Input.tsx          # forwardRef, ...rest, cx(), tokens only
  Input.scss         # @layer mgs.components, BEM .mgs-input
  Input.stories.tsx  # every variant and state
  Input.test.tsx     # behaviour + axe accessibility check
  index.ts
```

Then export it from `src/index.ts`.

### Definition of done

- [ ] Props typed in `.types.ts` with `/** docs */` comments
- [ ] `forwardRef`, `...rest` and `className` merging
- [ ] Only `--mgs-*` tokens in SCSS, no hardcoded colours or sizes
- [ ] Keyboard accessible with a visible focus ring
- [ ] Stories for every variant and state; no violations in the Storybook Accessibility panel
- [ ] Tests pass, including `axeViolations`
- [ ] Exported from `src/index.ts`
- [ ] Changeset added (`npm run changeset`)

## Git workflow

- Branch from `dev` (`feat/input`, `fix/button-focus`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, builds) must be green before merging.
- `dev` is merged into `main` for releases.
