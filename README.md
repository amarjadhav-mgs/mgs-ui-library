# MGS UI docs

MGS documentation for [RSuite 6](https://rsuitejs.com) components, built with Storybook. It shows how we use each
RSuite component: supported props, when to use them, accessibility notes and copyable examples.

This repo is **not a package**. Apps use RSuite directly.

## Using RSuite in an app

```bash
npm install rsuite
```

```tsx
// App entry (e.g. main.tsx)
import 'rsuite/dist/rsuite.css';

// Anywhere
import { Button } from 'rsuite';

<Button appearance="primary">Save</Button>;
```

Then copy the MGS theme, [`src/theme/mgs-theme.css`](src/theme/mgs-theme.css), into the app's global stylesheet
(after `rsuite.css`). It overrides RSuite's CSS variables for the MGS brand colors and fixes RSuite's default contrast
and focus-ring issues. Optional: `<CustomProvider theme="light | dark | high-contrast">` from `rsuite` switches themes.

## Developing the docs

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # Storybook at http://localhost:6006
```

| Script                    | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Storybook (docs + playgrounds)                  |
| `npm test`                | Story accessibility (axe) and behaviour tests   |
| `npm run test:watch`      | Tests in watch mode                             |
| `npm run lint`            | Lint with oxlint                                |
| `npm run format`          | Format with Prettier                            |
| `npm run typecheck`       | TypeScript check                                |
| `npm run build-storybook` | Build static Storybook into `storybook-static/` |

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
- Import components from `rsuite`. Don't wrap or re-implement them.
- Brand changes go in `src/theme/mgs-theme.css`, using RSuite's `--rs-*` variables.

## Git workflow

- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, Storybook build) must be green before merging.
- `dev` is merged into `main` for releases.
