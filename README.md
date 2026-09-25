# @mgs/ui

The MGS UI component library, built on [RSuite 6](https://rsuitejs.com). MGS owns the API, styles, docs and tests;
RSuite provides proven behaviour underneath. Apps use **only `@mgs/ui`**. The Storybook documents each component.

How the library is built, the design tokens and the API conventions are in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Using it in an app

```bash
npm install @mgs/ui
```

```tsx
// App entry (e.g. main.tsx)
import '@mgs/ui/styles.css'; // component styles + MGS theme

// Anywhere
import { Button } from '@mgs/ui';

<Button variant="primary">Save</Button>;
```

Optional: `<CustomProvider theme="light | dark | high-contrast">` from `@mgs/ui` switches themes.

### Available components

- **MGS components:** `Button`, `IconButton`
- **Icons:** `PlusIcon`, `EditIcon`, `TrashIcon`, `SearchIcon`, ... (see the Icons page in Storybook)
- **General (RSuite):** `ButtonGroup`, `ButtonToolbar`, `Badge`, `Avatar`, `AvatarGroup`
- **Input (RSuite):** `Input`, `InputGroup`, `Textarea`, `PasswordInput`
- **Date & time (RSuite):** `Calendar`, `DateInput`, `DatePicker`, `DateRangeInput`, `DateRangePicker`, `TimePicker`,
  `TimeRangePicker`, plus the `DateRange` type and date rules (`beforeToday`, `afterToday`, `allowedMaxDays`, ...)
- **Other (RSuite):** `CustomProvider`

Each component's `...Props` type is exported too. MGS components have their own API (see Storybook); RSuite
components keep RSuite's API.

### Theming

`styles.css` contains RSuite's styles plus the MGS design tokens and theme (`src/styles/`). Customize with the
`--mgs-*` tokens (for example `--mgs-color-primary`); never override `--rs-*` variables or `.rs-*` class selectors.
See [ARCHITECTURE.md → Styling](./ARCHITECTURE.md#styling).

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

First answer "What does MGS own here?" ([ARCHITECTURE.md](./ARCHITECTURE.md#what-does-mgs-own-here)). An MGS-owned
component or pattern follows the component structure and API conventions there. For an **RSuite re-export**:

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
- Don't wrap or re-implement RSuite components unless MGS owns something real (API, behaviour, accessibility, styling
  or a reusable pattern).
- Colours and other visual changes go in the tokens (`src/styles/tokens.scss`, `themes.scss`); only
  `src/styles/rsuite-bridge.scss` sets `--rs-*` variables.

## Git workflow

- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, builds) must be green before merging.
- `dev` is merged into `main` for releases.
