# @mgs/ui

The MGS UI component library. Its components are [RSuite 6](https://rsuitejs.com) components, re-exported with the
MGS theme, so apps use **only `@mgs/ui`**. The Storybook documents each component.

## Using it in an app

```bash
npm install @mgs/ui
```

```tsx
// App entry (e.g. main.tsx)
import '@mgs/ui/styles.css'; // component styles + MGS theme

// Anywhere
import { Button } from '@mgs/ui';

<Button appearance="primary">Save</Button>;
```

Optional: `<CustomProvider theme="light | dark | high-contrast">` from `@mgs/ui` switches themes.

### Available components

`Avatar`, `AvatarGroup`, `Badge`, `Button`, `IconButton`, `ButtonGroup`, `ButtonToolbar`, `Input`, `InputGroup`, `Textarea`, `PasswordInput`,
`CustomProvider` (and their `...Props` types).

### Theming

`styles.css` contains RSuite's styles plus the MGS theme (`src/theme/mgs-theme.css`), which only overrides RSuite's
CSS variables (`--rs-*`). Never override `.rs-*` class selectors.

## Developing

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # Storybook at http://localhost:6006
```

| Script                    | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Storybook (component docs + playgrounds)        |
| `npm test`                | Story accessibility (axe) and behaviour tests   |
| `npm run test:watch`      | Tests in watch mode                             |
| `npm run lint`            | Lint with oxlint                                |
| `npm run format`          | Format with Prettier                            |
| `npm run typecheck`       | TypeScript check                                |
| `npm run build`           | Build the library into `dist/`                  |
| `npm run build-storybook` | Build static Storybook into `storybook-static/` |
| `npm run changeset`       | Record a change for the next release            |

A pre-commit hook (Husky + lint-staged) lints and formats staged files automatically.

## Adding a component

1. Re-export it from RSuite in `src/index.ts` (component and its `...Props` type).
2. Document it:

```
src/stories/<Component>/
  <Component>.stories.tsx  # one story per feature, short "Show code" snippets, Playground with controls
  <Component>.mdx          # what / when / example / limitations / accessibility
  <Component>.test.tsx     # every story passes axe; RSuite behaviour the docs rely on
```

Rules:

- Use the installed RSuite version's API only; check its type definitions in `node_modules/rsuite/esm/<Component>`.
- Apps, stories and docs import from `@mgs/ui`, never from `rsuite` directly.
- Don't wrap or re-implement RSuite components unless there's a clear MGS requirement.
- Brand changes go in `src/theme/mgs-theme.css` via `--rs-*` variables.

## Git workflow

- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, builds) must be green before merging.
- `dev` is merged into `main` for releases.
