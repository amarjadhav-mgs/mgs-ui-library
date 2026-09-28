# @mgs/ui

The MGS UI component library for every MGS project. MGS owns every public API, plus the styles, docs and tests;
[RSuite 6](https://rsuitejs.com) provides proven behaviour underneath as an internal detail. Apps use **only
`@mgs/ui`**. The Storybook documents each component.

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

Wrap the app once in `<MgsProvider theme="light | dark | high-contrast" locale="en-GB | en-US">` from `@mgs/ui`: it
sets the theme, the language and the date/time formats (both props optional; defaults `light` and `en-GB`).

### Available components

- **MGS components:** `MgsProvider`, `Button`, `IconButton`, `VisuallyHidden`
- **Icons:** `PlusIcon`, `EditIcon`, `TrashIcon`, `SearchIcon`, ... (see the Icons page in Storybook)
- **Being migrated to an MGS API** (still RSuite's API for now; expect changes):
  - General: `ButtonGroup`, `ButtonToolbar`, `Badge`, `Avatar`, `AvatarGroup`
  - Input: `Input`, `InputGroup`, `Textarea`, `PasswordInput`
  - Date & time: `Calendar`, `DateInput`, `DatePicker`, `DateRangeInput`, `DateRangePicker`, `TimePicker`,
    `TimeRangePicker`, plus the `DateRange` type and date rules (`beforeToday`, `afterToday`, `allowedMaxDays`, ...)

Each component's `...Props` type is exported too. See
[ARCHITECTURE.md → Migrating the RSuite re-exports](./ARCHITECTURE.md#migrating-the-rsuite-re-exports) for the order,
and [docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md) for the roadmap covering every RSuite component.

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

Every component and pattern has an MGS API: never re-export from `rsuite`. Follow
[ARCHITECTURE.md → Adding a component](./ARCHITECTURE.md#adding-a-component): propose the API and get it approved, then
build it with the component structure, API conventions and documentation standard there. `npm run build` fails if a
public type references RSuite.

Rules:

- When building on RSuite, use the installed version's API only; check its type definitions in
  `node_modules/rsuite/esm/<Component>`.
- Apps, stories and docs import from `@mgs/ui`, never from `rsuite` directly.
- Colours and other visual changes go in the tokens (`src/styles/tokens.scss`, `themes.scss`); only
  `src/styles/rsuite-bridge.scss` sets `--rs-*` variables.

## Git workflow

- Branch from `dev` (`feat/...`, `fix/...`, `chore/...`), open a PR into `dev`.
- CI (typecheck, lint, format, tests, builds) must be green before merging.
- `dev` is merged into `main` for releases.
