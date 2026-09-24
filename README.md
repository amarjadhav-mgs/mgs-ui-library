# @mgs/ui

MGS design system, built on [RSuite 6](https://rsuitejs.com). This package provides the **MGS theme for RSuite**;
the Storybook documents how we use each RSuite component.

## Using it in an app

```bash
npm install rsuite @mgs/ui
```

```tsx
// App entry (e.g. main.tsx)
import 'rsuite/dist/rsuite.css'; // RSuite styles
import '@mgs/ui/styles.css'; // MGS theme (after RSuite)

// Components come straight from RSuite
import { Button } from 'rsuite';

<Button appearance="primary">Save</Button>;
```

Optional: `<CustomProvider theme="light | dark | high-contrast">` from `rsuite` switches themes.

### Theming

The theme only overrides RSuite's CSS variables (`--rs-*`), see `src/theme/mgs-theme.css`. Never override
`.rs-*` class selectors.

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
| `npm run build`           | Build the theme package into `dist/`            |
| `npm run build-storybook` | Build static Storybook into `storybook-static/` |
| `npm run changeset`       | Record a change for the next release            |

A pre-commit hook (Husky + lint-staged) lints and formats staged files automatically.

## Documenting an RSuite component

```
src/stories/<Component>/
  <Component>.stories.tsx  # one story per feature, short "Show code" snippets, Playground with controls
  <Component>.mdx          # what / when / example / limitations / accessibility
  <Component>.test.tsx     # every story passes axe; RSuite behaviour the docs rely on
```

Rules:

- Use the installed RSuite version's API only; check its type definitions in `node_modules/rsuite/esm/<Component>`.
- Don't wrap or re-implement RSuite components unless there's a clear MGS requirement.
- Brand changes go in `src/theme/mgs-theme.css` via `--rs-*` variables.

## Git workflow

- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, builds) must be green before merging.
- `dev` is merged into `main` for releases.
