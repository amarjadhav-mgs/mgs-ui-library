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

Wrap the app once in `<MgsProvider theme="light | dark | high-contrast" locale="en-GB | en-US | en-IN">` from
`@mgs/ui`: it sets the theme, the language, the date/time formats and number formatting (both props optional;
defaults `light` and `en-GB`).

### Available components

- **MGS components:** `MgsProvider`, `Button`, `IconButton`, `Input`, `Textarea`, `PasswordInput`, `NumberInput`,
  `InputGroup` (with `InputGroupAddon`, `InputGroupButton`), `Checkbox`, `CheckboxGroup`, `Radio`,
  `RadioGroup`, `VisuallyHidden`
- **Icons:** `PlusIcon`, `EditIcon`, `TrashIcon`, `SearchIcon`, ... (see the Icons page in Storybook)
- **Being migrated to an MGS API** (still RSuite's API for now; expect changes):
  - General: `ButtonGroup`, `ButtonToolbar`, `Badge`, `Avatar`, `AvatarGroup`
  - Date & time: `Calendar`, `DateInput`, `DatePicker`, `DateRangeInput`, `DateRangePicker`, `TimePicker`,
    `TimeRangePicker`, plus the `DateRange` type and date rules (`beforeToday`, `afterToday`, `allowedMaxDays`, ...)

Each component's `...Props` type is exported too. See
[ARCHITECTURE.md → Migrating the RSuite re-exports](./ARCHITECTURE.md#migrating-the-rsuite-re-exports) for the order,
and [docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md) for the roadmap covering every RSuite component.

### Theming

`styles.css` contains RSuite's styles plus the MGS design tokens and theme (`src/styles/`). Customize with the
`--mgs-*` tokens (for example `--mgs-color-primary`); never override `--rs-*` variables or `.rs-*` class selectors.
See [ARCHITECTURE.md → Styling](./ARCHITECTURE.md#styling).

### Requirements and compatibility

- **React 18 or later**, with `react` and `react-dom` installed by the app (peer dependencies).
- **ES modules only.** Vite, Next.js, webpack 5 and other modern bundlers work as they are. Jest in CommonJS mode needs
  `@mgs/ui` in `transformIgnorePatterns` exceptions (or use Vitest).
- ⚠️ **TypeScript: `skipLibCheck: true` is needed for now** (the default in Vite and Next.js templates). Some
  components are still RSuite re-exports, and RSuite 6.2.4's own type files reference types it doesn't ship: a test type
  (`Cannot find namespace 'Chai'`) and, without `@types/node`, Node's `NodeJS`. This goes away when the re-exports
  are migrated (phases 1 to 3 of [the plan](./docs/IMPLEMENTATION-PLAN.md)); `npm run test:consumer` checks that no
  other error appears.
- **Next.js App Router:** components are client components (`'use client'`) and work in Server Component pages. To
  avoid a flash of the light theme, set `data-theme` on `<html>` on the server: see MgsProvider → Server rendering in
  Storybook.
- **Content Security Policy:** no inline `<style>` tags are injected inside `MgsProvider`, so `style-src 'self'` works.

## Developing

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # Storybook at http://localhost:6006
```

| Script                    | What it does                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`             | Storybook (component docs + playgrounds)                                    |
| `npm test`                | Story accessibility (axe) and behaviour tests                               |
| `npm run test:watch`      | Tests in watch mode                                                         |
| `npm run lint`            | Lint with oxlint                                                            |
| `npm run format`          | Format with Prettier                                                        |
| `npm run typecheck`       | TypeScript check                                                            |
| `npm run build`           | Build the library into `dist/`                                              |
| `npm run build-storybook` | Build static Storybook into `storybook-static/`                             |
| `npm run test:consumer`   | Pack `dist/`, install it in a strict TypeScript app, typecheck and build it |
| `npm run changeset`       | Record a change for the next release                                        |

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
